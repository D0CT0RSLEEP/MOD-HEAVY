# MOD-HEAVY — Blue Team Lab Design

## What this is
A defensive training environment under CyberLabs. Players investigate, detect, contain, and report.  
**Out of scope:** exploitation, pwn, reverse-engineering for flags, attack playbooks.

## Player fantasy
You are a CyberLabs analyst on shift. Something weird hit the network. Your job is to understand it and stop the bleeding — not to break in.

## Lab structure

### Hub: Operations Floor
- Briefing terminal (mission brief, rules of engagement: defend only)
- Evidence locker (logs, alerts, PCAP summaries, tickets — sanitized fiction)
- Comms (in-fiction chat with “Sam” / shift lead)
- Report desk (submit findings; scored on accuracy and clarity)

### Mission modules (grow over time)
| ID | Name | Skill focus | Player does |
|----|------|-------------|-------------|
| M0 | Static on the Line | Orientation | Read brief, classify alert severity, pick first action |
| M1 | Phish in the Wire | Email / identity | Spot phishing indicators, recommend containment |
| M2 | Ghost Process | Endpoint / EDR narrative | Triage process tree from a story log, isolate host |
| M3 | Exfil Whisper | Network / detection | Spot odd egress in flow summaries, propose block |
| M4 | After Action | Reporting | Write a short incident summary CyberLabs-style |

Each module: **Detect → Decide → Contain → Document**. No “get shell / crack hash / exploit CVE” steps.

### Scoring (game loop without CTF flags)
- Correct severity / classification
- Choosing safe containment over risky curiosity
- Completeness of notes
- Time-to-good-decision (optional, soft timer)
Unlock cosmetics / dossier pages / ARG lore crumbs — not exploit kits.

### Difficulty tracks
- **Trainee** — guided questions, hints on
- **Analyst** — fewer hints, more noise in evidence
- **Lead** — ambiguous evidence, must justify tradeoffs

## Evidence style
All data is **fabricated** and clearly fictional (fake company “Northglass Logistics,” fake IPs in documentation ranges, fake hashes labeled `SIMULATION`). Never copy real victim data.

## Tech shape (when we build)
- Static or light web app in `MOD-HEAVY` repo (like Polybius)
- Missions as JSON + markdown briefs
- Client-side scoring first; no need for a vulnerable backend
