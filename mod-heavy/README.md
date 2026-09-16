# MOD-HEAVY — Mission Zero

**CyberLabs Training Division** defensive / blue-team training floor.

> Players investigate alerts and choose containment. They never break into systems.  
> **Out of scope:** exploitation, pwn, reverse engineering for flags, attack procedures, malware, CTF-style attack challenges.

## Mission Zero: Static on the Line

You are a CyberLabs analyst on shift. Simulated client **Northglass Logistics** raised an EDR alert. Classify severity, pick a safe first action (investigate logs / isolate host / escalate / ignore), then write a short after-action note. Soft scoring unlocks a lore crumb — not an exploit kit.

All hosts, IPs (documentation ranges), hashes (`SIMULATION:…`), and personnel are fabricated.

## How to open

### Option A — open the file

Open `index.html` in a modern browser (Chrome, Firefox, Safari, Edge). Mission data is embedded as a fallback when `fetch` of JSON is blocked under `file://`.

### Option B — local static server (recommended)

```bash
cd /path/to/mod-heavy
python3 -m http.server 8080
```

Then visit `http://127.0.0.1:8080/`.

Any static file server works (`npx serve`, etc.).

## Project layout

```
mod-heavy/
  index.html          # Hub → briefing → triage → after-action
  css/styles.css      # Dark ops-floor UI (distinct from CRT arcade lore sites)
  js/main.js          # Mission state, scoring, soft feedback
  missions/m0.json    # Alert story + choices (also embedded in JS)
  docs/               # Condensed design notes (blue-team framing)
  README.md
```

## Blue-team framing

- Loop: **Detect → Decide → Contain → Document**
- Score judgment (severity + safe first action), not flags
- ROE shown on briefing: defend only; simulated data
- See `docs/BLUE_TEAM_LAB.md` and `docs/CYBERLABS_TIE_IN.md`

## Privacy

Analyst notes are stored only in `localStorage` on the player’s device. Nothing is uploaded.

## License / fiction notice

Training fiction for CyberLabs. Northglass Logistics is not a real company in this context. Do not use this project to practice offensive techniques.
