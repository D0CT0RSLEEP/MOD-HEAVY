# Mission One — Phish in the Wire (facilitator notes)

> **Spoilers.** This file contains the answer key. Don't hand it to players before they run the mission.

## At a glance

| | |
|---|---|
| ID / ticket | M1 · `NGL-SOC-8907` |
| Client | Northglass Logistics (SIMULATED) |
| Skill focus | Email / identity — phishing triage, scoping, containment, reporting |
| Time | 10–20 minutes |
| Scoring | 100 points: Detect 30 · Decide 20 · Contain 25 · Document 25. Pass (lore crumb) = 70 |
| Data | `missions/m1.json` (fallback: `js/m1-data.js`, generated) |

## Learning objectives

- Read past the display name: compare the real address and Reply-To to known-good mail.
- Read headers: Received chain bottom-up, SPF/DKIM/DMARC results, and what a DMARC `p=none` policy means.
- Hover before clicking; recognise link text ≠ link target and double-extension attachments.
- Separate *clicked* from *compromised* using proxy (GET vs POST) and sign-in logs.
- Contain proportionally: identity first (reset **and** revoke sessions), persistence second (forwarding rules, MFA devices), without breaking the business.
- Write a client-ready report with defanged IOCs.

## Story

Tuesday 22 Sep 2026, 10:12 ET. A lookalike of the real vendor (`quillmarsh-frieght.example` vs `quillmarsh-freight.example`) sends a past-due invoice to `ap-team@northglass.example` (14 mailboxes). Dana Whitfield (`d.whitfield`) clicks, submits credentials, and approves an MFA push; the attacker signs in from `203.0.113.77`, registers an authenticator, and creates an inbox rule "Invoice sync" that forwards invoice mail to the Reply-To relay mailbox. Marcus Okafor (`m.okafor`) loads the page but doesn't submit, then reports the email.

**ARG thread:** `203.0.113.77` is the same address `NG-WRKSTN-042` beaconed to in Mission Zero — someone was inside before the phish. `X-Mailer: LNTRN Bulk 7` seeds the "LANTERN" thread. The debrief hook teases **Mission Two · Ghost Process** and offers a “Start Mission Two” button. (In Mission Two, 042 turns out clean; the fleet hunt for `203.0.113.77` leads to the build server instead — see `MISSION_TWO.md`.)

## Answer key

### Detect (30)
Suspicious indicators (3 pts each): sender identity (lookalike domain), Reply-To (`qm.billing.dept@mailbox-relay.example`), Received chain (VPS `198.51.100.23`, HELO claims the real vendor), SPF softfail / DKIM none / DMARC fail (p=none), link target (`quillmarsh-invoice-view.example/ng/sso/login`), urgency/threat, banking-details change, "don't call us", `invoice.pdf.html`.
Not indicators (1 pt each for calling them correctly): recipient (AP list), sent time (business hours), signature block (copied from real mail).
Players must judge at least 6 of 12 elements to move on; unjudged items score 0.

### Decide (20)
- Classification: **Phishing** 6 · Spam 1 · Legitimate 0
- Justification: +1 per real indicator, −1 per non-indicator (hours, distribution list, signature), clamped 0–6
- Scope: **"Two users opened the link; d.whitfield submitted credentials…; m.okafor only loaded the page"** 8 · "clicked, no creds" 2 · "all 14 compromised" 2 · "nobody interacted" 0
  Key evidence: proxy `POST /ng/sso/auth` at 14:15:31Z → sign-in from `203.0.113.77` at 14:16:05Z → Mail API session at 14:18:40Z.

### Contain (25, clamped at 0)
Required: purge org-wide 5 · block sender domain + Reply-To 3 · block phishing URL/IP 4 · reset password + revoke sessions 5 · check/remove forwarding rules 5 · review MFA methods 3.
Neutral (0): call the vendor via the number on file.
Penalties: reply to sender −4 · open attachment −5 · block the real vendor −3 · reimage laptop −2 · disable all AP accounts −3 · forward the lure to all staff −3.

### Document (25)
Keyword-matched (case-insensitive; `[.]`, `(.)`, `[@]`, `hxxp` are normalised before matching):
- Summary (6): phishing/credential harvest 2 · vendor/invoice lure 2 · Dana + credentials/account compromised 2
- IOCs (9): `quillmarsh-frieght.example` 2 · `quillmarsh-invoice-view.example` 2 · `203.0.113.77` 2 · `198.51.100.23` 1 · `mailbox-relay.example` 1 · `invoice.pdf.html` 1
- Actions (5): purge · block · reset/revoke · rule/forward · MFA
- Recommendation (5, 6 keys capped at 5): awareness training · out-of-band payment verification · external-sender banner · lookalike-domain monitoring/DMARC · HTML attachment policy · phishing-resistant MFA

Keyword scoring is a coaching aid, not a grader of prose. For team workshops, have a lead review the report text too.

## Safety notes

- All domains use the reserved `.example` TLD; all IPs are RFC 5737 documentation ranges; `10.x` addresses are private.
- The mission never renders a real `href`: links are buttons that only display their target. Attachments are described by a simulated sandbox summary; no file content exists.
- No phishing-kit code, payloads, or attack procedures are included — only the defender's view.
