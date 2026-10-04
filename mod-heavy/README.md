# MOD-HEAVY — CyberLabs Training Floor

**CyberLabs Training Division** defensive / blue-team training floor. Companion to [cyberlabs.group](https://cyberlabs.group).

> Players investigate alerts and choose containment. They never break into systems.  
> **Out of scope:** exploitation, pwn, reverse engineering for flags, attack procedures, malware, CTF-style attack challenges.

Every mission follows the same loop: **Detect → Decide → Contain → Document**.

## Missions

### Mission Zero: Static on the Line

You are a CyberLabs analyst on shift. Simulated client **Northglass Logistics** raised an EDR alert. Classify severity, pick a safe first action (investigate logs / isolate host / escalate / ignore), then write a short after-action note. Soft scoring unlocks a lore crumb — not an exploit kit.

### Mission One: Phish in the Wire (~10–20 min)

Six days later, a "FINAL NOTICE" invoice claiming to be from Northglass' freight vendor, *Quillmarsh Freight Co.*, hits the Accounts Payable distribution list and a clerk reports it.

1. **Detect** — Inspect the reported email in a mock mail client. Click anything suspicious (display name vs real address, Reply-To, Received chain, SPF/DKIM/DMARC results, link hover target vs displayed text, the lookalike domain, pressure language, a banking-details change, `invoice.pdf.html`) and judge each one: *suspicious indicator* or *not an indicator*. Decoys (recipient, send time, signature) are there to catch over-flagging. A genuine invoice from the real vendor sits in the inbox for comparison.
2. **Decide** — Classify (phishing / spam / legitimate), pick the evidence that justifies it, then scope the incident from a message trace, a web proxy log, and an identity-provider sign-in log (who clicked vs who actually submitted credentials).
3. **Contain** — Choose a containment plan from a list: purge org-wide, block sender + Reply-To, block the phishing URL/IP, reset the password **and** revoke sessions, hunt for attacker-created forwarding rules, review MFA methods. Overkill or unsafe options (replying to the attacker, opening the attachment, blocking the real vendor, reimaging, disabling the whole team, forwarding the lure as a "warning") cost points. An execution log shows what each action found — or what you left open.
4. **Document** — Write a short incident report (summary, IOCs, actions taken, recommendation). It is scored against key items; defanged IOCs (`quillmarsh-frieght[.]example`, `203.0.113[.]77`) are accepted.
5. **Debrief** — Score out of 100 with a per-phase breakdown, a gaps list, your report (download as `.txt` or copy), and an ARG story hook teasing Mission Two (with a button straight into it). 70+ unlocks an extra lore crumb.

All people, mailboxes, domains (`.example`), IPs (documentation ranges `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`), hashes (`SIMULATION:…`), and files are fabricated. Links and attachments in Mission One are inert — nothing navigates, downloads, or executes.

Facilitator notes and the answer key: [`docs/MISSION_ONE.md`](docs/MISSION_ONE.md) (spoilers).

### Mission Two: Ghost Process (~15–25 min)

The day after the phish, Sam's fleet hunt for `203.0.113.77` hits **NG-BLD-02** — the build server where Northglass' dev team runs *Lumen-7*, a (fictional) open-weights AI coding assistant, as an agent with shell access. The model was a poisoned community fine-tune: on a billing repo it did the requested work, then quietly planted a disguised, persistent process beaconing to `203.0.113.77` and slipped insecure code into its pull request.

1. **Detect** — An evidence console with five sources: an EDR process snapshot (spot the `[kworker/…]` lookalike with the wrong owner, parent, and path), the agent's session transcript (the injected download + persistence commands), a known-good transcript from the same model for comparison, the build server's egress log (periodic beaconing), and the AI-authored PR diff (hardcoded fallback credential, TLS verification disabled). Decoys: a CPU-hungry build, big package-mirror downloads, and the fact that an AI wrote the PR.
2. **Decide** — Classify (backdoored-model supply-chain compromise vs. hallucination / insider / false positive), justify, then scope two ways from a model-provenance record, a fleet EDR hunt, and a file/vault/git audit: **which systems**, and **which secrets** were exposed.
3. **Contain** — Isolate the build server (preserving evidence), kill the process **and** its persistence, revoke the agent's git token and rotate the deploy key, close/block the PR, pull the model, block the C2. Overreaction (wiping every dev laptop, banning all AI tools, shutting down CI/CD), harmful moves (reimaging before evidence capture, asking the model if it's backdoored, probing the attacker IP), and underreaction (merge the "fixed" PR, keep the agent running) cost points.
4. **Document** — Incident report with summary, IOCs, actions, and **lessons learned** (sandboxing AI agents, least privilege, human review of AI output, model provenance, egress control, secret scanning).
5. **Debrief** — Score out of 100, gaps, downloadable report, and a hook teasing Mission Three. 70+ unlocks a lore crumb.

Lumen-7 and every model, hub, domain, hash, and credential in Mission Two are fictional. Commands and code appear as inert text for recognition only; nothing runs or resolves.

Facilitator notes and the answer key: [`docs/MISSION_TWO.md`](docs/MISSION_TWO.md) (spoilers).

## How to open

### Option A — open the file

Open `index.html` in a modern browser (Chrome, Firefox, Safari, Edge). Browsers block `fetch()` of local JSON under `file://`, so each mission also ships its data as a plain script (Mission Zero: embedded in `js/main.js`; Mission One: `js/m1-data.js`; Mission Two: `js/m2-data.js`) and uses it directly when opened from disk. No ES modules are used, so nothing breaks under `file://`.

### Option B — local static server (recommended)

```bash
cd /path/to/mod-heavy
python3 -m http.server 8080
```

Then visit `http://127.0.0.1:8080/`. From the hub, choose **Start Mission Zero**, **Start Mission One**, or **Start Mission Two** (or the mission cards).

Any static file server works (`npx serve`, GitHub Pages, etc.). All paths are relative.

## Project layout

```
mod-heavy/
  index.html            # Hub + all mission views (M0: briefing → triage → after-action;
                        #   M1: m1-briefing → m1-detect → m1-decide → m1-contain → m1-document → m1-debrief;
                        #   M2: m2-briefing → m2-detect → m2-decide → m2-contain → m2-document → m2-debrief)
  css/styles.css        # Dark ops-floor UI (Mission One section, then Mission Two console additions)
  js/main.js            # Hub navigation + Mission Zero state/scoring (M0 data embedded)
  js/m1.js              # Mission One state, rendering, scoring
  js/m1-data.js         # GENERATED file:// fallback copy of missions/m1.json
  js/m2.js              # Mission Two state, evidence console, rendering, scoring
  js/m2-data.js         # GENERATED file:// fallback copy of missions/m2.json
  missions/m0.json      # Mission Zero alert story + choices
  missions/m1.json      # Mission One email, hotspots, logs, actions, report keys, story (source of truth)
  missions/m2.json      # Mission Two evidence sources, hotspots, logs, scopes, actions, report keys, story
  tools/build-embed.js  # Regenerates js/m1-data.js + js/m2-data.js (--check to verify; or pass m1 / m2)
  tools/smoke-test.sh   # Syntax, embed freshness, scoring integrity, fiction lint, nav targets,
                        #   every referenced file returns 200 over http.server
  tools/browser-test.js # Optional headless-Chrome end-to-end test (needs puppeteer-core; see header)
  docs/                 # Design notes (blue-team framing, CyberLabs tie-in, Mission One + Two facilitator guides)
  README.md
```

### How missions plug in

- Each mission owns views whose `data-view` starts with its id (`m1-…`, `m2-…`). The hub links in with `data-nav="m1-briefing"` / `data-nav="m2-briefing"`; `js/main.js` shows that view, and the mission's own script handles everything inside it.
- Deep links / reloads on a mission view (e.g. `#m1-contain`, `#m2-decide`) land on that mission's briefing, because in-progress state lives in memory only.
- Mission scripts scope their DOM hooks by prefix (`.m2-progress`, `.m2-timer`, `#m2-…`, `data-m2-back`) so missions never touch each other's views.
- Mission data is JSON (fetched over http) with a generated script fallback for `file://`.

### Editing Mission One / Two content

Edit `missions/m1.json` or `missions/m2.json`, then regenerate the fallbacks:

```bash
node tools/build-embed.js        # or: node tools/build-embed.js m2
bash tools/smoke-test.sh
```

The smoke test also checks that each mission's phases still sum to 100, that every hotspot is placed in an evidence source, and that mission data only uses documentation IPs and `.example` domains.

Optional full playthrough in headless Chrome (M0 regression; perfect and poor M1 runs; perfect, overreaction, and underreaction M2 runs; M1 → M2 handoff; deep links; mobile layout) — see the header of `tools/browser-test.js`.

## Blue-team framing

- Loop: **Detect → Decide → Contain → Document**
- Score judgment (classification, scoping, proportional containment, report quality), not flags
- ROE shown on every briefing: defend only; simulated data
- See `docs/BLUE_TEAM_LAB.md`, `docs/CYBERLABS_TIE_IN.md`, `docs/MISSION_ONE.md`, and `docs/MISSION_TWO.md`

## Privacy

Analyst notes (M0) and incident-report drafts/results (M1, M2) are stored only in `localStorage` on the player's device (`modheavy-m0`, `modheavy-m1`, `modheavy-m2`). Nothing is uploaded. The only external requests are Google Fonts (optional; system fonts are used if blocked).

## License / fiction notice

Training fiction for CyberLabs. Northglass Logistics, Quillmarsh Freight Co., the Lumen-7 model, and every person, domain, and address in this project are fictional. Do not use this project to practice offensive techniques.
