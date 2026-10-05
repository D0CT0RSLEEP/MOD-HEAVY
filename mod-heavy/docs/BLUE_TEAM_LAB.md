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
| ID | Name | Skill focus | Player does | Status |
|----|------|-------------|-------------|--------|
| M0 | Static on the Line | Orientation | Read brief, classify alert severity, pick first action | Shipped |
| M1 | Phish in the Wire | Email / identity | Inspect a phishing email (headers, auth results, links, attachment), classify + scope from proxy/sign-in logs, pick proportional containment, write an incident report | Shipped — see `MISSION_ONE.md` |
| M2 | Ghost Process | Endpoint / AI supply chain | Spot a disguised process, read a backdoored AI agent's transcript, catch beaconing and insecure AI-authored code, scope hosts + exposed secrets, contain proportionally, write a report with AI-agent lessons learned | Shipped — see `MISSION_TWO.md` |
| M3 | Exfil Whisper | Network / detection | Catch low-and-slow DNS-tunnel exfiltration (high-entropy labels, look-alike domain, resolver bypass, quiet-hours cadence) from an overlooked appliance, triage its scheduled task + staging dir, scope host and data volume, cut the channel proportionally, write a breach-aware report | Shipped — see `MISSION_THREE.md` |
| M4 | Lantern Court | Threat intel / attribution + reporting | Connect the LNTRN thread across M0–M3 and write the CyberLabs after-action | Planned — teased at end of M3 |

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
All data is **fabricated** and clearly fictional (fake company “Northglass Logistics,” fake IPs in documentation ranges, fake hashes labeled `SIMULATION`, domains on the reserved `.example` TLD, a fictional AI model “Lumen-7”). Never copy real victim data, real brands, real AI models or vendors, or real phishing domains.

## Tech shape (when we build)
- Static or light web app in `MOD-HEAVY` repo (like Polybius)
- Missions as JSON + markdown briefs
- Client-side scoring first; no need for a vulnerable backend
