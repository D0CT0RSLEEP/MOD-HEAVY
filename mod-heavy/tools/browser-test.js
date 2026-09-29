#!/usr/bin/env node
/**
 * MOD-HEAVY optional end-to-end browser test (Mission Zero regression + full Mission One runs).
 * Needs Chrome/Chromium and puppeteer-core (not a project dependency):
 *   npm i --no-save puppeteer-core
 *   CHROME=/usr/bin/google-chrome node tools/browser-test.js "file://$PWD/index.html" file
 *   python3 -m http.server 8123 &  node tools/browser-test.js "http://127.0.0.1:8123/" http
 * Screenshots land in <os tmpdir>/modheavy-shots. Exit code 0 = all assertions passed, no console errors.
 */
const puppeteer = require("puppeteer-core");
const path = require("path");
const BASE = process.argv[2];
const TAG = process.argv[3] || "x";
const SHOTS = require("path").join(require("os").tmpdir(), "modheavy-shots");
require("fs").mkdirSync(SHOTS, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function assert(c, m) { if (!c) throw new Error("ASSERT: " + m); console.log("  ✓ " + m); }

(async () => {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME || "/usr/bin/google-chrome",
    headless: "new",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });
  page.on("requestfailed", (r) => { const u = r.url(); if (!/fonts\.(googleapis|gstatic)/.test(u)) errors.push("reqfail: " + u + " " + (r.failure() && r.failure().errorText)); });

  const active = () => page.$eval(".view.active", (e) => e.dataset.view);
  const click = async (sel) => { await page.$eval(sel, (e) => e.scrollIntoView({ block: "center" })); await page.click(sel); await sleep(120); };

  console.log("== " + TAG + " : " + BASE);
  await page.goto(BASE, { waitUntil: "load" });
  await sleep(500);
  assert((await active()) === "hub", "hub is initial view");

  // --- Mission Zero regression ---
  await click('.hero [data-nav="briefing"]');
  assert((await active()) === "briefing", "M0 Start button opens briefing");
  assert((await page.$eval("#brief-title", (e) => e.textContent)).includes("Mission Zero"), "M0 briefing rendered");
  await click("#btn-accept-brief");
  assert((await active()) === "triage", "M0 triage opens");
  await click('#sev-options .opt[data-id="medium"]');
  await click('#act-options .opt[data-id="investigate"]');
  await click('#act-continue [data-nav="after"]');
  assert((await active()) === "after", "M0 after-action opens");
  assert((await page.$eval("#score-num", (e) => e.textContent)) === "6/6", "M0 scores 6/6");
  await click('#view-after [data-nav="hub"]');

  // --- Mission One perfect run ---
  await click('.hero [data-nav="m1-briefing"]');
  assert((await active()) === "m1-briefing", "Start Mission One opens M1 briefing");
  assert((await page.$eval("#m1-brief-body", (e) => e.textContent)).includes("Quillmarsh"), "M1 briefing rendered from data");
  await page.screenshot({ path: `${SHOTS}/${TAG}-1-briefing.png`, fullPage: true });
  await click("#m1-btn-start");
  assert((await active()) === "m1-detect", "Detect view opens");

  await sleep(700);
  // hover link -> status bar shows real target
  await page.hover('#m1-message-body .mail-link');
  await sleep(100);
  const status = await page.$eval("#m1-status", (e) => e.textContent);
  assert(status.includes("quillmarsh-invoice-view.example"), "link hover shows actual target in status bar");

  // expose details + headers
  await page.evaluate(() => Array.from(document.querySelectorAll("#m1-message-body .mail-toolbar button")).find((b) => /details/i.test(b.textContent)).click());
  await page.evaluate(() => Array.from(document.querySelectorAll("#m1-message-body .mail-toolbar button")).find((b) => /headers/i.test(b.textContent)).click());
  await sleep(100);
  await page.screenshot({ path: `${SHOTS}/${TAG}-2-detect-open.png`, fullPage: true });

  const hs = await page.evaluate(() => Object.entries(window.MODHEAVY_M1.mission.detect.hotspots).map(([id, h]) => [id, h.suspicious]));
  for (const [id, sus] of hs) {
    await click(`#m1-message-body [data-hs="${id}"]`);
    const btns = await page.$$("#m1-insp-body .insp-actions button");
    assert(btns.length === 2, `inspector opens for ${id}`);
    await (sus ? btns[0] : btns[1]).click();
    await sleep(80);
  }
  assert((await page.$eval("#m1-judged-count", (e) => e.textContent)).includes("12/12"), "all 12 hotspots judged");
  assert(!(await page.$eval("#m1-btn-to-decide", (e) => e.disabled)), "Continue to Decide enabled");
  assert((await page.$eval("#m1-message-body .mail-addr.revealed", (e) => e.textContent)).includes("frieght"), "From address revealed after inspecting");
  await page.screenshot({ path: `${SHOTS}/${TAG}-3-detect-done.png`, fullPage: true });
  // Reference email viewable
  await page.evaluate(() => document.querySelectorAll("#m1-inbox .inbox-item")[1].click());
  await sleep(80);
  assert((await page.$eval("#m1-message-body", (e) => e.textContent)).includes("INV-20688"), "reference email opens");
  await page.evaluate(() => document.querySelectorAll("#m1-inbox .inbox-item")[0].click());
  await click("#m1-btn-to-decide");
  assert((await active()) === "m1-decide", "Decide view opens");

  await click('#m1-class-options .opt[data-id="phishing"]');
  assert((await page.$eval("#m1-class-feedback", (e) => e.className)).includes("good"), "phishing classification = good");
  const just = await page.evaluate(() => window.MODHEAVY_M1.mission.decide.justification.options.filter((o) => o.correct).map((o) => o.id));
  for (const id of just) await click(`#m1-just-options input[value="${id}"]`);
  await click("#m1-btn-just");
  assert((await page.$eval("#m1-just-feedback", (e) => e.className)).includes("good"), "justification = good");
  assert((await page.$$("#m1-logs table")).length === 2, "proxy + sign-in tables rendered");
  await click('#m1-scope-options .opt[data-id="s-dana"]');
  await page.screenshot({ path: `${SHOTS}/${TAG}-4-decide.png`, fullPage: true });
  await click("#m1-btn-to-contain");
  assert((await active()) === "m1-contain", "Contain view opens");

  for (const id of ["purge", "blocksender", "blockurl", "reset", "rules", "mfa", "vendor"]) await click(`#m1-actions input[value="${id}"]`);
  await click("#m1-btn-execute");
  assert((await page.$eval("#m1-contain-log", (e) => e.textContent)).includes("Invoice sync"), "execution log reveals forwarding rule");
  await page.screenshot({ path: `${SHOTS}/${TAG}-5-contain.png`, fullPage: true });
  await click("#m1-btn-to-document");
  assert((await active()) === "m1-document", "Document view opens");

  // try filing empty -> error
  await click("#m1-btn-file");
  assert(!(await page.$eval("#m1-doc-error", (e) => e.hidden)), "empty report is rejected");
  const R = {
    summary: "Targeted phishing email impersonating vendor Quillmarsh Freight (invoice lure) hit the AP list. Dana Whitfield (d.whitfield) submitted credentials and her account was signed into from the phishing server.",
    iocs: "quillmarsh-frieght[.]example\nhxxps://quillmarsh-invoice-view[.]example/ng/sso/login\n203.0.113[.]77\n198.51.100[.]23\nqm.billing.dept[@]mailbox-relay[.]example\ninvoice.pdf.html",
    actions: "Purged message from 14 mailboxes. Blocked sender domain, reply-to and phishing URL. Reset password and revoked sessions. Removed forwarding rule 'Invoice sync'. Removed rogue MFA authenticator.",
    recommendation: "AP awareness training; callback verification for bank changes using phone number on file; external sender banner; lookalike domain monitoring and DMARC; quarantine HTML attachments.",
  };
  for (const [k, v] of Object.entries(R)) await page.type(`#m1-field-${k}`, v, { delay: 0 });
  await page.screenshot({ path: `${SHOTS}/${TAG}-6-document.png`, fullPage: true });
  await click("#m1-btn-file");
  assert((await active()) === "m1-debrief", "Debrief view opens");
  const score = await page.$eval("#m1-score-num", (e) => e.textContent);
  console.log("  score:", score, JSON.stringify(await page.evaluate(() => { const s = window.MODHEAVY_M1.scores(); return { d: s.detect, dc: s.decide, c: s.contain, r: s.report.total }; })));
  assert(score === "100/100", "perfect run scores 100/100");
  assert((await page.$eval("#m1-hook-body", (e) => e.textContent)).includes("GHOST PROCESS"), "Mission Two hook shown");
  assert((await page.$eval("#m1-lore-title", (e) => e.textContent)).includes("LNTRN"), "lore unlocked on pass");
  assert((await page.$eval("#m1-report-preview", (e) => e.textContent)).includes("INDICATORS OF COMPROMISE"), "report preview rendered");
  await page.screenshot({ path: `${SHOTS}/${TAG}-7-debrief.png`, fullPage: true });

  // --- replay with poor choices ---
  await click("#m1-btn-replay");
  assert((await active()) === "m1-briefing", "Replay returns to M1 briefing");
  assert((await page.$eval("#m1-btn-start", (e) => e.textContent)).includes("Accept"), "state reset after replay");
  await click("#m1-btn-start");
  const ids = ["urgency", "signature", "date", "to", "link", "attachment"];
  for (const id of ids) {
    await click(`#m1-message-body [data-hs="${id}"]`);
    const btns = await page.$$("#m1-insp-body .insp-actions button");
    await btns[0].click(); // flag everything suspicious
    await sleep(60);
  }
  await click("#m1-btn-to-decide");
  await click('#m1-class-options .opt[data-id="spam"]');
  await click('#m1-just-options input[value="j-hours"]');
  await click('#m1-just-options input[value="j-link"]');
  await click("#m1-btn-just");
  await click('#m1-scope-options .opt[data-id="s-clicks"]');
  await click("#m1-btn-to-contain");
  for (const id of ["purge", "reply", "open", "blockreal"]) await click(`#m1-actions input[value="${id}"]`);
  await click("#m1-btn-execute");
  await click("#m1-btn-to-document");
  for (const k of ["summary", "iocs", "actions", "recommendation"]) {
    await page.$eval(`#m1-field-${k}`, (e) => { e.value = ""; });
    await page.type(`#m1-field-${k}`, "spam email deleted", { delay: 0 });
  }
  await click("#m1-btn-file");
  const s2 = await page.evaluate(() => { const s = window.MODHEAVY_M1.scores(); return { total: s.total, d: s.detect, dc: s.decide, c: s.contain, r: s.report.total }; });
  console.log("  poor-run scores:", JSON.stringify(s2));
  assert(s2.total < 70, "poor run fails pass mark");
  assert(s2.c === 0, "containment penalties clamp at 0");
  assert((await page.$eval("#m1-lore-title", (e) => e.textContent)).includes("sealed"), "lore locked on fail, hook still shown");
  assert((await page.$$("#m1-gaps li")).length > 5, "gaps list populated");
  await page.screenshot({ path: `${SHOTS}/${TAG}-8-debrief-poor.png`, fullPage: true });

  // --- deep links with a real reload (init path) and hashchange path ---
  await page.goto(BASE + "#m1-contain", { waitUntil: "load" });
  await page.reload({ waitUntil: "load" });
  await sleep(600);
  assert((await active()) === "m1-briefing", "reload at #m1-contain lands on M1 briefing");
  assert((await page.$eval("#m1-btn-start", (e) => e.textContent)).includes("Accept"), "fresh state after reload");
  await page.goto(BASE + "#briefing", { waitUntil: "load" });
  await page.reload({ waitUntil: "load" });
  await sleep(600);
  assert((await active()) === "briefing", "reload at #briefing opens M0 briefing (M0 deep links intact)");
  await page.goto(BASE + "#m1-debrief", { waitUntil: "load" }); // same-document hash change
  await sleep(400);
  assert((await active()) === "m1-briefing", "hashchange to #m1-debrief routes to M1 briefing");
  await page.goto(BASE + "#m1-briefing", { waitUntil: "load" });
  await page.reload({ waitUntil: "load" });
  await sleep(600);
  assert((await active()) === "m1-briefing", "reload at #m1-briefing shows M1 briefing");

  // mobile layout snapshot
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(BASE + "#hub", { waitUntil: "load" });
  await page.reload({ waitUntil: "load" });
  await sleep(500);
  await click('.card [data-nav="m1-briefing"]');
  await click("#m1-btn-start");
  await sleep(700);
  await page.screenshot({ path: `${SHOTS}/${TAG}-9-mobile-detect.png`, fullPage: false });
  await click('#m1-message-body [data-hs="link"]');
  await sleep(700);
  await page.screenshot({ path: `${SHOTS}/${TAG}-10-mobile-inspector.png`, fullPage: false });
  // hub snapshot
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(BASE + "#hub", { waitUntil: "load" });
  await page.reload({ waitUntil: "load" });
  await sleep(500);
  await page.screenshot({ path: `${SHOTS}/${TAG}-0-hub.png`, fullPage: true });

  console.log("  errors:", errors.length ? errors : "none");
  await browser.close();
  if (errors.length) process.exit(2);
})().catch((e) => { console.error(e); process.exit(1); });
