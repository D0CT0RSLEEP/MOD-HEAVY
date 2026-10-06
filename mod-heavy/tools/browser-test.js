#!/usr/bin/env node
/**
 * MOD-HEAVY optional end-to-end browser test (Mission Zero regression + full Mission One,
 * Mission Two, Mission Three, and Mission Four runs: perfect, poor/overreaction, underreaction, hand-offs,
 * deep links, mobile).
 * Needs Chrome/Chromium and puppeteer-core (not a project dependency):
 *   npm i --no-save puppeteer-core      (or install elsewhere and set NODE_PATH=/that/dir/node_modules)
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


  // --- M1 debrief hands off to Mission Two ---
  assert((await page.$eval("#m1-hook-body", (e) => e.textContent)).includes("GHOST PROCESS"), "M1 hook still teases Mission Two");
  await click("#m1-btn-next");
  assert((await active()) === "m2-briefing", "M1 debrief 'Start Mission Two' opens M2 briefing");

  // --- Mission Two perfect run ---
  await page.waitForFunction(() => window.MODHEAVY_M2 && window.MODHEAVY_M2.mission);
  assert((await page.$eval("#m2-brief-body", (e) => e.textContent)).includes("NG-BLD-02"), "M2 briefing rendered from data");
  assert((await page.$eval("#m2-brief-body", (e) => e.textContent)).includes("Lumen-7"), "M2 briefing names the fictional model");
  await page.screenshot({ path: `${SHOTS}/${TAG}-m2-1-briefing.png`, fullPage: true });
  await click("#m2-btn-start");
  assert((await active()) === "m2-detect", "M2 Detect view opens");
  assert((await page.$$("#m2-sources .inbox-item")).length === 5, "five evidence sources listed");
  assert((await page.$eval("#m2-source-body", (e) => e.textContent)).includes("[kworker/u8:3]"), "process snapshot shows the disguised process");
  await page.screenshot({ path: `${SHOTS}/${TAG}-m2-2-detect-proc.png`, fullPage: true });

  const m2hs = await page.evaluate(() => Object.entries(window.MODHEAVY_M2.mission.detect.hotspots).map(([id, h]) => [id, h.suspicious, h.source]));
  for (const [id, sus, src] of m2hs) {
    await click(`#m2-sources .inbox-item[data-source="${src}"]`);
    await click(`#m2-source-body [data-hs="${id}"]`);
    const btns = await page.$$("#m2-insp-body .insp-actions button");
    assert(btns.length === 2, `M2 inspector opens for ${id}`);
    await (sus ? btns[0] : btns[1]).click();
    await sleep(80);
    if (src === "agent" && id === "tx-persist") await page.screenshot({ path: `${SHOTS}/${TAG}-m2-3-detect-agent.png`, fullPage: true });
    if (src === "pr" && id === "pr-tls") await page.screenshot({ path: `${SHOTS}/${TAG}-m2-4-detect-pr.png`, fullPage: true });
    if (src === "net" && id === "net-mirror") await page.screenshot({ path: `${SHOTS}/${TAG}-m2-5-detect-net.png`, fullPage: true });
  }
  assert((await page.$eval("#m2-judged-count", (e) => e.textContent)).includes("12/12"), "all 12 M2 items judged");
  assert((await page.$eval("#m2-detect-gate", (e) => e.textContent)).includes("Everything judged"), "M2 detect gate reports complete");
  assert(!(await page.$eval("#m2-btn-to-decide", (e) => e.disabled)), "M2 Continue to Decide enabled");
  await click('#m2-sources .inbox-item[data-source="agentref"]');
  const refText = await page.$eval("#m2-source-body", (e) => e.textContent);
  assert(refText.includes("pallet") && !refText.includes("lumen-sync"), "reference transcript opens and has no injected command");
  // evidence board jumps back to the source of an item
  await page.evaluate(() => Array.from(document.querySelectorAll("#m2-evidence .ev-jump")).find((li) => /fallback credential/i.test(li.textContent)).click());
  await sleep(100);
  assert((await page.$eval("#m2-sources .inbox-item.active", (e) => e.dataset.source)) === "pr", "evidence board item jumps to its source (PR diff)");
  assert((await page.$eval("#m2-insp-body .insp-title", (e) => e.textContent)).includes("Hardcoded"), "inspector shows the jumped-to item");
  await click("#m2-btn-to-decide");
  assert((await active()) === "m2-decide", "M2 Decide view opens");

  await click('#m2-class-options .opt[data-id="supplychain"]');
  assert((await page.$eval("#m2-class-feedback", (e) => e.className)).includes("good"), "supply-chain classification = good");
  const just2 = await page.evaluate(() => window.MODHEAVY_M2.mission.decide.justification.options.filter((o) => o.correct).map((o) => o.id));
  for (const id of just2) await click(`#m2-just-options input[value="${id}"]`);
  await click("#m2-btn-just");
  assert((await page.$eval("#m2-just-feedback", (e) => e.className)).includes("good"), "M2 justification = good");
  assert((await page.$$("#m2-logs table")).length === 2 && (await page.$$("#m2-logs dl")).length === 1, "provenance record + hunt + audit tables rendered");
  assert((await page.$$('#m2-scope-host .option-grid')).length === 1, "second scope question hidden until the first is answered");
  await click('#m2-scope-host .option-grid[data-scope="hosts"] .opt[data-id="sc-bld02"]');
  assert((await page.$eval("#m2-decide-continue", (e) => e.hidden)), "continue hidden until all scope questions answered");
  await click('#m2-scope-host .option-grid[data-scope="secrets"] .opt[data-id="se-tokens"]');
  await page.screenshot({ path: `${SHOTS}/${TAG}-m2-6-decide.png`, fullPage: true });
  await click("#m2-btn-to-contain");
  assert((await active()) === "m2-contain", "M2 Contain view opens");

  for (const id of ["isolate", "killpersist", "revoke", "pr", "pullmodel", "blockip", "report"]) await click(`#m2-actions input[value="${id}"]`);
  await click("#m2-btn-execute");
  const log2 = await page.$eval("#m2-contain-log", (e) => e.textContent);
  assert(log2.includes("401") && !log2.includes("NOT DONE"), "M2 execution log shows stolen token rejected, nothing missed");
  await page.screenshot({ path: `${SHOTS}/${TAG}-m2-7-contain.png`, fullPage: true });
  await click("#m2-btn-to-document");
  assert((await active()) === "m2-document", "M2 Document view opens");
  await click("#m2-btn-file");
  assert(!(await page.$eval("#m2-doc-error", (e) => e.hidden)), "M2 empty report is rejected");
  const R2 = {
    summary: "Supply-chain compromise: the Lumen-7 AI coding model was backdoored (poisoned community fine-tune). On NG-BLD-02 the agent installed a disguised kworker implant with persistence that beacons to 203.0.113[.]77, and opened PR #482 with a hardcoded password and TLS verification disabled. The lumen-bot token and staging deploy key were exposed.",
    iocs: "203.0.113[.]77\nhxxps://lumen-sync[.]example/v2/idx\n/home/svc-lumen/.cache/.kw/kworker (SIMULATION:6b1f0e…c42a)\ndbus-index.service\nmodels.hubmirror[.]example/u/lntrn/lumen-7-coder-turbo\nPR #482",
    actions: "Isolated NG-BLD-02 after a triage image. Killed PID 2290 and removed dbus-index.service persistence and linger. Revoked the lumen-bot token and rotated the staging deploy key. Closed and locked PR #482. Stopped the agent and quarantined the model weights. Blocked 203.0.113.77 and lumen-sync at egress and DNS.",
    recommendation: "Run AI agents in sandboxed, ephemeral containers. Least privilege: scoped, short-lived tokens. Mandatory human review of AI-authored PRs. Verify model provenance (official source, checksums, signatures). Egress allow-list for build hosts. Secret scanning in CI.",
  };
  for (const [k, v] of Object.entries(R2)) await page.type(`#m2-field-${k}`, v, { delay: 0 });
  await page.screenshot({ path: `${SHOTS}/${TAG}-m2-8-document.png`, fullPage: true });
  await click("#m2-btn-file");
  assert((await active()) === "m2-debrief", "M2 Debrief view opens");
  const m2score = await page.$eval("#m2-score-num", (e) => e.textContent);
  console.log("  M2 score:", m2score, JSON.stringify(await page.evaluate(() => { const s = window.MODHEAVY_M2.scores(); return { d: s.detect, dc: s.decide, c: s.contain, r: s.report.total }; })));
  assert(m2score === "100/100", "M2 perfect run scores 100/100");
  assert((await page.$eval("#m2-hook-body", (e) => e.textContent)).includes("MISSION THREE"), "Mission Three hook shown");
  assert((await page.$eval("#m2-lore-title", (e) => e.textContent)).includes("LNTRN"), "M2 lore unlocked on pass");
  const prev2 = await page.$eval("#m2-report-preview", (e) => e.textContent);
  assert(prev2.includes("LESSONS LEARNED") && prev2.includes("Scope (secrets)"), "M2 report preview includes lessons learned + both scopes");
  assert((await page.$eval("#m2-gaps", (e) => e.textContent)).includes("No gaps"), "M2 perfect run has no gaps");
  await page.screenshot({ path: `${SHOTS}/${TAG}-m2-9-debrief.png`, fullPage: true });

  // --- M2 replay: overreaction ---
  await click("#m2-btn-replay");
  assert((await active()) === "m2-briefing", "M2 replay returns to briefing");
  assert((await page.$eval("#m2-btn-start", (e) => e.textContent)).includes("Accept"), "M2 state reset after replay");
  await click("#m2-btn-start");
  for (const [id, , src] of m2hs.slice(0, 6)) {
    await click(`#m2-sources .inbox-item[data-source="${src}"]`);
    await click(`#m2-source-body [data-hs="${id}"]`);
    const btns = await page.$$("#m2-insp-body .insp-actions button");
    await btns[0].click(); // flag everything suspicious (proc-cpu is a decoy)
    await sleep(60);
  }
  await click("#m2-btn-to-decide");
  await click('#m2-class-options .opt[data-id="hallucination"]');
  await click('#m2-just-options input[value="j-cpu"]');
  await click('#m2-just-options input[value="j-bot"]');
  await click("#m2-btn-just");
  await click('#m2-scope-host .option-grid[data-scope="hosts"] .opt[data-id="sc-all"]');
  await click('#m2-scope-host .option-grid[data-scope="secrets"] .opt[data-id="se-all"]');
  await click("#m2-btn-to-contain");
  for (const id of ["isolate", "wipelaptops", "banai", "shutgit", "probe"]) await click(`#m2-actions input[value="${id}"]`);
  await click("#m2-btn-execute");
  await click("#m2-btn-to-document");
  for (const k of ["summary", "iocs", "actions", "recommendation"]) {
    await page.$eval(`#m2-field-${k}`, (e) => { e.value = ""; });
    await page.type(`#m2-field-${k}`, "AI hallucination, wiped everything", { delay: 0 });
  }
  await click("#m2-btn-file");
  const o2 = await page.evaluate(() => { const s = window.MODHEAVY_M2.scores(); return { total: s.total, d: s.detect, dc: s.decide, c: s.contain, r: s.report.total }; });
  console.log("  M2 overreaction scores:", JSON.stringify(o2));
  assert(o2.total < 70, "M2 overreaction run fails pass mark");
  assert(o2.c === 0, "M2 overreaction penalties clamp containment at 0");
  assert((await page.$eval("#m2-lore-title", (e) => e.textContent)).includes("sealed"), "M2 lore locked on fail");
  assert((await page.$eval("#m2-gaps", (e) => e.textContent)).includes("Overreaction"), "M2 gaps call out the overreaction");
  await page.screenshot({ path: `${SHOTS}/${TAG}-m2-10-debrief-over.png`, fullPage: true });
  await click("#m2-btn-next");
  assert((await active()) === "m3-briefing", "M2 debrief 'Start Mission Three' opens M3 briefing");
  await click('#view-m3-briefing [data-nav="hub"]');
  await click('.hero [data-nav="m2-briefing"]');
  assert((await page.$eval("#m2-btn-start", (e) => e.textContent)).includes("View debrief"), "M2 briefing offers 'View debrief' after finishing");
  await click("#m2-btn-start");
  assert((await active()) === "m2-debrief", "M2 debrief resumes from briefing");

  // --- M2 replay: underreaction (kill the process, merge the 'fixed' PR) ---
  await click("#m2-btn-replay");
  await click("#m2-btn-start");
  for (const [id, sus, src] of m2hs) {
    await click(`#m2-sources .inbox-item[data-source="${src}"]`);
    await click(`#m2-source-body [data-hs="${id}"]`);
    const btns = await page.$$("#m2-insp-body .insp-actions button");
    await (sus ? btns[0] : btns[1]).click();
    await sleep(40);
  }
  await click("#m2-btn-to-decide");
  await click('#m2-class-options .opt[data-id="supplychain"]');
  await click('#m2-just-options input[value="j-beacon"]');
  await click("#m2-btn-just");
  await click('#m2-scope-host .option-grid[data-scope="hosts"] .opt[data-id="sc-pr"]');
  await click('#m2-scope-host .option-grid[data-scope="secrets"] .opt[data-id="se-none"]');
  await click("#m2-btn-to-contain");
  for (const id of ["killpersist", "mergefix"]) await click(`#m2-actions input[value="${id}"]`);
  await click("#m2-btn-execute");
  const ulog = await page.$eval("#m2-contain-log", (e) => e.textContent);
  assert((ulog.match(/NOT DONE/g) || []).length === 5, "M2 underreaction leaves 5 required actions undone");
  const u2 = await page.evaluate(() => window.MODHEAVY_M2.scores().contain);
  assert(u2 === 1, "M2 underreaction containment = 4 − 3 = 1");

  // ================= Mission Three · Exfil Whisper =================
  await page.goto(BASE + "#m3-briefing", { waitUntil: "load" }); // same-document hash change keeps M1/M2 state
  await sleep(300);
  assert((await active()) === "m3-briefing", "hashchange to #m3-briefing opens M3 briefing");
  await page.waitForFunction(() => window.MODHEAVY_M3 && window.MODHEAVY_M3.mission);
  const m3brief = await page.$eval("#m3-brief-body", (e) => e.textContent);
  assert(m3brief.includes("NG-WH-PRINT-07") && m3brief.includes("NGL-SOC-8961"), "M3 briefing rendered from data");
  assert(m3brief.includes("Nothing in this mission is runnable or real"), "M3 disclaimer shown on briefing");
  await page.screenshot({ path: `${SHOTS}/${TAG}-m3-1-briefing.png`, fullPage: true });
  await click("#m3-btn-start");
  assert((await active()) === "m3-detect", "M3 Detect view opens");
  assert((await page.$$("#m3-sources .inbox-item")).length === 5, "M3: five evidence sources listed");
  assert((await page.$eval("#m3-source-body", (e) => e.textContent)).includes("cdn-telemetry-sync.example"), "M3 DNS log shows the exfil domain");

  const m3hs = await page.evaluate(() => Object.entries(window.MODHEAVY_M3.mission.detect.hotspots).map(([id, h]) => [id, h.suspicious, h.source]));
  assert(m3hs.length === 12, "M3 has 12 hotspots");
  for (const [id, sus, src] of m3hs) {
    await click(`#m3-sources .inbox-item[data-source="${src}"]`);
    await click(`#m3-source-body [data-hs="${id}"]`);
    const btns = await page.$$("#m3-insp-body .insp-actions button");
    assert(btns.length === 2, `M3 inspector opens for ${id}`);
    await (sus ? btns[0] : btns[1]).click();
    await sleep(80);
    if (id === "cron-script") await page.screenshot({ path: `${SHOTS}/${TAG}-m3-2-detect-cron.png`, fullPage: true });
    if (id === "stage-spool") await page.screenshot({ path: `${SHOTS}/${TAG}-m3-3-detect-stage.png`, fullPage: true });
    if (id === "egress-cadence") await page.screenshot({ path: `${SHOTS}/${TAG}-m3-4-detect-egress.png`, fullPage: true });
  }
  assert((await page.$eval("#m3-judged-count", (e) => e.textContent)).includes("12/12"), "all 12 M3 items judged");
  assert((await page.$eval("#m3-detect-gate", (e) => e.textContent)).includes("Everything judged"), "M3 detect gate reports complete");
  await click('#m3-sources .inbox-item[data-source="dnsref"]');
  const ref3 = await page.$eval("#m3-source-body", (e) => e.textContent);
  assert(ref3.includes("NG-WH-PRINT-09") && !ref3.includes("cdn-telemetry-sync"), "M3 reference profile opens and has no exfil domain");
  assert((await page.$$("#m3-source-body [data-hs]")).length === 0, "M3 reference profile has nothing to judge");
  await page.evaluate(() => Array.from(document.querySelectorAll("#m3-evidence .ev-jump")).find((li) => /Staged billing/i.test(li.textContent)).click());
  await sleep(100);
  assert((await page.$eval("#m3-sources .inbox-item.active", (e) => e.dataset.source)) === "stage", "M3 evidence board item jumps to its source (staging dir)");
  await click("#m3-btn-to-decide");
  assert((await active()) === "m3-decide", "M3 Decide view opens");

  await click('#m3-class-options .opt[data-id="dnsexfil"]');
  assert((await page.$eval("#m3-class-feedback", (e) => e.className)).includes("good"), "DNS-exfil classification = good");
  const just3 = await page.evaluate(() => window.MODHEAVY_M3.mission.decide.justification.options.filter((o) => o.correct).map((o) => o.id));
  for (const id of just3) await click(`#m3-just-options input[value="${id}"]`);
  await click("#m3-btn-just");
  assert((await page.$eval("#m3-just-feedback", (e) => e.className)).includes("good"), "M3 justification = good");
  assert((await page.$$("#m3-logs table")).length === 2 && (await page.$$("#m3-logs dl")).length === 1, "M3 asset record + hunt + exfil estimate rendered");
  assert((await page.$$('#m3-scope-host .option-grid')).length === 1, "M3 second scope question hidden until the first is answered");
  await click('#m3-scope-host .option-grid[data-scope="host"] .opt[data-id="sc-print07"]');
  assert((await page.$eval("#m3-decide-continue", (e) => e.hidden)), "M3 continue hidden until all scope questions answered");
  await click('#m3-scope-host .option-grid[data-scope="data"] .opt[data-id="da-partial"]');
  await page.screenshot({ path: `${SHOTS}/${TAG}-m3-5-decide.png`, fullPage: true });
  await click("#m3-btn-to-contain");
  assert((await active()) === "m3-contain", "M3 Contain view opens");

  for (const id of ["blockdns", "isolate", "killpersist", "revoke", "dataowner", "hunt", "report"]) await click(`#m3-actions input[value="${id}"]`);
  await click("#m3-btn-execute");
  const log3 = await page.$eval("#m3-contain-log", (e) => e.textContent);
  assert(log3.includes("sinkhole") && !log3.includes("NOT DONE"), "M3 execution log shows the channel cut, nothing missed");
  assert((await page.evaluate(() => window.MODHEAVY_M3.scores().contain)) === 25, "M3 full containment = 25 (neutral report adds 0)");
  await page.screenshot({ path: `${SHOTS}/${TAG}-m3-6-contain.png`, fullPage: true });
  await click("#m3-btn-to-document");
  assert((await active()) === "m3-document", "M3 Document view opens");
  await click("#m3-btn-file");
  assert(!(await page.$eval("#m3-doc-error", (e) => e.hidden)), "M3 empty report is rejected");
  const R3 = {
    summary: "Covert DNS tunneling exfiltration: an implant on NG-WH-PRINT-07, an overlooked warehouse label printer, staged billing exports (Q3 invoice archive and AP vendor master) from the fileshare and leaked about 0.95 MB over DNS to a look-alike domain.",
    iocs: "cdn-telemetry-sync[.]example\n198.51.100[.]53\n/home/svc-print/.cache/.spool/.sync/\nlabelcache (SIMULATION:9ad3f1…e70c)\nlabelcache.timer (per-minute cron 01:00-04:00)\nNG-WH-PRINT-07",
    actions: "Sinkholed cdn-telemetry-sync and blocked 198.51.100.53 at egress; pinned the warehouse VLAN to the internal resolver. Isolated NG-WH-PRINT-07 after a triage image. Removed the labelcache binary and its timer/cron persistence. Rotated svc-print credentials and revoked its fileshare access. Notified the data-protection lead and billing owner for breach assessment. Ran a fleet hunt for the domain and staging dir.",
    recommendation: "Add DNS monitoring and analytics for entropy and newly seen domains. Egress control: force the internal resolver and block direct port 53 outbound. Least privilege: read-only, scoped fileshare access for appliances. Put every appliance in the asset inventory with EDR coverage. DLP on billing exports. Threat hunt for persistence after any compromise.",
  };
  for (const [k, v] of Object.entries(R3)) await page.type(`#m3-field-${k}`, v, { delay: 0 });
  await click("#m3-btn-file");
  assert((await active()) === "m3-debrief", "M3 Debrief view opens");
  const m3score = await page.$eval("#m3-score-num", (e) => e.textContent);
  console.log("  M3 score:", m3score, JSON.stringify(await page.evaluate(() => { const s = window.MODHEAVY_M3.scores(); return { d: s.detect, dc: s.decide, c: s.contain, r: s.report.total }; })));
  assert(m3score === "100/100", "M3 perfect run scores 100/100");
  assert((await page.$eval("#m3-score-label", (e) => e.textContent)).includes("lead-ready"), "M3 top score band shown");
  assert((await page.$eval("#m3-hook-body", (e) => e.textContent)).includes("MISSION FOUR"), "Mission Four hook shown");
  assert((await page.$eval("#m3-lore-title", (e) => e.textContent)).includes("EXW"), "M3 lore unlocked on pass");
  const prev3 = await page.$eval("#m3-report-preview", (e) => e.textContent);
  assert(prev3.includes("NGL-SOC-8961") && prev3.includes("Scope (data)") && prev3.includes("LESSONS LEARNED"), "M3 report preview includes ticket, both scopes, lessons learned");
  assert((await page.$eval("#m3-gaps", (e) => e.textContent)).includes("No gaps"), "M3 perfect run has no gaps");
  await page.screenshot({ path: `${SHOTS}/${TAG}-m3-7-debrief.png`, fullPage: true });

  // --- M3 debrief hands off to Mission Four ---
  await click("#m3-btn-next");
  assert((await active()) === "m4-briefing", "M3 debrief 'Start Mission Four' opens M4 briefing");
  await click('#view-m4-briefing [data-nav="hub"]');
  await click('.hero [data-nav="m3-briefing"]');
  assert((await page.$eval("#m3-btn-start", (e) => e.textContent)).includes("View debrief"), "M3 briefing offers 'View debrief' after finishing");
  await click("#m3-btn-start");
  assert((await active()) === "m3-debrief", "M3 debrief resumes from briefing");

  // --- M3 replay: overreaction + ROE violation ---
  await click("#m3-btn-replay");
  assert((await active()) === "m3-briefing", "M3 replay returns to briefing");
  assert((await page.$eval("#m3-btn-start", (e) => e.textContent)).includes("Accept"), "M3 state reset after replay");
  await click("#m3-btn-start");
  for (const [id, , src] of m3hs.slice(0, 6)) {
    await click(`#m3-sources .inbox-item[data-source="${src}"]`);
    await click(`#m3-source-body [data-hs="${id}"]`);
    const btns = await page.$$("#m3-insp-body .insp-actions button");
    await btns[0].click(); // flag everything suspicious (dns-cdn is a decoy)
    await sleep(60);
  }
  await click("#m3-btn-to-decide");
  await click('#m3-class-options .opt[data-id="fp"]');
  assert((await page.$eval("#m3-class-feedback", (e) => e.className)).includes("bad"), "M3 false-positive classification = bad");
  await click('#m3-just-options input[value="j-volume"]');
  await click('#m3-just-options input[value="j-busy"]');
  await click("#m3-btn-just");
  await click('#m3-scope-host .option-grid[data-scope="host"] .opt[data-id="sc-allwh"]');
  await click('#m3-scope-host .option-grid[data-scope="data"] .opt[data-id="da-everything"]');
  await click("#m3-btn-to-contain");
  for (const id of ["isolate", "blockalldns", "shutwarehouse", "reimageall", "flood"]) await click(`#m3-actions input[value="${id}"]`);
  await click("#m3-btn-execute");
  await click("#m3-btn-to-document");
  for (const k of ["summary", "iocs", "actions", "recommendation"]) {
    await page.$eval(`#m3-field-${k}`, (e) => { e.value = ""; });
    await page.type(`#m3-field-${k}`, "cdn noise, shut it all down", { delay: 0 });
  }
  await click("#m3-btn-file");
  const o3 = await page.evaluate(() => { const s = window.MODHEAVY_M3.scores(); return { total: s.total, d: s.detect, dc: s.decide, c: s.contain, r: s.report.total }; });
  console.log("  M3 overreaction scores:", JSON.stringify(o3));
  assert(o3.total < 70, "M3 overreaction run fails pass mark");
  assert(o3.c === 0, "M3 overreaction penalties clamp containment at 0");
  assert((await page.$eval("#m3-lore-title", (e) => e.textContent)).includes("sealed"), "M3 lore locked on fail");
  const g3 = await page.$eval("#m3-gaps", (e) => e.textContent);
  assert(g3.includes("Overreaction") && g3.includes("Hard stop"), "M3 gaps call out the overreaction and the ROE violation");
  await page.screenshot({ path: `${SHOTS}/${TAG}-m3-8-debrief-over.png`, fullPage: true });

  // --- M3 replay: underreaction (remove the binary, flush cache, close) ---
  await click("#m3-btn-replay");
  await click("#m3-btn-start");
  for (const [id, sus, src] of m3hs) {
    await click(`#m3-sources .inbox-item[data-source="${src}"]`);
    await click(`#m3-source-body [data-hs="${id}"]`);
    const btns = await page.$$("#m3-insp-body .insp-actions button");
    await (sus ? btns[0] : btns[1]).click();
    await sleep(40);
  }
  await click("#m3-btn-to-decide");
  await click('#m3-class-options .opt[data-id="dnsexfil"]');
  await click('#m3-just-options input[value="j-cadence"]');
  await click("#m3-btn-just");
  await click('#m3-scope-host .option-grid[data-scope="host"] .opt[data-id="sc-fileshare"]');
  await click('#m3-scope-host .option-grid[data-scope="data"] .opt[data-id="da-none"]');
  await click("#m3-btn-to-contain");
  for (const id of ["killpersist", "cacheflush"]) await click(`#m3-actions input[value="${id}"]`);
  await click("#m3-btn-execute");
  const ulog3 = await page.$eval("#m3-contain-log", (e) => e.textContent);
  assert((ulog3.match(/NOT DONE/g) || []).length === 5, "M3 underreaction leaves 5 required actions undone");
  assert((await page.evaluate(() => window.MODHEAVY_M3.scores().contain)) === 1, "M3 underreaction containment = 4 − 3 = 1");
  // pass-threshold boundary: perfect detect/decide/contain + an empty-ish report lands exactly where scoring says
  const pt = await page.evaluate(() => window.MODHEAVY_M3.mission.debrief.passScore);
  assert(pt === 70, "M3 pass mark is 70");
  assert((await page.evaluate(() => window.MODHEAVY_M2.state.phase)) === "contain", "M2 state untouched by M3");

  // --- M1 still intact after M2 runs (independent state) ---
  assert((await page.evaluate(() => window.MODHEAVY_M1.state.phase)) === "debrief", "M1 state untouched by M2");

  // ================= Mission Four · Lantern Court =================
  await page.goto(BASE + "#m4-briefing", { waitUntil: "load" }); // same-document hash change keeps M1/M2/M3 state
  await sleep(300);
  assert((await active()) === "m4-briefing", "hashchange to #m4-briefing opens M4 briefing");
  await page.waitForFunction(() => window.MODHEAVY_M4 && window.MODHEAVY_M4.mission);
  const m4brief = await page.$eval("#m4-brief-body", (e) => e.textContent);
  assert(m4brief.includes("t.okafor") && m4brief.includes("NGL-SOC-8988"), "M4 briefing rendered from data");
  assert(m4brief.includes("Nothing in this mission is runnable or real"), "M4 disclaimer shown on briefing");
  await page.screenshot({ path: `${SHOTS}/${TAG}-m4-1-briefing.png`, fullPage: true });
  await click("#m4-btn-start");
  assert((await active()) === "m4-detect", "M4 Detect view opens");
  assert((await page.$$("#m4-sources .inbox-item")).length === 5, "M4: five evidence sources listed");
  assert((await page.$eval("#m4-source-body", (e) => e.textContent)).includes("cdn-fastparcel.example"), "M4 gateway log shows the look-alike host");

  const m4hs = await page.evaluate(() => Object.entries(window.MODHEAVY_M4.mission.detect.hotspots).map(([id, h]) => [id, h.suspicious, h.source]));
  assert(m4hs.length === 12, "M4 has 12 hotspots");
  for (const [id, sus, src] of m4hs) {
    await click(`#m4-sources .inbox-item[data-source="${src}"]`);
    await click(`#m4-source-body [data-hs="${id}"]`);
    const btns = await page.$$("#m4-insp-body .insp-actions button");
    assert(btns.length === 2, `M4 inspector opens for ${id}`);
    await (sus ? btns[0] : btns[1]).click();
    await sleep(80);
    if (id === "gif-trailer") await page.screenshot({ path: `${SHOTS}/${TAG}-m4-2-detect-gif.png`, fullPage: true });
    if (id === "beacon-token") await page.screenshot({ path: `${SHOTS}/${TAG}-m4-3-detect-fetch.png`, fullPage: true });
    if (id === "dlp-payload") await page.screenshot({ path: `${SHOTS}/${TAG}-m4-4-detect-dlp.png`, fullPage: true });
  }
  assert((await page.$eval("#m4-judged-count", (e) => e.textContent)).includes("12/12"), "all 12 M4 items judged");
  assert((await page.$eval("#m4-detect-gate", (e) => e.textContent)).includes("Everything judged"), "M4 detect gate reports complete");
  await click('#m4-sources .inbox-item[data-source="ref"]');
  const ref4 = await page.$eval("#m4-source-body", (e) => e.textContent);
  assert(ref4.includes("alvarez.gif") && !ref4.includes("cdn-fastparcel"), "M4 reference profile opens and has no look-alike host");
  assert((await page.$$("#m4-source-body [data-hs]")).length === 0, "M4 reference profile has nothing to judge");
  await page.evaluate(() => Array.from(document.querySelectorAll("#m4-evidence .ev-jump")).find((li) => /appended after the GIF terminator/i.test(li.textContent)).click());
  await sleep(100);
  assert((await page.$eval("#m4-sources .inbox-item.active", (e) => e.dataset.source)) === "gif", "M4 evidence board item jumps to its source (GIF breakdown)");
  await click("#m4-btn-to-decide");
  assert((await active()) === "m4-decide", "M4 Decide view opens");

  await click('#m4-class-options .opt[data-id="stego"]');
  assert((await page.$eval("#m4-class-feedback", (e) => e.className)).includes("good"), "stego classification = good");
  const just4 = await page.evaluate(() => window.MODHEAVY_M4.mission.decide.justification.options.filter((o) => o.correct).map((o) => o.id));
  for (const id of just4) await click(`#m4-just-options input[value="${id}"]`);
  await click("#m4-btn-just");
  assert((await page.$eval("#m4-just-feedback", (e) => e.className)).includes("good"), "M4 justification = good");
  assert((await page.$$("#m4-logs table")).length === 2 && (await page.$$("#m4-logs dl")).length === 1, "M4 mailbox record + hunt + exfil estimate rendered");
  assert((await page.$$('#m4-scope-host .option-grid')).length === 1, "M4 second scope question hidden until the first is answered");
  await click('#m4-scope-host .option-grid[data-scope="account"] .opt[data-id="sc-okafor"]');
  assert((await page.$eval("#m4-decide-continue", (e) => e.hidden)), "M4 continue hidden until all scope questions answered");
  await click('#m4-scope-host .option-grid[data-scope="data"] .opt[data-id="da-partial"]');
  await page.screenshot({ path: `${SHOTS}/${TAG}-m4-5-decide.png`, fullPage: true });
  await click("#m4-btn-to-contain");
  assert((await active()) === "m4-contain", "M4 Contain view opens");

  for (const id of ["blockbeacon", "secureacct", "stripsig", "preserve", "dataowner", "hunt", "report"]) await click(`#m4-actions input[value="${id}"]`);
  await click("#m4-btn-execute");
  const log4 = await page.$eval("#m4-contain-log", (e) => e.textContent);
  assert(log4.includes("sinkhole") && !log4.includes("NOT DONE"), "M4 execution log shows the channel cut, nothing missed");
  assert((await page.evaluate(() => window.MODHEAVY_M4.scores().contain)) === 25, "M4 full containment = 25 (neutral report adds 0)");
  await page.screenshot({ path: `${SHOTS}/${TAG}-m4-6-contain.png`, fullPage: true });
  await click("#m4-btn-to-document");
  assert((await active()) === "m4-document", "M4 Document view opens");
  await click("#m4-btn-file");
  assert(!(await page.$eval("#m4-doc-error", (e) => e.hidden)), "M4 empty report is rejected");
  const R4 = {
    summary: "Covert-channel data exfiltration via steganography: a weaponised airplane signature GIF in the compromised t.okafor marketing mailbox (account takeover) hid the Q4 price list and ~1,400 customer records and beacons remotely.",
    iocs: "cdn-fastparcel[.]example\n203.0.113[.]90\n/sig/okafor.gif?e= (per-recipient token)\nokafor.gif (SIMULATION:4c7e2a…b19f)\n1.58 MB appended after the GIF terminator + base64 comment block\nt.okafor@northglass.example",
    actions: "Sinkholed cdn-fastparcel and blocked 203.0.113.90 at egress; stripped the remote image and quarantined the sent copies. Reset okafor's mailbox, revoked all sessions and the legacy app password, enforced MFA. Reverted the signature template and purged the sent messages. Preserved a forensic copy of the GIF, headers, and fetch logs as evidence. Notified the data-protection lead for the exposed customer and price data. Hunted the fleet for the host and remote-load signatures.",
    recommendation: "Strip remote images and embed signature images (cid:) instead of remote-load. Lock down the signature service with change control and approved image hosts. Kill legacy app passwords and enforce MFA. Add outbound DLP with content inspection of images and attachments. Detect stego by entropy, size-vs-pixels, and trailing bytes after the terminator. Run a post-incident threat hunt and assume the operator will pivot (attribution).",
  };
  for (const [k, v] of Object.entries(R4)) await page.type(`#m4-field-${k}`, v, { delay: 0 });
  await click("#m4-btn-file");
  assert((await active()) === "m4-debrief", "M4 Debrief view opens");
  const m4score = await page.$eval("#m4-score-num", (e) => e.textContent);
  console.log("  M4 score:", m4score, JSON.stringify(await page.evaluate(() => { const s = window.MODHEAVY_M4.scores(); return { d: s.detect, dc: s.decide, c: s.contain, r: s.report.total }; })));
  assert(m4score === "100/100", "M4 perfect run scores 100/100");
  assert((await page.$eval("#m4-score-label", (e) => e.textContent)).includes("lead-ready"), "M4 top score band shown");
  assert((await page.$eval("#m4-hook-body", (e) => e.textContent)).includes("MISSION FIVE"), "Mission Five hook shown");
  assert((await page.$eval("#m4-lore-title", (e) => e.textContent)).includes("LC infrastructure"), "M4 lore unlocked on pass");
  const prev4 = await page.$eval("#m4-report-preview", (e) => e.textContent);
  assert(prev4.includes("NGL-SOC-8988") && prev4.includes("Scope (data)") && prev4.includes("LESSONS LEARNED"), "M4 report preview includes ticket, both scopes, lessons learned");
  assert((await page.$eval("#m4-gaps", (e) => e.textContent)).includes("No gaps"), "M4 perfect run has no gaps");
  await page.screenshot({ path: `${SHOTS}/${TAG}-m4-7-debrief.png`, fullPage: true });

  // --- M4 pass-threshold boundary: 70 passes / 69 fails ---
  const m4band = await page.evaluate(() => {
    const DB = window.MODHEAVY_M4.mission.debrief;
    const bands = DB.scoreBands.slice().sort((a, b) => b.min - a.min);
    const at = (t) => { const b = bands.find((x) => t >= x.min); return { label: b.label, pass: t >= DB.passScore }; };
    return { passScore: DB.passScore, p70: at(70), p69: at(69) };
  });
  assert(m4band.passScore === 70, "M4 pass mark is 70");
  assert(m4band.p70.pass === true && m4band.p70.label === "Solid containment", "M4 score 70 passes (Solid containment)");
  assert(m4band.p69.pass === false, "M4 score 69 fails the pass mark");

  // --- M4 replay: overreaction + ROE violation ---
  await click("#m4-btn-replay");
  assert((await active()) === "m4-briefing", "M4 replay returns to briefing");
  assert((await page.$eval("#m4-btn-start", (e) => e.textContent)).includes("Accept"), "M4 state reset after replay");
  await click("#m4-btn-start");
  for (const [id, , src] of m4hs.slice(0, 6)) {
    await click(`#m4-sources .inbox-item[data-source="${src}"]`);
    await click(`#m4-source-body [data-hs="${id}"]`);
    const btns = await page.$$("#m4-insp-body .insp-actions button");
    await btns[0].click(); // flag everything suspicious (gif-legit is a decoy)
    await sleep(60);
  }
  await click("#m4-btn-to-decide");
  await click('#m4-class-options .opt[data-id="fp"]');
  assert((await page.$eval("#m4-class-feedback", (e) => e.className)).includes("bad"), "M4 false-positive classification = bad");
  await click('#m4-just-options input[value="j-image"]');
  await click('#m4-just-options input[value="j-pixel"]');
  await click("#m4-btn-just");
  await click('#m4-scope-host .option-grid[data-scope="account"] .opt[data-id="sc-allmkt"]');
  await click('#m4-scope-host .option-grid[data-scope="data"] .opt[data-id="da-everything"]');
  await click("#m4-btn-to-contain");
  for (const id of ["preserve", "blockallimg", "disablemail", "reimageall", "floodbeacon"]) await click(`#m4-actions input[value="${id}"]`);
  await click("#m4-btn-execute");
  await click("#m4-btn-to-document");
  for (const k of ["summary", "iocs", "actions", "recommendation"]) {
    await page.$eval(`#m4-field-${k}`, (e) => { e.value = ""; });
    await page.type(`#m4-field-${k}`, "just a signature image, shut it all down", { delay: 0 });
  }
  await click("#m4-btn-file");
  const o4 = await page.evaluate(() => { const s = window.MODHEAVY_M4.scores(); return { total: s.total, d: s.detect, dc: s.decide, c: s.contain, r: s.report.total }; });
  console.log("  M4 overreaction scores:", JSON.stringify(o4));
  assert(o4.total < 70, "M4 overreaction run fails pass mark");
  assert(o4.c === 0, "M4 overreaction penalties clamp containment at 0");
  assert((await page.$eval("#m4-lore-title", (e) => e.textContent)).includes("sealed"), "M4 lore locked on fail");
  const g4 = await page.$eval("#m4-gaps", (e) => e.textContent);
  assert(g4.includes("Overreaction") && g4.includes("Hard stop"), "M4 gaps call out the overreaction and the ROE violation");
  await page.screenshot({ path: `${SHOTS}/${TAG}-m4-8-debrief-over.png`, fullPage: true });

  // --- M4 replay: underreaction (revert the template, delete + close) ---
  await click("#m4-btn-replay");
  await click("#m4-btn-start");
  for (const [id, sus, src] of m4hs) {
    await click(`#m4-sources .inbox-item[data-source="${src}"]`);
    await click(`#m4-source-body [data-hs="${id}"]`);
    const btns = await page.$$("#m4-insp-body .insp-actions button");
    await (sus ? btns[0] : btns[1]).click();
    await sleep(40);
  }
  await click("#m4-btn-to-decide");
  await click('#m4-class-options .opt[data-id="stego"]');
  await click('#m4-just-options input[value="j-beacon"]');
  await click("#m4-btn-just");
  await click('#m4-scope-host .option-grid[data-scope="account"] .opt[data-id="sc-insider"]');
  await click('#m4-scope-host .option-grid[data-scope="data"] .opt[data-id="da-none"]');
  await click("#m4-btn-to-contain");
  for (const id of ["stripsig", "deleteclose"]) await click(`#m4-actions input[value="${id}"]`);
  await click("#m4-btn-execute");
  const ulog4 = await page.$eval("#m4-contain-log", (e) => e.textContent);
  assert((ulog4.match(/NOT DONE/g) || []).length === 5, "M4 underreaction leaves 5 required actions undone");
  assert((await page.evaluate(() => window.MODHEAVY_M4.scores().contain)) === 1, "M4 underreaction containment = 4 − 3 = 1");
  assert((await page.evaluate(() => window.MODHEAVY_M3.state.phase)) === "contain", "M3 state untouched by M4");


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
  await page.goto(BASE + "#m2-contain", { waitUntil: "load" });
  await page.reload({ waitUntil: "load" });
  await sleep(600);
  assert((await active()) === "m2-briefing", "reload at #m2-contain lands on M2 briefing");
  assert((await page.$eval("#m2-btn-start", (e) => e.textContent)).includes("Accept"), "fresh M2 state after reload");
  await page.goto(BASE + "#m2-debrief", { waitUntil: "load" }); // same-document hash change
  await sleep(400);
  assert((await active()) === "m2-briefing", "hashchange to #m2-debrief routes to M2 briefing");
  await page.goto(BASE + "#m3-contain", { waitUntil: "load" });
  await page.reload({ waitUntil: "load" });
  await sleep(600);
  assert((await active()) === "m3-briefing", "reload at #m3-contain lands on M3 briefing");
  assert((await page.$eval("#m3-btn-start", (e) => e.textContent)).includes("Accept"), "fresh M3 state after reload");
  await page.goto(BASE + "#m3-debrief", { waitUntil: "load" }); // same-document hash change
  await sleep(400);
  assert((await active()) === "m3-briefing", "hashchange to #m3-debrief routes to M3 briefing");
  await page.goto(BASE + "#m4-contain", { waitUntil: "load" });
  await page.reload({ waitUntil: "load" });
  await sleep(600);
  assert((await active()) === "m4-briefing", "reload at #m4-contain lands on M4 briefing");
  assert((await page.$eval("#m4-btn-start", (e) => e.textContent)).includes("Accept"), "fresh M4 state after reload");
  await page.goto(BASE + "#m4-debrief", { waitUntil: "load" }); // same-document hash change
  await sleep(400);
  assert((await active()) === "m4-briefing", "hashchange to #m4-debrief routes to M4 briefing");
  await page.goto(BASE + "#about", { waitUntil: "load" });
  await sleep(300);
  await click('#view-about [data-nav="m3-briefing"]');
  assert((await active()) === "m3-briefing", "About page 'Start Mission Three' opens M3 briefing");
  await page.goto(BASE + "#hub", { waitUntil: "load" });
  await sleep(300);
  await click('.hero [data-nav="m3-briefing"]');
  assert((await active()) === "m3-briefing", "hub hero 'Start Mission Three' opens M3 briefing");
  await page.goto(BASE + "#about", { waitUntil: "load" });
  await sleep(300);
  await click('#view-about [data-nav="m4-briefing"]');
  assert((await active()) === "m4-briefing", "About page 'Start Mission Four' opens M4 briefing");
  await page.goto(BASE + "#hub", { waitUntil: "load" });
  await sleep(300);
  await click('.hero [data-nav="m4-briefing"]');
  assert((await active()) === "m4-briefing", "hub hero 'Start Mission Four' opens M4 briefing");
  await page.goto(BASE + "#about", { waitUntil: "load" });
  await sleep(300);
  await click('#view-about [data-nav="m2-briefing"]');
  assert((await active()) === "m2-briefing", "About page 'Start Mission Two' opens M2 briefing");
  await page.goto(BASE + "#hub", { waitUntil: "load" });
  await sleep(300);
  await click('.hero [data-nav="m2-briefing"]');
  assert((await active()) === "m2-briefing", "hub hero 'Start Mission Two' opens M2 briefing");

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
  await page.goto(BASE + "#hub", { waitUntil: "load" });
  await page.reload({ waitUntil: "load" });
  await sleep(500);
  await click('.card [data-nav="m2-briefing"]');
  assert((await active()) === "m2-briefing", "M2 hub card opens briefing (mobile)");
  await click("#m2-btn-start");
  await sleep(700);
  await page.screenshot({ path: `${SHOTS}/${TAG}-11-mobile-m2-detect.png`, fullPage: false });
  await click('#m2-source-body [data-hs="proc-name"]');
  await sleep(700);
  await page.screenshot({ path: `${SHOTS}/${TAG}-12-mobile-m2-inspector.png`, fullPage: false });
  await page.goto(BASE + "#hub", { waitUntil: "load" });
  await page.reload({ waitUntil: "load" });
  await sleep(500);
  await click('.card [data-nav="m3-briefing"]');
  assert((await active()) === "m3-briefing", "M3 hub card opens briefing (mobile)");
  await click("#m3-btn-start");
  await sleep(700);
  await page.screenshot({ path: `${SHOTS}/${TAG}-13-mobile-m3-detect.png`, fullPage: false });
  await click('#m3-source-body [data-hs="dns-entropy"]');
  await sleep(700);
  assert((await page.$eval("#m3-insp-body .insp-title", (e) => e.textContent)).includes("entropy"), "M3 inspector works on mobile");
  await page.screenshot({ path: `${SHOTS}/${TAG}-14-mobile-m3-inspector.png`, fullPage: false });
  await page.goto(BASE + "#hub", { waitUntil: "load" });
  await page.reload({ waitUntil: "load" });
  await sleep(500);
  await click('.card [data-nav="m4-briefing"]');
  assert((await active()) === "m4-briefing", "M4 hub card opens briefing (mobile)");
  await click("#m4-btn-start");
  await sleep(700);
  await page.screenshot({ path: `${SHOTS}/${TAG}-15-mobile-m4-detect.png`, fullPage: false });
  await click('#m4-sources .inbox-item[data-source="gif"]');
  await click('#m4-source-body [data-hs="gif-trailer"]');
  await sleep(700);
  assert((await page.$eval("#m4-insp-body .insp-title", (e) => e.textContent)).includes("terminator"), "M4 inspector works on mobile");
  await page.screenshot({ path: `${SHOTS}/${TAG}-16-mobile-m4-inspector.png`, fullPage: false });
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
