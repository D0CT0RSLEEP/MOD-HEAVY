/**
 * MOD-HEAVY Mission Four — embedded mission data (file:// fallback).
 * GENERATED from missions/m4.json by tools/build-embed.js. Do not edit by hand.
 */
window.MODHEAVY_M4_EMBED = {
  "id": "M4",
  "codename": "Lantern Court",
  "title": "Mission Four — Lantern Court",
  "company": "Northglass Logistics (SIMULATED)",
  "disclaimer": "All people, mailboxes, domains (.example), IPs (documentation ranges), hashes (SIMULATION), file names, tokens, and byte dumps are fabricated for defensive training. Nothing in this mission is runnable or real: the image host doesn’t resolve, the signature GIF is an empty placeholder, the decoded payload is fiction, and every credential and token is fake.",
  "shiftLead": "Sam",
  "estMinutes": "25–35",
  "briefing": {
    "alertId": "NGL-SOC-8988",
    "reported": "2026-09-28T13:12:40Z",
    "reportedLocal": "Mon 28 Sep 2026 · 09:12 ET (SIM)",
    "reporter": "Outbound DLP + brand-protection watch (an email signature image loading from a host that isn’t Northglass’ CDN)",
    "context": "The DNS whisper is sinkholed and PRINT-07 is clean, but the Lantern Court thread didn’t stop — it changed shape. Brand-protection flagged something small and almost charming: the cute animated airplane GIF in a marketing coordinator’s email signature — the kind half the floor uses — is no longer served from Northglass’ own content network. It loads from a look-alike host, and it’s heavier than any 180 KB airplane has a right to be. The mailbox is t.okafor (marketing). You have the outbound email-gateway log, a forensic breakdown of the signature GIF, the remote-image fetch log, the DLP content-inspection alerts, and a known-good signature profile from a sister marketing mailbox for comparison.",
    "reporterQuote": "Tomas has had that little airplane in his signature for years — everybody loves it. Why would his sig suddenly phone a server that isn’t ours? — Priya Alvarez, marketing ops",
    "roe": [
      "Defend only — investigate, contain, escalate, document.",
      "Evidence is read-only. Don’t open, forward, render, or fetch the signature image or its host, and never probe attacker infrastructure.",
      "Treat every mailbox, domain, hash, token, and byte dump as simulated fiction.",
      "Contain proportionally: stop the covert channel without blacking out email or burning the employee whose account was abused."
    ],
    "objective": "Find the covert channel hidden in the signature GIF, decide what it is and whose account carries it, cut the beacon and the data path, secure the abused mailbox, scope what left, and write the incident report Sam sends to Northglass’ CTO and data-protection lead.",
    "sam": "Red — this is the quietest one yet. No process, no tunnel, just a picture everybody trusts. Two things hide in that GIF: data stuffed in after the file should have ended, and a remote load that turns every open into a callback. Don’t look at the airplane. Look at the bytes after the terminator, the host it loads from, and who the account really belongs to right now."
  },
  "phases": [
    {
      "id": "detect",
      "label": "Detect"
    },
    {
      "id": "decide",
      "label": "Decide"
    },
    {
      "id": "contain",
      "label": "Contain"
    },
    {
      "id": "document",
      "label": "Document"
    },
    {
      "id": "debrief",
      "label": "Debrief"
    }
  ],
  "detect": {
    "maxScore": 30,
    "minJudged": 6,
    "sam": "Five evidence sources across the top. Open each one and inspect anything highlighted — gateway rows, the GIF byte breakdown, fetch rows, DLP hits. Call each: suspicious indicator, or not an indicator. The p.alvarez profile is a known-good signature from a sister marketing mailbox — use it to see what a normal, embedded airplane GIF looks like.",
    "sources": [
      {
        "id": "gw",
        "kind": "table",
        "label": "Outbound email gateway",
        "sub": "t.okafor · 25–28 Sep",
        "tag": "ALERT HOST",
        "title": "Outbound mail gateway log · t.okafor@northglass.example (SIM, UTC)",
        "meta": [
          [
            "Mailbox",
            "t.okafor@northglass.example — Tomas Okafor, marketing coordinator (SIM)"
          ],
          [
            "Signature",
            "HTML signature with an inline <img> airplane GIF — rendered on every outbound message"
          ],
          [
            "Image source",
            {
              "t": "<img src=\"https://cdn-fastparcel.example/sig/okafor.gif?e={token}\"> — not Northglass’ CDN (assets.fastparcel-cdn.example)",
              "hs": "beacon-lookalike"
            }
          ],
          [
            "Window",
            "25–28 Sep · 41 external sends carrying the signature"
          ]
        ],
        "columns": [
          "Time",
          "To",
          "Subject / note",
          "Signature image",
          "Size"
        ],
        "rows": [
          [
            "25 Sep 08:02",
            "ap-team@northglass.example",
            "Re: Q4 campaign timeline (internal)",
            "inline airplane GIF",
            "0.1 MB"
          ],
          {
            "hs": "gw-external",
            "cells": [
              "25 Sep 09:31",
              "press-list (37 external recipients)",
              "Northglass Q4 press kit — remote-loaded signature image",
              "loads from cdn-fastparcel.example",
              "0.3 MB"
            ]
          },
          {
            "hs": "gw-deck",
            "cells": [
              "26 Sep 11:20",
              "media@fastparcel-cdn.example",
              "Campaign assets (legit 14 MB slide deck attached)",
              "inline airplane GIF",
              "14 MB"
            ]
          },
          {
            "hs": "gw-external",
            "cells": [
              "27 Sep 09:44",
              "press-list (37 external recipients)",
              "Re: Q4 press kit — same remote signature, same host",
              "loads from cdn-fastparcel.example",
              "0.3 MB"
            ]
          },
          [
            "28 Sep 07:58",
            "all-marketing@northglass.example",
            "Weekly standup notes (internal)",
            "inline airplane GIF",
            "0.1 MB"
          ]
        ]
      },
      {
        "id": "gif",
        "kind": "terminal",
        "label": "Signature GIF breakdown",
        "sub": "okafor.gif · forensic copy",
        "tag": "FILE",
        "title": "Forensic breakdown · okafor.gif (SIM, read-only copy)",
        "lines": [
          "== file okafor.gif",
          "okafor.gif: GIF image data, version 89a, 480 x 270",
          "size on disk: 1.84 MB   (sister p.alvarez airplane sig: 176 KB)",
          "",
          "== header / logical screen descriptor",
          "47 49 46 38 39 61  (GIF89a)   canvas 480x270, 12 frames, loop",
          {
            "t": "declared image blocks cover ~190 KB of pixel data — the other ~1.65 MB is not pixels",
            "hs": "gif-entropy"
          },
          "",
          "== extension blocks",
          "21 F9 .. graphic control (per frame) — normal",
          {
            "t": "21 FE (comment extension): 64 KB of base64 text stuffed into a comment block — ‘lc1:eyJ…’ (not printed)",
            "hs": "gif-comment"
          },
          "",
          "== trailer",
          {
            "t": "3B (GIF terminator) at offset 0x2FA40 — the file should end here, but 1.58 MB of appended data follows the terminator",
            "hs": "gif-trailer"
          },
          {
            "t": "appended region entropy ≈ 7.98/8.0 (encrypted/compressed blob) — a clean GIF’s trailing bytes are empty",
            "hs": "gif-entropy"
          },
          "",
          "== animation",
          {
            "t": "frame 12 is a 1x1 transparent pixel with 0 ms delay — invisible, present only to carry the remote fetch",
            "hs": "gif-dims"
          },
          "",
          "== comparison: p.alvarez airplane sig (reference)",
          {
            "t": "same 89a airplane, 176 KB, ends cleanly at its 3B terminator, no comment block, embedded via cid: (no remote load)",
            "hs": "gif-legit"
          },
          "== end  ·  hash SIMULATION:4c7e2a…b19f  (okafor.gif)"
        ]
      },
      {
        "id": "fetch",
        "kind": "table",
        "label": "Remote-image fetch log",
        "sub": "signature renders · 25–28 Sep",
        "tag": "NETWORK",
        "title": "Remote-image fetch log · signature renders (SIM, UTC)",
        "meta": [
          [
            "Legit CDN",
            "assets.fastparcel-cdn.example → 198.51.100.21 (Northglass’ real content network)"
          ],
          [
            "Look-alike host",
            {
              "t": "cdn-fastparcel.example → 203.0.113.90 — first seen 24 Sep, authoritative NS 198.51.100.53",
              "hs": "beacon-lookalike"
            }
          ]
        ],
        "columns": [
          "Time",
          "Method",
          "Host",
          "Path / token",
          "Out",
          "Referrer"
        ],
        "rows": [
          [
            "25 Sep 09:33",
            "GET",
            "assets.fastparcel-cdn.example",
            "/brand/logo.png",
            "0.2 KB",
            "webmail"
          ],
          {
            "hs": "beacon-remote",
            "cells": [
              "25 Sep 09:33",
              "GET",
              "cdn-fastparcel.example",
              "/sig/okafor.gif",
              "0.4 KB",
              "recipient mail client"
            ]
          },
          {
            "hs": "beacon-token",
            "cells": [
              "25 Sep 09:34",
              "GET",
              "cdn-fastparcel.example",
              "/sig/okafor.gif?e=UQ4F…r7 (unique per recipient+open)",
              "0.6 KB",
              "recipient mail client"
            ]
          },
          {
            "hs": "pixel-benign",
            "cells": [
              "25 Sep 09:40",
              "GET",
              "track.newsletter-esp.example",
              "/o/ng-q4.gif (1x1 open pixel, ESP campaign)",
              "0.1 KB",
              "newsletter"
            ]
          },
          {
            "hs": "beacon-token",
            "cells": [
              "27 Sep 14:02",
              "GET",
              "cdn-fastparcel.example",
              "/sig/okafor.gif?e=9KdZ…m2 — 310 unique tokens over 4 days",
              "0.6 KB",
              "recipient mail client"
            ]
          }
        ]
      },
      {
        "id": "dlp",
        "kind": "table",
        "label": "DLP content inspection",
        "sub": "okafor.gif appended region",
        "tag": "HOST",
        "title": "DLP content-inspection alerts · decoded signature payload (SIM, UTC)",
        "meta": [
          [
            "Scope",
            "DLP ran its classifiers over the decoded comment block + appended blob (forensic copy only)"
          ]
        ],
        "columns": [
          "Time",
          "Rule",
          "Match",
          "Source",
          "Disposition"
        ],
        "rows": [
          {
            "hs": "dlp-payload",
            "cells": [
              "28 Sep 10:05",
              "Confidential — pricing",
              "Northglass Q4 price list (cost + margin columns) inside the appended blob",
              "okafor.gif trailer",
              "ALERT"
            ]
          },
          {
            "hs": "dlp-payload",
            "cells": [
              "28 Sep 10:05",
              "PII — customer contacts",
              "~1,400 customer name/email/phone rows in the base64 comment block",
              "okafor.gif comment",
              "ALERT"
            ]
          },
          [
            "28 Sep 10:06",
            "Marketing collateral",
            "Public Q4 press-kit copy (approved for release)",
            "email body",
            "INFO"
          ]
        ]
      },
      {
        "id": "ref",
        "kind": "terminal",
        "label": "Signature profile",
        "sub": "p.alvarez · sister mailbox",
        "reference": true,
        "note": "Reference · same team, same airplane-GIF style — a known-good signature",
        "title": "Signature profile · p.alvarez@northglass.example (SIM)",
        "lines": [
          "== file alvarez.gif",
          "alvarez.gif: GIF image data, version 89a, 320 x 180",
          "size on disk: 176 KB   (pixels ≈ 176 KB — no slack)",
          "",
          "== structure",
          "GIF89a header · graphic control per frame · 3B terminator at EOF",
          "no comment extension, no appended bytes, trailing entropy ≈ 0",
          "",
          "== delivery",
          "embedded via cid: (travels inside the message) — no remote <img>, no external fetch",
          "== end  ·  hash SIMULATION:1a0b3c…9e22"
        ]
      }
    ],
    "hotspots": {
      "gif-trailer": {
        "label": "Data appended after the GIF terminator",
        "source": "gif",
        "suspicious": true,
        "points": 3,
        "surface": "3B (GIF terminator) at 0x2FA40, then 1.58 MB of appended data follows",
        "underneath": "A GIF ends at its 3B trailer; decoders stop reading there and render the airplane normally. Anything after it is invisible to the viewer but still travels with the file. Here 1.58 MB rides past the terminator — the clean p.alvarez sig has nothing after its 3B.",
        "explain": "Appending a payload after the terminator is classic file-format steganography: the image looks and animates perfectly while carrying a hidden cargo a casual look never sees.",
        "ioc": "okafor.gif — 1.58 MB appended after the 3B GIF terminator"
      },
      "gif-entropy": {
        "label": "Size & entropy anomaly",
        "source": "gif",
        "suspicious": true,
        "points": 3,
        "surface": "1.84 MB file but only ~190 KB of pixels; trailing region entropy ≈ 7.98/8.0",
        "underneath": "The visible airplane is ~190 KB of pixel data, yet the file is 1.84 MB. The extra ~1.65 MB is near-maximum entropy — the fingerprint of encrypted or compressed data, not image content. A real 480x270 looping GIF this simple has no reason to be ten times its pixel size.",
        "explain": "A file far larger than its visible content, with a high-entropy tail, is a stego carrier. Entropy and size-vs-pixels are how you catch a hidden blob without ever decoding it.",
        "ioc": "okafor.gif — 1.84 MB file, ~190 KB pixels, trailing entropy ≈ 7.98"
      },
      "gif-comment": {
        "label": "Stuffed comment extension",
        "source": "gif",
        "suspicious": true,
        "points": 3,
        "surface": "21 FE comment extension holding 64 KB of base64 text (‘lc1:eyJ…’)",
        "underneath": "The GIF comment-extension block is meant for a short caption. This one carries 64 KB of base64 beginning ‘lc1:’ — a container, not a comment. DLP decoded it to ~1,400 customer contact rows. Legit signature GIFs (p.alvarez) carry no comment block at all.",
        "explain": "Over-stuffed metadata blocks — comment or application extensions — are a favourite place to tuck encoded data inside an otherwise valid image. The ‘lc1’ tag and base64 shape give it away.",
        "ioc": "okafor.gif — 64 KB base64 in GIF comment extension (‘lc1:’)"
      },
      "gif-dims": {
        "label": "Invisible 1x1 beacon frame",
        "source": "gif",
        "suspicious": true,
        "points": 3,
        "surface": "frame 12 is a 1x1 transparent pixel, 0 ms delay",
        "underneath": "The last ‘frame’ is a single transparent pixel shown for zero milliseconds — nothing a viewer ever sees. It exists only so the animation keeps a slot that forces the remote fetch each render. The airplane the recipient watches is frames 1–11.",
        "explain": "An invisible 1x1 frame bolted onto a real animation is a tracking-pixel trick smuggled inside the signature: no visual change, but every render still calls home.",
        "ioc": "okafor.gif — 1x1 transparent 0 ms frame (hidden beacon)"
      },
      "gif-legit": {
        "label": "Sister airplane signature",
        "source": "gif",
        "suspicious": false,
        "points": 1,
        "surface": "p.alvarez airplane sig: 176 KB, ends cleanly at 3B, cid: embedded",
        "underneath": "The same cute-airplane style from a teammate: pixel-sized file, no comment block, no appended bytes, embedded via cid: so it travels inside the message and never fetches anything remotely. This is what a normal signature GIF looks like.",
        "explain": "Not an indicator. An animated GIF signature is ordinary — half the floor has one. The problem isn’t the airplane; it’s the 1.58 MB behind it and the host it loads from.",
        "ioc": ""
      },
      "beacon-remote": {
        "label": "Remotely-loaded signature image",
        "source": "fetch",
        "suspicious": true,
        "points": 3,
        "surface": "GET cdn-fastparcel.example/sig/okafor.gif on every render",
        "underneath": "The signature <img> points at an external host instead of embedding the image (cid:). So every time a recipient — or anyone forwarded the mail — opens it, their client fetches the GIF and announces it. A remote image in a signature is a read-receipt the sender never had to ask for.",
        "explain": "A remote-loaded image turns a signature into a beacon: it reports who opened the mail, when, and from where. Legit signatures embed the image so nothing phones out.",
        "ioc": "Remote <img> → cdn-fastparcel[.]example/sig/okafor.gif (open beacon)"
      },
      "beacon-token": {
        "label": "Unique per-recipient tokens",
        "source": "fetch",
        "suspicious": true,
        "points": 3,
        "surface": "/sig/okafor.gif?e=UQ4F…r7 — 310 unique tokens over 4 days",
        "underneath": "Each fetch carries a different ?e= token, one per recipient-and-open. That maps exactly who read the press kit and when, and the token itself is a channel: an attacker-chosen string the client dutifully sends out on every render. 310 unique tokens is 310 confirmed opens phoned home.",
        "explain": "Per-recipient tokens on a remote image are both surveillance and a covert uplink — recipient telemetry plus a few attacker-controlled bytes leaving on every open. A static CDN asset doesn’t need a unique token per viewer.",
        "ioc": "cdn-fastparcel[.]example/sig/okafor.gif?e=<per-recipient token> (×310)"
      },
      "beacon-lookalike": {
        "label": "Look-alike CDN host",
        "source": "fetch",
        "suspicious": true,
        "points": 3,
        "surface": "cdn-fastparcel.example → 203.0.113.90, first seen 24 Sep, NS 198.51.100.53",
        "underneath": "Northglass’ real CDN is assets.fastparcel-cdn.example (198.51.100.21). The signature loads from cdn-fastparcel.example — the same words, reordered — on 203.0.113.90, first seen 24 Sep, and served by nameserver 198.51.100.53: the exact nameserver from the Exfil Whisper domain. Same operator, new disguise.",
        "explain": "A reordered look-alike of your own CDN name is built to pass a glance. The shared nameserver ties it straight to the earlier incident — this isn’t a coincidence or a vendor.",
        "ioc": "cdn-fastparcel[.]example (203.0.113[.]90, NS 198.51.100[.]53) — look-alike CDN"
      },
      "pixel-benign": {
        "label": "Newsletter open pixel",
        "source": "fetch",
        "suspicious": false,
        "points": 1,
        "surface": "track.newsletter-esp.example/o/ng-q4.gif — 1x1 ESP open pixel",
        "underneath": "The marketing newsletter uses the email-service provider’s standard open-tracking pixel. It’s a 1x1 on the provider’s own tracking host, tied to the approved campaign, and it carries no Northglass data — just ‘this newsletter was opened’.",
        "explain": "Not an indicator. Open-tracking pixels from your ESP are routine marketing telemetry on the provider’s domain. The beacon that matters rides on a look-alike of your own CDN and carries 310 per-recipient tokens.",
        "ioc": ""
      },
      "gw-external": {
        "label": "External sends with the weaponised signature",
        "source": "gw",
        "suspicious": true,
        "points": 3,
        "surface": "25 & 27 Sep — press kit to 37 external recipients, signature loads from cdn-fastparcel.example",
        "underneath": "The same signature that loads from the look-alike host went out to a 37-recipient external press list, twice. The mail body is the approved, public press kit — which is exactly why it sailed through: the leak isn’t in the body, it’s in the image the body quietly pulls from attacker infrastructure.",
        "explain": "Legit-looking outbound mail is the delivery vehicle: a clean, approved body carries a poisoned remote signature to dozens of external inboxes, each of which then beacons. The volume of external exposure is the scope.",
        "ioc": "t.okafor external sends (37 recipients ×2) carrying the remote signature"
      },
      "gw-deck": {
        "label": "Legit 14 MB campaign deck",
        "source": "gw",
        "suspicious": false,
        "points": 1,
        "surface": "26 Sep — ‘Campaign assets’ with a 14 MB slide deck attached",
        "underneath": "A genuinely large email: a 14 MB marketing slide deck sent to the real CDN/media contact. Big, but it’s an ordinary attachment of approved collateral, with the normal inline (cid:) signature, to a known address.",
        "explain": "Not an indicator. Size alone isn’t exfil — a 14 MB deck of public campaign art is just a big legit file. The covert channel is the 1.6 MB hidden behind a 0.3 MB ‘airplane’, not the honest 14 MB.",
        "ioc": ""
      },
      "dlp-payload": {
        "label": "Classified data in the decoded payload",
        "source": "dlp",
        "suspicious": true,
        "points": 3,
        "surface": "DLP matched the Q4 price list + ~1,400 customer contact rows inside the GIF",
        "underneath": "Run over the forensic copy, DLP found Northglass’ confidential Q4 price list (cost and margin columns) in the appended blob and ~1,400 customer name/email/phone rows in the base64 comment block. That’s what’s being carried out inside the airplane. (Contents are fictional placeholders in this simulation.)",
        "explain": "This is the stolen cargo: confidential pricing and customer PII encoded into an image that looks like a harmless signature. Finding it tells you the mission is a data breach, not just a sketchy picture.",
        "ioc": "Decoded payload: Q4 price list + ~1,400 customer contact records"
      }
    }
  },
  "decide": {
    "maxScore": 20,
    "sam": "Call it, justify it, then scope it twice — whose account, and how much data. The mailbox record, the fleet signature hunt, and the exfil estimate are below. Logs are UTC.",
    "classification": {
      "prompt": "How do you classify this incident?",
      "options": [
        {
          "id": "stego",
          "label": "Covert-channel data exfiltration via a weaponised signature GIF (steganography + remote beacon)",
          "detail": "Confidential data is hidden inside the airplane GIF, which also loads remotely so every open is a tracking callback.",
          "points": 5,
          "best": true,
          "feedback": "Correct. Data stuffed after the terminator and in a comment block, a 1x1 remote-load frame, per-recipient tokens to a look-alike CDN, and DLP confirming price list + customer PII inside. That’s a covert channel that doubles as a beacon — not a stray picture."
        },
        {
          "id": "ato",
          "label": "Account takeover / BEC on the marketing mailbox",
          "detail": "Someone has t.okafor’s account and is sending from it.",
          "points": 1,
          "feedback": "The account is almost certainly abused — but stopping at ‘ATO’ misses the point: the data leaves inside a steganographic image that beacons remotely. Secure the mailbox, yes, but the covert channel is the incident."
        },
        {
          "id": "malware",
          "label": "Malware attachment / malicious image file",
          "detail": "The GIF is a dropper the recipients will execute.",
          "points": 1,
          "feedback": "Nothing here executes — the GIF renders as a normal airplane. The threat is data hidden inside a valid image and a remote beacon, not code that runs on a recipient’s machine."
        },
        {
          "id": "fp",
          "label": "False positive — normal signature image / newsletter tracking",
          "detail": "It’s just a marketing GIF with open tracking, like everyone’s.",
          "points": 0,
          "feedback": "Unsafe. The ESP open pixel is the decoy. A 1.84 MB ‘airplane’ with 1.58 MB after its terminator, loading from a look-alike of your own CDN on the earlier incident’s nameserver, is not routine marketing."
        }
      ]
    },
    "justification": {
      "prompt": "Which of these are real indicators of the covert channel? Select all that apply, then submit.",
      "pointsEach": 1,
      "maxScore": 6,
      "options": [
        {
          "id": "j-trailer",
          "label": "1.58 MB of data appended after the GIF terminator (3B)",
          "correct": true
        },
        {
          "id": "j-entropy",
          "label": "A 1.84 MB file with ~190 KB of pixels and a high-entropy tail",
          "correct": true
        },
        {
          "id": "j-comment",
          "label": "64 KB of base64 stuffed into a GIF comment extension",
          "correct": true
        },
        {
          "id": "j-beacon",
          "label": "A remotely-loaded signature image with unique per-recipient tokens",
          "correct": true
        },
        {
          "id": "j-lookalike",
          "label": "A look-alike CDN host on the Exfil Whisper nameserver as the sole image source",
          "correct": true
        },
        {
          "id": "j-dlp",
          "label": "DLP matching the Q4 price list and ~1,400 customer records in the decoded payload",
          "correct": true
        },
        {
          "id": "j-image",
          "label": "The signature contains an image at all",
          "correct": false,
          "why": "Image signatures are everywhere — p.alvarez has one. The image isn’t the problem; what’s hidden behind it is."
        },
        {
          "id": "j-animated",
          "label": "The GIF is animated",
          "correct": false,
          "why": "A looping airplane is normal. Animation is the camouflage, not the indicator."
        },
        {
          "id": "j-pixel",
          "label": "There’s a tracking pixel in the marketing newsletter",
          "correct": false,
          "why": "The ESP open pixel is legitimate campaign telemetry on the provider’s own host — not Northglass data leaving."
        }
      ]
    },
    "logs": [
      {
        "kind": "meta",
        "title": "Mailbox & account record · t.okafor (SIM)",
        "rows": [
          [
            "Mailbox",
            "t.okafor@northglass.example — Tomas Okafor, marketing coordinator (SIM)"
          ],
          [
            "Signature source",
            "Central signature service pushes the HTML template; the <img> src was changed from assets.fastparcel-cdn.example to cdn-fastparcel.example"
          ],
          [
            "Template edit",
            "Signature template updated 24 Sep 21:40Z from a new OAuth app token — not from Tomas’ usual workstation"
          ],
          [
            "Sign-in anomaly",
            "Mailbox access from 203.0.113.90 (SIM) at 24 Sep 21:36Z; Tomas’ normal sign-ins are from the office range — he was on PTO 24–25 Sep"
          ],
          [
            "Credential",
            "Password last changed 11 Sep; a legacy app password (no MFA) was used for the foreign access — reused from an older breach list"
          ],
          [
            "Attribution tie",
            "cdn-fastparcel.example shares nameserver 198.51.100.53 and registrant ‘LNTRN Holdings’ with the Mission Three exfil domain"
          ]
        ]
      },
      {
        "kind": "table",
        "title": "Fleet signature hunt · cdn-fastparcel.example + remote-load sigs (SIM)",
        "columns": [
          "Mailbox",
          "Team",
          "Remote-load signature",
          "Loads from",
          "Appended payload",
          "Notes"
        ],
        "rows": [
          [
            "t.okafor",
            "Marketing",
            "Yes",
            "cdn-fastparcel.example",
            "Yes (1.58 MB)",
            "Alerting mailbox"
          ],
          [
            "p.alvarez",
            "Marketing",
            "No",
            "cid: embedded",
            "No",
            "Sister mailbox — clean"
          ],
          [
            "all other marketing",
            "Marketing",
            "No",
            "cid: embedded / assets.fastparcel-cdn.example",
            "No",
            "Standard template, clean"
          ],
          [
            "fleet (signature service)",
            "All staff",
            "Only t.okafor",
            "—",
            "None",
            "Only Okafor’s template was altered"
          ]
        ]
      },
      {
        "kind": "table",
        "title": "Exfil estimate · embedded payload + beacon (SIM)",
        "columns": [
          "Measure",
          "Value",
          "Basis"
        ],
        "rows": [
          [
            "Hidden in the GIF",
            "≈ 1.6 MB (1.58 MB appended blob + 64 KB comment block)",
            "Forensic breakdown"
          ],
          [
            "Decoded contents",
            "Q4 price list (cost/margin) + ~1,400 customer contact rows",
            "DLP classifiers"
          ],
          [
            "Attacker access to payload",
            "Confirmed — the GIF is hosted on the attacker’s own cdn-fastparcel.example",
            "Fetch log + hosting"
          ],
          [
            "Recipient opens mapped",
            "310 unique per-recipient tokens over 4 days",
            "Remote-image fetch log"
          ],
          [
            "External exposure",
            "37 external press recipients × 2 sends",
            "Gateway log"
          ],
          [
            "Scope bound",
            "One batch (this quarter’s price list + a customer slice) — not the whole CRM",
            "Payload size + DLP match"
          ]
        ]
      }
    ],
    "hint": "Tip: the embedded payload is bounded — it’s what fits in one 1.6 MB image, and DLP named it (the Q4 price list and ~1,400 contacts). Because the GIF lives on the attacker’s own host, treat that batch as fully in their hands. The 310 tokens are opens, i.e. surveillance, on top of the data.",
    "scopes": [
      {
        "id": "account",
        "label": "Account",
        "prompt": "Whose account, and is this an insider or a takeover?",
        "options": [
          {
            "id": "sc-okafor",
            "label": "t.okafor’s mailbox was compromised (account takeover): foreign sign-in, a legacy app password with no MFA, and a template edit from a new token while Tomas was on PTO. Treat Tomas as a victim, not the actor.",
            "points": 5,
            "best": true,
            "feedback": "Exactly. Every signal says the account was abused from outside — foreign IP, legacy app password, edit timed to his PTO. Secure the mailbox and the signature service; don’t burn the employee."
          },
          {
            "id": "sc-insider",
            "label": "Tomas Okafor is a malicious insider deliberately exfiltrating data.",
            "points": 1,
            "feedback": "The evidence points the other way: the edit came from a foreign IP on a legacy app password while he was on PTO. Keep an open mind, but don’t accuse the victim without evidence he acted."
          },
          {
            "id": "sc-allmkt",
            "label": "The entire marketing team’s signatures are compromised.",
            "points": 1,
            "feedback": "Over-scoped. The fleet signature hunt shows only Okafor’s template was altered; p.alvarez and the rest load embedded or from the real CDN."
          },
          {
            "id": "sc-none",
            "label": "No account issue — it’s just a misconfigured signature.",
            "points": 0,
            "feedback": "A signature template edited from a foreign IP on a dead app password, pointing at a look-alike CDN that hides a data payload, is not a misconfiguration."
          }
        ]
      },
      {
        "id": "data",
        "label": "Data",
        "prompt": "How much data got out?",
        "options": [
          {
            "id": "da-partial",
            "label": "One bounded batch (~1.6 MB: the Q4 price list + ~1,400 customer contacts) is confirmed in the attacker’s hands, plus open-telemetry on 37×2 external sends (310 opens). Treat that batch as breached and the signature a live beacon.",
            "points": 4,
            "best": true,
            "feedback": "Right. The payload is bounded by what fits in the image, DLP named it, and because the GIF is hosted by the attacker, assume they have it. The 310 tokens are recipient surveillance on top. Partial is still a reportable breach."
          },
          {
            "id": "da-none",
            "label": "Nothing got out — it’s only an image loading remotely.",
            "points": 0,
            "feedback": "The image is the exfil. ~1.6 MB of price list and customer PII is hidden inside it and the file lives on the attacker’s host; the 310 tokens confirm it was fetched repeatedly."
          },
          {
            "id": "da-all",
            "label": "The entire customer database has been exfiltrated.",
            "points": 1,
            "feedback": "Over-stated. The payload is bounded to one ~1.6 MB batch — a price list and ~1,400 contacts, not the whole CRM. Report what the forensic breakdown and DLP support."
          },
          {
            "id": "da-everything",
            "label": "Assume all of Northglass’ data is gone.",
            "points": 1,
            "feedback": "Over-scoped. The evidence names a specific, bounded batch. Report that, widen the hunt, but don’t open with the worst case to the CTO."
          }
        ]
      }
    ]
  },
  "contain": {
    "maxScore": 25,
    "sam": "Pick every action you’d take right now — and only those. Too little leaves the beacon firing and the mailbox open; too much blacks out email or has you fetching the attacker’s image yourself. When you’re set, execute.",
    "prompt": "Select your containment plan",
    "actions": [
      {
        "id": "blockbeacon",
        "kind": "required",
        "points": 5,
        "label": "Block cdn-fastparcel.example / 203.0.113.90 and strip remote images; quarantine messages carrying the signature",
        "detail": "Sinkhole the look-alike host at DNS + egress, block the beacon URL at the gateway, strip or block remote-image loads for the affected mail, and quarantine the queued/inbound copies.",
        "result": "cdn-fastparcel.example sinkholed and 203.0.113.90 blocked at 09:20Z; the gateway now strips the remote signature and quarantines the press-kit copies. New renders no longer call out.",
        "missed": "Every time a recipient reopens or forwards the press kit, the beacon fires again and another token leaves — the channel stays live until the host and the remote load are cut.",
        "feedback": "Cuts the covert channel at the host, the URL, and the remote-load path — the single most urgent move."
      },
      {
        "id": "secureacct",
        "kind": "required",
        "points": 4,
        "label": "Secure t.okafor’s mailbox: reset credentials, kill the legacy app password, revoke sessions & tokens, enforce MFA",
        "detail": "Reset the password, revoke the no-MFA legacy app password and the new OAuth app token, sign out all sessions, and require MFA.",
        "result": "Credentials reset and all sessions revoked at 09:24Z; the legacy app password and the rogue OAuth token are dead. The foreign IP can no longer reach the mailbox.",
        "missed": "Leave the app password or token alive and the attacker keeps the mailbox — they just re-point the signature or send again.",
        "feedback": "Shuts the door the attacker came through without blaming the employee whose account was abused."
      },
      {
        "id": "stripsig",
        "kind": "required",
        "points": 4,
        "label": "Remove the weaponised signature template and purge/recall the sent copies",
        "detail": "Revert Okafor’s signature in the central service to the clean embedded template, remove the hosted GIF reference, and purge/recall the press-kit messages that carry it.",
        "result": "Template reverted to the cid: airplane at 09:28Z; the altered template and its remote <img> are gone. Purge/recall issued for the two external sends; forensic copy of okafor.gif preserved.",
        "missed": "Leaving the altered template in place means the next message re-arms the beacon, and the already-sent copies keep calling home.",
        "feedback": "Removes the carrier itself — the poisoned template and the mails already carrying it."
      },
      {
        "id": "preserve",
        "kind": "required",
        "points": 4,
        "label": "Preserve the GIF, headers, and fetch logs as evidence before changing anything",
        "detail": "Snapshot okafor.gif (forensic copy), the message headers, the signature-service edit history, and the remote-image fetch logs to the evidence locker.",
        "result": "okafor.gif, headers, template edit trail, and the 310-token fetch log captured to the evidence locker at 09:18Z (before remediation). Hash SIMULATION:4c7e2a…b19f recorded.",
        "missed": "Purge first and you lose the payload, the token list, and the edit trail you need to prove what left and who touched it.",
        "feedback": "Preserves the artifacts that scope the breach and support the notification before you clean up."
      },
      {
        "id": "dataowner",
        "kind": "required",
        "points": 4,
        "label": "Scope the exposed data and notify the data-protection & data owners",
        "detail": "From the decoded payload, enumerate the exposed price list and customer records, preserve the affected-record list, and brief the data-protection lead for breach assessment.",
        "result": "Exposed set scoped: Q4 price list + ~1,400 customer contacts, confirmed in attacker hands; 37×2 external recipients’ opens mapped. Data-protection lead engaged; affected-record list preserved.",
        "missed": "No one owns the breach side — the exposed pricing and customer PII go unassessed and unreported, and affected people aren’t notified.",
        "feedback": "This is a data-breach case. Scoping the records and engaging the data owner is part of containment, not an afterthought."
      },
      {
        "id": "hunt",
        "kind": "required",
        "points": 4,
        "label": "Hunt the fleet for the same host, remote-load signatures, and foothold date",
        "detail": "Search the signature service and mail for cdn-fastparcel.example, remote-loaded signature images, appended-payload GIFs, and template edits around 24 Sep 21:40Z.",
        "result": "Fleet sweep: only t.okafor’s template was altered and only it loads from cdn-fastparcel.example. No other mailbox shows a remote-load signature or an appended-payload image. Legacy app passwords flagged for cleanup fleet-wide.",
        "missed": "If a second mailbox was seeded the same evening, it keeps beaconing after you’ve cleaned this one.",
        "feedback": "Confirms the blast radius before you call it contained — and catches the next altered template if there is one."
      },
      {
        "id": "report",
        "kind": "neutral",
        "points": 0,
        "label": "Report cdn-fastparcel.example to the CDN/registrar for takedown",
        "detail": "Share the fake-hash IOCs, the look-alike domain, and the host for suspension.",
        "result": "Provider opened a case and flagged the look-alike host. Useful intel — but takedown is external and slow; your sinkhole and remote-image strip are what stop the beacon now.",
        "missed": "",
        "feedback": "Good citizenship and good intel, but it doesn’t contain anything at Northglass by itself, so it scores zero either way. Put it in lessons learned."
      },
      {
        "id": "blockallimg",
        "kind": "overkill",
        "points": -3,
        "label": "Block all inline and remote images in email company-wide",
        "detail": "",
        "result": "Every newsletter, logo, and signature across Northglass breaks; the help desk lights up. The problem was one mailbox and one host.",
        "feedback": "Overreaction. Strip the remote load for the affected mail and block the look-alike host — don’t break every image in the company’s email."
      },
      {
        "id": "disablemail",
        "kind": "overkill",
        "points": -3,
        "label": "Disable the entire marketing team’s email until further notice",
        "detail": "",
        "result": "Marketing goes dark mid-campaign for a one-mailbox compromise. The hunt already showed the rest are clean.",
        "feedback": "Disproportionate. Secure Okafor’s mailbox and cut the channel; the rest of marketing can keep working."
      },
      {
        "id": "reimageall",
        "kind": "overkill",
        "points": -2,
        "label": "Reimage every marketing workstation",
        "detail": "",
        "result": "Days of rebuilds across clean machines. This was a mailbox + signature-service compromise, not endpoint malware.",
        "feedback": "Over-scoped. Nothing ran on an endpoint — the carrier is a hosted image and an altered template, not a dropper."
      },
      {
        "id": "testbeacon",
        "kind": "harmful",
        "points": -2,
        "label": "Forward the signature email to the SOC and open it to ‘see what the beacon does’",
        "detail": "",
        "result": "You just fired another token from a Northglass address and told the attacker someone’s looking. Analyse the captured logs instead.",
        "feedback": "Out of ROE. Don’t render or forward the live beacon — every open calls the attacker’s host. Work from the forensic copy and the fetch logs."
      },
      {
        "id": "fetchpayload",
        "kind": "harmful",
        "points": -2,
        "label": "Fetch cdn-fastparcel.example/sig/okafor.gif from the SOC to pull the payload",
        "detail": "",
        "result": "You sent a live request to the attacker’s host from Northglass, confirming someone’s investigating.",
        "feedback": "Don’t interact with attacker infrastructure. You already have a forensic copy of the GIF — decode that in isolation, not over the wire."
      },
      {
        "id": "floodbeacon",
        "kind": "harmful",
        "points": -5,
        "label": "Flood cdn-fastparcel.example with fake tokens to ‘poison’ the attacker’s data",
        "detail": "",
        "result": "You attacked external infrastructure from Northglass. Sam pulls you off the ticket.",
        "feedback": "Hard stop. Flooding or ‘poisoning’ is an offensive act and an ROE violation — and it tips the attacker off. Sinkhole and preserve, don’t retaliate."
      },
      {
        "id": "deleteclose",
        "kind": "underreaction",
        "points": -3,
        "label": "Just delete the one flagged email and close the ticket",
        "detail": "",
        "result": "The hosted GIF still beacons from every already-sent copy, the altered template re-arms on the next send, and the mailbox is still owned.",
        "feedback": "Underreaction. Deleting one message leaves the host, the template, the account, and the already-exposed data all in play."
      }
    ]
  },
  "document": {
    "maxScore": 25,
    "sam": "Write it for Northglass’ CTO and data-protection lead: what the channel was, which mailbox, how much data, what we did, and what changes so a trusted signature image can’t smuggle data out again. Defang indicators (cdn-fastparcel[.]example, 203.0.113[.]90). Your evidence board is on the right.",
    "fields": [
      {
        "id": "summary",
        "label": "Summary",
        "rows": 4,
        "placeholder": "What was the channel, whose mailbox, how much data?",
        "max": 6,
        "keys": [
          {
            "id": "k-stego",
            "label": "Identifies covert-channel / steganographic GIF exfil + remote beacon",
            "points": 2,
            "match": [
              [
                "stegano",
                "covert channel",
                "hidden (data|payload)",
                "exfiltrat",
                "data (theft|exfil)",
                "beacon",
                "tracking (pixel|beacon|image)"
              ]
            ]
          },
          {
            "id": "k-acct",
            "label": "Names the compromised t.okafor mailbox / account takeover",
            "points": 2,
            "match": [
              [
                "okafor",
                "marketing (mailbox|account)",
                "account takeover",
                "\\bato\\b",
                "compromised (mailbox|account)"
              ]
            ]
          },
          {
            "id": "k-data",
            "label": "States the exposed price list / customer data",
            "points": 2,
            "match": [
              [
                "price list",
                "pricing",
                "customer",
                "\\bpii\\b",
                "contact",
                "records?"
              ]
            ]
          }
        ]
      },
      {
        "id": "iocs",
        "label": "Indicators of compromise (IOCs)",
        "rows": 5,
        "placeholder": "Look-alike host, IP, beacon URL/token, GIF hash, mailbox — one per line, defanged.",
        "max": 9,
        "keys": [
          {
            "id": "k-host",
            "label": "Look-alike host cdn-fastparcel.example",
            "points": 2,
            "match": [
              [
                "cdn-fastparcel\\.example"
              ]
            ]
          },
          {
            "id": "k-ip",
            "label": "Beacon host IP 203.0.113.90",
            "points": 2,
            "match": [
              [
                "203\\.0\\.113\\.90"
              ]
            ]
          },
          {
            "id": "k-url",
            "label": "Beacon path / per-recipient token (/sig/okafor.gif?e=)",
            "points": 2,
            "match": [
              [
                "/sig/okafor\\.gif",
                "okafor\\.gif\\?e",
                "\\?e=",
                "per[- ]recipient token"
              ]
            ]
          },
          {
            "id": "k-gif",
            "label": "Signature GIF okafor.gif / its SIMULATION hash",
            "points": 1,
            "match": [
              [
                "okafor\\.gif",
                "4c7e2a"
              ]
            ]
          },
          {
            "id": "k-payload",
            "label": "Appended payload / comment-block stego",
            "points": 1,
            "match": [
              [
                "appended",
                "terminator",
                "comment (block|extension)",
                "trailer",
                "base64"
              ]
            ]
          },
          {
            "id": "k-mbx",
            "label": "Mailbox t.okafor@northglass.example",
            "points": 1,
            "match": [
              [
                "t\\.okafor",
                "okafor@northglass"
              ]
            ]
          }
        ]
      },
      {
        "id": "actions",
        "label": "Actions taken",
        "rows": 4,
        "placeholder": "What containment did you perform?",
        "max": 5,
        "keys": [
          {
            "id": "k-block",
            "label": "Channel cut (sinkhole host / block IP / strip remote images)",
            "points": 1,
            "match": [
              [
                "sinkhol",
                "block",
                "strip",
                "drop",
                "quarantin"
              ],
              [
                "cdn-fastparcel",
                "203\\.0\\.113\\.90",
                "remote image",
                "beacon",
                "host",
                "\\bip\\b"
              ]
            ]
          },
          {
            "id": "k-acct",
            "label": "Mailbox secured (reset / revoke sessions & app password / MFA)",
            "points": 1,
            "match": [
              [
                "reset",
                "revok",
                "disabl",
                "secur",
                "\\bmfa\\b"
              ],
              [
                "okafor",
                "mailbox",
                "account",
                "app password",
                "session",
                "token"
              ]
            ]
          },
          {
            "id": "k-sig",
            "label": "Weaponised signature template removed / messages purged",
            "points": 1,
            "match": [
              [
                "remov",
                "revert",
                "strip",
                "purg",
                "recall",
                "delet"
              ],
              [
                "signature",
                "template",
                "okafor\\.gif",
                "message",
                "sent"
              ]
            ]
          },
          {
            "id": "k-preserve",
            "label": "Evidence preserved before remediation",
            "points": 1,
            "match": [
              [
                "preserv",
                "snapshot",
                "captur",
                "image",
                "forensic"
              ],
              [
                "gif",
                "header",
                "fetch log",
                "evidence",
                "payload"
              ]
            ]
          },
          {
            "id": "k-data",
            "label": "Breach scoped and data owner notified",
            "points": 1,
            "match": [
              [
                "notif",
                "brief",
                "report",
                "assess"
              ],
              [
                "data[- ]?protection",
                "data owner",
                "customer",
                "breach",
                "privacy",
                "price"
              ]
            ]
          },
          {
            "id": "k-hunt",
            "label": "Fleet hunt performed",
            "points": 1,
            "match": [
              [
                "hunt",
                "sweep",
                "swept",
                "searched"
              ]
            ]
          }
        ]
      },
      {
        "id": "recommendation",
        "label": "Lessons learned",
        "rows": 4,
        "placeholder": "What should Northglass change so a trusted signature image can’t smuggle data out?",
        "max": 5,
        "keys": [
          {
            "id": "k-remote",
            "label": "Block/strip remote images; embed signature images (cid:) not remote <img>",
            "points": 1,
            "match": [
              [
                "remote image",
                "remote[- ]load",
                "external image",
                "proxy.*image",
                "block.*image",
                "embed",
                "cid:",
                "inline image"
              ]
            ]
          },
          {
            "id": "k-sigctrl",
            "label": "Lock down the signature service (change control, approved image hosts)",
            "points": 1,
            "match": [
              [
                "signature (service|template|management)",
                "change control",
                "approved (host|cdn|source)",
                "allow[- ]?list",
                "template.*(control|lock)"
              ]
            ]
          },
          {
            "id": "k-mfa",
            "label": "Kill legacy app passwords; enforce MFA / modern auth",
            "points": 1,
            "match": [
              [
                "legacy (app )?password",
                "app password",
                "\\bmfa\\b",
                "modern auth",
                "conditional access",
                "disable basic auth"
              ]
            ]
          },
          {
            "id": "k-dlp",
            "label": "Outbound DLP incl. image/attachment content inspection",
            "points": 1,
            "match": [
              [
                "dlp",
                "data loss",
                "content inspection",
                "outbound.*(scan|inspect)",
                "scan.*(image|attachment)",
                "egress.*mail"
              ]
            ]
          },
          {
            "id": "k-stegomon",
            "label": "Detect stego/anomalous files (entropy, size-vs-pixels, trailing bytes)",
            "points": 1,
            "match": [
              [
                "entropy",
                "size.*pixel",
                "trailing byte",
                "file (anomaly|carving)",
                "stegano",
                "oversized"
              ]
            ]
          },
          {
            "id": "k-hunt",
            "label": "Post-incident threat hunt / assume the operator pivots",
            "points": 1,
            "match": [
              [
                "threat hunt",
                "hunt for",
                "post[- ]incident",
                "assume.*pivot",
                "pivot",
                "attribution"
              ]
            ]
          }
        ]
      }
    ]
  },
  "debrief": {
    "maxScore": 100,
    "passScore": 70,
    "scoreBands": [
      {
        "min": 85,
        "label": "Incident handled — lead-ready",
        "note": "You saw past the airplane: cut the beacon and the look-alike host, secured the abused mailbox without burning the employee, scoped the exposed batch, and preserved the evidence. The CTO and the data-protection lead can act on this today."
      },
      {
        "min": 70,
        "label": "Solid containment",
        "note": "The beacon is cut and the mailbox is secured. Review the gaps below — they’re what separate good from lead-ready, especially the breach-scoping and evidence-preservation side."
      },
      {
        "min": 50,
        "label": "Partial — gaps remain",
        "note": "You spotted the covert channel, but something’s still open or the data scope is thin. Replay with the GIF breakdown and the fetch log side by side."
      },
      {
        "min": 0,
        "label": "Needs a second pass",
        "note": "Re-run Mission Four. Look past the picture: the bytes after the terminator, the look-alike host, and whose account was really sending."
      }
    ],
    "hook": {
      "title": "Shift channel · 10:10Z",
      "body": "Sam: Good eyes, Red. A picture everyone loves, hiding a price list and fourteen hundred customers. That takes someone who studied how Northglass trusts its own airplane.\n\nSam: And look at the thread. The phish used ‘LNTRN Bulk 7’. The poisoned model was uploaded by ‘lntrn’. The DNS whisper ran on 198.51.100.53 — and so does this look-alike CDN. Registrant on both: LNTRN Holdings. Four incidents, one hand on the lantern.\n\nSam: cdn-fastparcel.example is sinkholed, Okafor’s mailbox is locked, the template’s clean, and the data owner’s briefed. But we’ve been reacting to their moves for a month. Time we got ahead of one.\n\nSam: The second zone on that nameserver — lantern-court.example — just started answering. Whatever they’re lighting up next, I want us standing in it first.\n\n>> MISSION FIVE · LAST LIGHT — clearance pending"
    },
    "loreUnlock": {
      "id": "crumb-m4",
      "title": "Evidence locker · LC infrastructure map",
      "body": "cdn-fastparcel.example\n\n  A record: 203.0.113.90 — first seen 24 Sep (the day PRINT-07 was contained).\n  registrant org: “LNTRN Holdings”\n  nameserver: 198.51.100.53 — the Exfil Whisper nameserver.\n\nZones now answering on 198.51.100.53:\n  cdn-telemetry-sync.example   (M3 · DNS exfil — sinkholed)\n  cdn-fastparcel.example       (M4 · signature beacon — sinkholed)\n  lantern-court.example        (??? · started answering 28 Sep)\n\nThe ?e= tokens weren’t random. Decoded, they index a ‘court’ roster —\none entry per Northglass incident, M0 through M4, each marked ‘observed’.\nThey haven’t just been attacking us. They’ve been keeping score.\n\n(SIMULATED training lore)"
    },
    "lockedHint": "Score 70+ to open the evidence-locker crumb. Replay and cut the channel cleanly: sinkhole cdn-fastparcel.example and block 203.0.113.90, strip the remote signature image, secure Okafor’s mailbox (reset, revoke the legacy app password, MFA), remove the weaponised template and purge the sent copies, preserve the GIF and fetch logs, scope the exposed batch and notify the data owner, and hunt the fleet — without blacking out email or touching attacker infrastructure."
  }
};
