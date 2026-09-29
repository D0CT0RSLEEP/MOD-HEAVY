/**
 * MOD-HEAVY Mission One — embedded mission data (file:// fallback).
 * GENERATED from missions/m1.json by tools/build-embed.js. Do not edit by hand.
 */
window.MODHEAVY_M1_EMBED = {
  "id": "M1",
  "codename": "Phish in the Wire",
  "title": "Mission One — Phish in the Wire",
  "company": "Northglass Logistics (SIMULATED)",
  "disclaimer": "All people, mailboxes, domains (.example), IPs (documentation ranges), and files are fabricated for defensive training. Links and attachments in this mission are inert.",
  "shiftLead": "Sam",
  "estMinutes": "10–20",
  "briefing": {
    "alertId": "NGL-SOC-8907",
    "reported": "2026-09-22T14:24:10Z",
    "reportedLocal": "Tue 22 Sep 2026 · 10:24 ET (SIM)",
    "reporter": "m.okafor (AP clerk — SIM) via Report Phish button",
    "context": "Six days after the NG-WRKSTN-042 egress alert, Northglass Logistics’ Accounts Payable team hit the Report Phish button. A past-due invoice notice claiming to be from their freight vendor, Quillmarsh Freight Co., went to the whole AP distribution list. You have the reported message, the mail gateway trace, and read-only proxy and sign-in logs.",
    "reporterQuote": "Got a past-due notice from Quillmarsh — pretty sure we paid them last week? I didn’t click anything. Not sure about everyone else. — Marcus",
    "roe": [
      "Defend only — investigate, contain, escalate, document.",
      "Links and attachments here are inert. Inspect them; never open, detonate, or reply.",
      "Treat every name, domain, and IP as simulated fiction.",
      "Contain proportionally: stop the harm without breaking the business."
    ],
    "objective": "Detect the indicators, decide what this is and how far it spread, contain it, and write the incident report Sam forwards to the client.",
    "sam": "Four desks today: detect, decide, contain, document. Don’t trust the pretty parts of an email — trust the headers and the logs. And don’t click the thing."
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
    "sam": "Click anything in the reported message that looks worth a second look — sender, header details, links (hover first), attachment, the wording. Open the original headers too. Then call each one: suspicious indicator, or not an indicator. The August invoice from the real vendor is in the inbox for comparison.",
    "inbox": [
      {
        "id": "phish",
        "reported": true,
        "unread": true,
        "fromName": "Quillmarsh Freight Co. | Accounts Receivable",
        "fromAddr": "ar-notify@quillmarsh-frieght.example",
        "replyTo": "qm.billing.dept@mailbox-relay.example",
        "to": "Accounts Payable <ap-team@northglass.example>",
        "dateShort": "10:12 AM",
        "dateLong": "Tue 22 Sep 2026, 10:12 AM ET",
        "subject": "FINAL NOTICE: Past-due invoice INV-20931 — account hold in 24 hrs",
        "preview": "Our records show invoice INV-20931 ($18,442.60) remains unpaid…",
        "hotspots": {
          "from": "from",
          "replyTo": "replyto",
          "to": "to",
          "date": "date"
        },
        "headers": [
          {
            "lines": [
              "Received: from mx1.northglass.example (10.20.0.5) by mbx02.northglass.example",
              "    with SMTP id 7f3a91c2; Tue, 22 Sep 2026 14:12:39 +0000"
            ]
          },
          {
            "hs": "received",
            "lines": [
              "Received: from vps23.budgetcloud-hosting.example (vps23.budgetcloud-hosting.example [198.51.100.23])",
              "    (HELO quillmarsh-freight.example)",
              "    by mx1.northglass.example with ESMTP id 4Q2kLm9x; Tue, 22 Sep 2026 14:12:37 +0000"
            ]
          },
          {
            "hs": "auth",
            "lines": [
              "Authentication-Results: mx1.northglass.example;",
              "    spf=softfail (sender IP 198.51.100.23 not permitted) smtp.mailfrom=quillmarsh-frieght.example;",
              "    dkim=none (message not signed);",
              "    dmarc=fail (p=none) header.from=quillmarsh-frieght.example"
            ]
          },
          {
            "lines": [
              "Return-Path: <bounce-7731@quillmarsh-frieght.example>",
              "From: \"Quillmarsh Freight Co. | Accounts Receivable\" <ar-notify@quillmarsh-frieght.example>",
              "Reply-To: <qm.billing.dept@mailbox-relay.example>",
              "To: Accounts Payable <ap-team@northglass.example>",
              "Subject: FINAL NOTICE: Past-due invoice INV-20931 — account hold in 24 hrs",
              "Date: Tue, 22 Sep 2026 14:12:31 +0000",
              "Message-ID: <20260922141231.5521@quillmarsh-frieght.example>",
              "X-Mailer: LNTRN Bulk 7",
              "MIME-Version: 1.0",
              "Content-Type: multipart/mixed; boundary=\"----=_SIM_0x7Q\"",
              "X-Training-Notice: SIMULATED MESSAGE — MOD-HEAVY M1"
            ]
          }
        ],
        "body": [
          [
            "Hello Accounts Payable team,"
          ],
          [
            "Our records show invoice INV-20931 ($18,442.60) for August linehaul services remains unpaid. ",
            {
              "t": "This is your FINAL NOTICE. If payment is not confirmed within 24 hours, your account will be placed on credit hold and all scheduled pickups will be suspended.",
              "hs": "urgency"
            }
          ],
          [
            "Please review the invoice and confirm payment through our secure portal:"
          ],
          [
            {
              "link": "https://portal.quillmarsh-freight.example/invoices/INV-20931",
              "href": "https://quillmarsh-invoice-view.example/ng/sso/login?ref=INV-20931&u=ap-team",
              "hs": "link"
            }
          ],
          [
            {
              "t": "Please note: our remittance banking details have been updated. Use the new account details in the attached invoice for this and all future payments.",
              "hs": "bank"
            }
          ],
          [
            {
              "t": "Our phone lines are being upgraded this week, so please reply to this email only — do not call your account representative.",
              "hs": "nocall"
            }
          ],
          [
            "Thank you for your prompt attention,"
          ],
          [
            {
              "t": "Quillmarsh Freight Co. — Accounts Receivable\n1100 Harbor Reach Blvd, Port Quill (SIM)\nMoving freight since 1987",
              "hs": "signature",
              "block": true
            }
          ]
        ],
        "attachments": [
          {
            "name": "invoice.pdf.html",
            "size": "3 KB",
            "hs": "attachment"
          }
        ]
      },
      {
        "id": "reference",
        "note": "Reference · last month’s genuine invoice from the real vendor",
        "fromName": "Quillmarsh Freight Co. Billing",
        "fromAddr": "billing@quillmarsh-freight.example",
        "replyTo": "",
        "to": "Accounts Payable <ap-team@northglass.example>",
        "dateShort": "Aug 24",
        "dateLong": "Mon 24 Aug 2026, 9:03 AM ET",
        "subject": "Invoice INV-20688 — July statement",
        "preview": "Your July statement is ready in the customer portal…",
        "headers": [
          {
            "lines": [
              "Received: from mx1.northglass.example (10.20.0.5) by mbx02.northglass.example",
              "    with SMTP id 1b77e0aa; Mon, 24 Aug 2026 13:03:12 +0000",
              "Received: from mail.quillmarsh-freight.example (mail.quillmarsh-freight.example [192.0.2.80])",
              "    by mx1.northglass.example with ESMTPS id 9Tr2Pq1a; Mon, 24 Aug 2026 13:03:10 +0000",
              "Authentication-Results: mx1.northglass.example;",
              "    spf=pass smtp.mailfrom=quillmarsh-freight.example;",
              "    dkim=pass header.d=quillmarsh-freight.example;",
              "    dmarc=pass (p=reject) header.from=quillmarsh-freight.example",
              "From: \"Quillmarsh Freight Co. Billing\" <billing@quillmarsh-freight.example>",
              "To: Accounts Payable <ap-team@northglass.example>",
              "Subject: Invoice INV-20688 — July statement",
              "Date: Mon, 24 Aug 2026 13:03:05 +0000",
              "Message-ID: <inv20688.0824@quillmarsh-freight.example>",
              "X-Training-Notice: SIMULATED MESSAGE — MOD-HEAVY M1"
            ]
          }
        ],
        "body": [
          [
            "Hello Northglass AP,"
          ],
          [
            "Your July statement (INV-20688, $17,906.10, net 30) is ready in the customer portal at portal.quillmarsh-freight.example. Payment terms and remittance details are unchanged."
          ],
          [
            "Questions? Call your account rep, Lena, at the number on your contract."
          ],
          [
            {
              "t": "Quillmarsh Freight Co. — Accounts Receivable\n1100 Harbor Reach Blvd, Port Quill (SIM)\nMoving freight since 1987",
              "block": true
            }
          ]
        ],
        "attachments": [
          {
            "name": "INV-20688.pdf",
            "size": "88 KB"
          }
        ]
      },
      {
        "id": "itdesk",
        "fromName": "Northglass IT Service Desk",
        "fromAddr": "servicedesk@northglass.example",
        "replyTo": "",
        "to": "All Staff <all-staff@northglass.example>",
        "dateShort": "Sep 21",
        "dateLong": "Mon 21 Sep 2026, 4:40 PM ET",
        "subject": "Planned maintenance Saturday 06:00–08:00",
        "preview": "The ERP system will be read-only during Saturday maintenance…",
        "headers": [
          {
            "lines": [
              "Received: from app01.northglass.example (10.20.4.11) by mbx02.northglass.example; Mon, 21 Sep 2026 20:40:02 +0000",
              "Authentication-Results: mbx02.northglass.example; spf=pass; dkim=pass header.d=northglass.example; dmarc=pass",
              "From: \"Northglass IT Service Desk\" <servicedesk@northglass.example>",
              "X-Training-Notice: SIMULATED MESSAGE — MOD-HEAVY M1"
            ]
          }
        ],
        "body": [
          [
            "Hi all,"
          ],
          [
            "The ERP system will be read-only on Saturday from 06:00 to 08:00 ET for patching. No action needed. We will never ask for your password by email."
          ],
          [
            "— IT Service Desk"
          ]
        ],
        "attachments": []
      },
      {
        "id": "okafor",
        "fromName": "Marcus Okafor",
        "fromAddr": "m.okafor@northglass.example",
        "replyTo": "",
        "to": "Accounts Payable <ap-team@northglass.example>",
        "dateShort": "Sep 21",
        "dateLong": "Mon 21 Sep 2026, 11:15 AM ET",
        "subject": "Re: Q3 accrual schedule",
        "preview": "Updated the Quillmarsh line — August is paid, ACH cleared Friday.",
        "headers": [
          {
            "lines": [
              "Received: from mbx02.northglass.example (10.20.0.8) by mbx02.northglass.example; Mon, 21 Sep 2026 15:15:40 +0000",
              "Authentication-Results: mbx02.northglass.example; spf=pass; dkim=pass header.d=northglass.example; dmarc=pass",
              "From: \"Marcus Okafor\" <m.okafor@northglass.example>",
              "X-Training-Notice: SIMULATED MESSAGE — MOD-HEAVY M1"
            ]
          }
        ],
        "body": [
          [
            "Updated the Quillmarsh line — August is paid, ACH cleared Friday. Remittance went to the account on file."
          ],
          [
            "— Marcus"
          ]
        ],
        "attachments": []
      }
    ],
    "hotspots": {
      "from": {
        "label": "Sender identity",
        "suspicious": true,
        "points": 3,
        "surface": "Display name: “Quillmarsh Freight Co. | Accounts Receivable”",
        "underneath": "Actual address: ar-notify@quillmarsh-frieght.example — “frieght” swaps the i and e. The real vendor sends from quillmarsh-freight.example (compare the August invoice in this inbox).",
        "explain": "Display names are free text — anyone can type anything. The address is a lookalike (typosquat) of the real vendor domain. That’s the core impersonation.",
        "ioc": "quillmarsh-frieght.example — lookalike sender domain"
      },
      "replyto": {
        "label": "Reply-To header",
        "suspicious": true,
        "points": 3,
        "surface": "Reply-To: qm.billing.dept@mailbox-relay.example",
        "underneath": "Replies don’t go to the From address at all — they go to a mailbox on a free relay/webmail-style domain unrelated to the vendor.",
        "explain": "A Reply-To that differs from the sender, pointing at a free mailbox, is a classic way to collect replies (and payment-change conversations) off the spoofed domain.",
        "ioc": "qm.billing.dept@mailbox-relay.example — Reply-To diversion"
      },
      "to": {
        "label": "Recipient",
        "suspicious": false,
        "points": 1,
        "surface": "To: Accounts Payable <ap-team@northglass.example>",
        "underneath": "The AP distribution list. The genuine August invoice was sent to the same list.",
        "explain": "Not an indicator on its own — vendors bill the AP list all the time. It does matter for scope: everyone on the list (14 mailboxes) received it.",
        "ioc": ""
      },
      "date": {
        "label": "Sent time",
        "suspicious": false,
        "points": 1,
        "surface": "Tue 22 Sep 2026, 10:12 AM ET",
        "underneath": "Mid-morning on a business day, local time. Header Date: 14:12:31 +0000 (UTC).",
        "explain": "Normal business hours. Timing isn’t an indicator here — though you’ll want the UTC time to line up with the logs.",
        "ioc": ""
      },
      "received": {
        "label": "Received chain",
        "suspicious": true,
        "points": 3,
        "surface": "Received: from vps23.budgetcloud-hosting.example [198.51.100.23] (HELO quillmarsh-freight.example)",
        "underneath": "The first external hop is a rented cloud VPS, not the vendor’s mail server (the real vendor’s mail comes from mail.quillmarsh-freight.example [192.0.2.80]). The server announced itself (HELO) as the REAL vendor domain — which doesn’t match its own hostname.",
        "explain": "Read Received lines bottom-up: the lowest external hop is where the message entered. A generic VPS claiming to be the vendor is a strong forgery signal.",
        "ioc": "198.51.100.23 (vps23.budgetcloud-hosting.example) — sending IP"
      },
      "auth": {
        "label": "SPF / DKIM / DMARC",
        "suspicious": true,
        "points": 3,
        "surface": "spf=softfail · dkim=none · dmarc=fail (p=none)",
        "underneath": "SPF softfail: the sending IP isn’t authorized even by the lookalike domain’s own record. No DKIM signature. DMARC fails, but the lookalike domain’s policy is p=none, so the gateway delivered it anyway. The real vendor domain passes all three and publishes p=reject — which is exactly why the attacker registered a lookalike instead of spoofing the real one.",
        "explain": "Authentication results are some of the strongest header evidence you have. Also remember: a PASS only proves a domain authorized the sender — it never proves the domain is the one you think it is.",
        "ioc": "Auth: SPF softfail / DKIM none / DMARC fail (p=none)"
      },
      "link": {
        "label": "Link target",
        "suspicious": true,
        "points": 3,
        "surface": "Displayed: https://portal.quillmarsh-freight.example/invoices/INV-20931",
        "underneath": "Actual target (hover): https://quillmarsh-invoice-view.example/ng/sso/login?ref=INV-20931 — a different domain, and the path is a login page (“sso/login”), not an invoice.",
        "explain": "Link text is just text. The hover target is what matters. An invoice link that lands on a sign-in page on an unrelated domain is a credential-harvest pattern.",
        "ioc": "hxxps://quillmarsh-invoice-view[.]example/ng/sso/login — credential-harvest URL"
      },
      "urgency": {
        "label": "Urgency / threat",
        "suspicious": true,
        "points": 3,
        "surface": "“FINAL NOTICE … within 24 hours … credit hold … pickups suspended.”",
        "underneath": "Manufactured deadline plus a business-impact threat. The genuine vendor uses net-30 terms and polite statements (see August).",
        "explain": "Pressure is designed to make people act before they verify. Not proof on its own — but a reliable indicator alongside the technical evidence.",
        "ioc": ""
      },
      "bank": {
        "label": "Banking details change",
        "suspicious": true,
        "points": 3,
        "surface": "“Our remittance banking details have been updated … use the new account details.”",
        "underneath": "A payment-destination change requested by email, bundled with an overdue notice. Marcus’ Sept 21 email says August was already paid to the account on file.",
        "explain": "This is the invoice-fraud (business email compromise) half of the lure. Bank-detail changes must be verified out-of-band, using contact info already on file.",
        "ioc": ""
      },
      "nocall": {
        "label": "“Don’t call us”",
        "suspicious": true,
        "points": 3,
        "surface": "“Reply to this email only — do not call your account representative.”",
        "underneath": "The message actively discourages phone verification — and replies go to the Reply-To relay mailbox. The genuine August email invited a phone call.",
        "explain": "Blocking out-of-band verification is a tell. Legit vendors don’t mind you calling the number on your contract.",
        "ioc": ""
      },
      "signature": {
        "label": "Signature block",
        "suspicious": false,
        "points": 1,
        "surface": "Quillmarsh Freight Co. — Accounts Receivable / 1100 Harbor Reach Blvd…",
        "underneath": "Identical to the signature on the genuine August invoice.",
        "explain": "Not an indicator either way. Signatures, logos, and footers are trivially copied from real mail — a perfect signature proves nothing.",
        "ioc": ""
      },
      "attachment": {
        "label": "Attachment",
        "suspicious": true,
        "points": 3,
        "surface": "invoice.pdf.html · 3 KB",
        "underneath": "Real type: text/html (double extension — .pdf is a disguise). Sandbox summary (SIM): opens a local page styled like a Northglass sign-in prompt that submits to quillmarsh-invoice-view.example. No macros, no executable. Not opened on any endpoint.",
        "explain": "A “PDF” that is really HTML is a common way to smuggle a phishing form past link scanners. The sandbox summary gives you the verdict — no need to open it yourself.",
        "ioc": "invoice.pdf.html — HTML attachment disguised as PDF (SIM)"
      }
    }
  },
  "decide": {
    "maxScore": 20,
    "sam": "Call it, justify it, then scope it. The proxy and sign-in logs are UTC. Who clicked, and more importantly — who typed a password?",
    "classification": {
      "prompt": "How do you classify the reported message?",
      "options": [
        {
          "id": "phishing",
          "label": "Phishing",
          "detail": "Targeted vendor impersonation: credential harvest + invoice/payment fraud.",
          "points": 6,
          "best": true,
          "feedback": "Correct. Lookalike vendor domain, failed authentication, a disguised link to a login page, and a bank-detail change. This is targeted phishing, not junk."
        },
        {
          "id": "spam",
          "label": "Spam",
          "detail": "Unsolicited bulk junk. Delete and move on.",
          "points": 1,
          "feedback": "Spam is untargeted bulk mail. This impersonates a real Northglass vendor, targets the AP list, and harvests credentials. Filing it as spam skips the scoping step — and someone already clicked."
        },
        {
          "id": "legit",
          "label": "Legitimate",
          "detail": "A real past-due notice from Quillmarsh Freight.",
          "points": 0,
          "feedback": "Unsafe. The sender domain isn’t the vendor’s, authentication fails, and the link goes to a sign-in page on another domain. Marking this legitimate invites a payment to an attacker’s account."
        }
      ]
    },
    "justification": {
      "prompt": "Which of these are real indicators in this email? Select all that apply, then submit.",
      "pointsEach": 1,
      "maxScore": 6,
      "options": [
        {
          "id": "j-lookalike",
          "label": "The sender domain quillmarsh-frieght.example is a lookalike of the real quillmarsh-freight.example",
          "correct": true
        },
        {
          "id": "j-auth",
          "label": "SPF softfail, no DKIM signature, and DMARC fail for the From domain",
          "correct": true
        },
        {
          "id": "j-link",
          "label": "The link text shows the vendor portal, but the real target is a login page on quillmarsh-invoice-view.example",
          "correct": true
        },
        {
          "id": "j-attach",
          "label": "invoice.pdf.html is an HTML file wearing a PDF name",
          "correct": true
        },
        {
          "id": "j-reply",
          "label": "Reply-To diverts responses to a free relay mailbox, and the email says not to call",
          "correct": true
        },
        {
          "id": "j-bank",
          "label": "A sudden banking-details change paired with a 24-hour deadline",
          "correct": true
        },
        {
          "id": "j-hours",
          "label": "It was sent outside business hours",
          "correct": false,
          "why": "It arrived at 10:12 AM ET on a Tuesday."
        },
        {
          "id": "j-dl",
          "label": "It was addressed to a distribution list instead of a named person",
          "correct": false,
          "why": "The genuine August invoice went to the same AP list. Normal for vendor billing."
        },
        {
          "id": "j-sig",
          "label": "The signature block doesn’t match the vendor’s real one",
          "correct": false,
          "why": "It matches exactly — signatures are easy to copy, which is why they’re not evidence either way."
        }
      ]
    },
    "logs": {
      "trace": {
        "title": "Message trace · mail gateway (SIM)",
        "rows": [
          [
            "Message-ID",
            "<20260922141231.5521@quillmarsh-frieght.example>"
          ],
          [
            "Sender",
            "ar-notify@quillmarsh-frieght.example"
          ],
          [
            "Recipient",
            "ap-team@northglass.example → expanded to 14 mailboxes"
          ],
          [
            "Delivered",
            "14 / 14 at 14:12:39Z (10:12 ET)"
          ],
          [
            "Gateway verdict",
            "Delivered — DMARC fail but sender policy p=none (no enforcement)"
          ],
          [
            "User reports",
            "1 (m.okafor, 14:24:10Z)"
          ]
        ]
      },
      "proxy": {
        "title": "Web proxy log · Finance VLAN (SIM, UTC)",
        "columns": [
          "Time",
          "User",
          "Host",
          "Method",
          "Destination",
          "Dest IP",
          "Path",
          "Status",
          "Category"
        ],
        "rows": [
          [
            "14:02:11",
            "r.castillo",
            "NG-FIN-LT02",
            "GET",
            "erp.northglass.example",
            "10.20.4.20",
            "/ap/queue",
            "200",
            "Business"
          ],
          [
            "14:14:02",
            "d.whitfield",
            "NG-FIN-LT07",
            "GET",
            "quillmarsh-invoice-view.example",
            "203.0.113.77",
            "/ng/sso/login?ref=INV-20931",
            "200",
            "Newly registered"
          ],
          [
            "14:15:31",
            "d.whitfield",
            "NG-FIN-LT07",
            "POST",
            "quillmarsh-invoice-view.example",
            "203.0.113.77",
            "/ng/sso/auth",
            "302",
            "Newly registered"
          ],
          [
            "14:15:32",
            "d.whitfield",
            "NG-FIN-LT07",
            "GET",
            "portal.quillmarsh-freight.example",
            "192.0.2.81",
            "/invoices",
            "200",
            "Business"
          ],
          [
            "14:17:10",
            "t.nguyen",
            "NG-FIN-LT05",
            "GET",
            "weather.example",
            "198.51.100.140",
            "/forecast",
            "200",
            "General"
          ],
          [
            "14:21:47",
            "m.okafor",
            "NG-FIN-LT03",
            "GET",
            "quillmarsh-invoice-view.example",
            "203.0.113.77",
            "/ng/sso/login?ref=INV-20931",
            "200",
            "Newly registered"
          ],
          [
            "14:22:05",
            "m.okafor",
            "NG-FIN-LT03",
            "GET",
            "erp.northglass.example",
            "10.20.4.20",
            "/ap/vendors/quillmarsh",
            "200",
            "Business"
          ]
        ]
      },
      "signin": {
        "title": "Identity provider sign-in log (SIM, UTC)",
        "columns": [
          "Time",
          "User",
          "Result",
          "IP",
          "Location / network",
          "Client",
          "MFA"
        ],
        "rows": [
          [
            "07:58:12",
            "d.whitfield",
            "Success",
            "192.0.2.44",
            "Northglass HQ (office egress)",
            "Browser · Windows",
            "Push approved"
          ],
          [
            "09:55:40",
            "m.okafor",
            "Success",
            "192.0.2.44",
            "Northglass HQ (office egress)",
            "Browser · Windows",
            "Push approved"
          ],
          [
            "14:16:05",
            "d.whitfield",
            "Success",
            "203.0.113.77",
            "Hosting provider — never seen before",
            "Browser · Linux (headless UA)",
            "Push approved"
          ],
          [
            "14:18:40",
            "d.whitfield",
            "Success",
            "203.0.113.77",
            "Hosting provider — never seen before",
            "Mail API client",
            "Token (previously satisfied)"
          ],
          [
            "14:30:02",
            "t.nguyen",
            "Failure",
            "192.0.2.44",
            "Northglass HQ (office egress)",
            "Browser · Windows",
            "— (wrong password)"
          ]
        ]
      },
      "hint": "Tip: a GET means the page loaded. A POST to an auth path means someone submitted the form."
    },
    "scope": {
      "prompt": "What is the scope of the incident?",
      "options": [
        {
          "id": "s-none",
          "label": "Delivered only — nobody interacted with it.",
          "points": 0,
          "feedback": "The proxy log shows two users loading the phishing page, and one of them POSTing to it."
        },
        {
          "id": "s-clicks",
          "label": "Two users clicked the link, but nobody entered credentials.",
          "points": 2,
          "feedback": "Close, but look at 14:15:31Z: d.whitfield sent a POST to /ng/sso/auth — that’s the form submission. Forty seconds later, her account signs in from 203.0.113.77."
        },
        {
          "id": "s-dana",
          "label": "Two users opened the link. d.whitfield submitted credentials, and her account was signed into from 203.0.113.77 minutes later. m.okafor only loaded the page.",
          "points": 8,
          "best": true,
          "feedback": "Exactly. One confirmed account compromise (POST → sign-in from the phishing server’s IP → Mail API session), one click with no submission, twelve unopened copies still in inboxes."
        },
        {
          "id": "s-all",
          "label": "Treat all 14 AP mailboxes as compromised.",
          "points": 2,
          "feedback": "Over-scoped. The logs show interaction from two users and a credential submission from one. Scoping to evidence keeps containment proportional."
        }
      ]
    }
  },
  "contain": {
    "maxScore": 25,
    "sam": "Pick every action you’d take right now — and only those. Missed steps leave the door open. Overkill and unsafe steps cost you. When you’re set, execute the plan.",
    "prompt": "Select your containment plan",
    "actions": [
      {
        "id": "purge",
        "kind": "required",
        "points": 5,
        "label": "Purge the message from all mailboxes (org-wide search & purge)",
        "detail": "Remove all 14 delivered copies, including Deleted Items.",
        "result": "Search & purge complete: 14 copies located, 14 removed (one was already in m.okafor’s Deleted Items).",
        "missed": "The lure is still sitting in 13 AP inboxes. Someone else clicks it by Thursday.",
        "feedback": "Removes the lure before anyone else bites."
      },
      {
        "id": "blocksender",
        "kind": "required",
        "points": 3,
        "label": "Block the sender domain and Reply-To address at the mail gateway",
        "detail": "quillmarsh-frieght.example and qm.billing.dept@mailbox-relay.example",
        "result": "Gateway rules added: inbound from quillmarsh-frieght.example rejected; outbound to qm.billing.dept@mailbox-relay.example blocked. 2 retry attempts rejected at 15:02Z.",
        "missed": "The attacker can resend from the same domain, and replies to the relay mailbox still go out.",
        "feedback": "Stops repeat deliveries and cuts off the reply channel."
      },
      {
        "id": "blockurl",
        "kind": "required",
        "points": 4,
        "label": "Block the phishing URL/domain and 203.0.113.77 at the web proxy / DNS filter",
        "detail": "quillmarsh-invoice-view.example",
        "result": "Proxy + DNS block live at 14:44Z. 1 later attempt from NG-FIN-LT05 blocked at 14:51Z.",
        "missed": "The credential page is still reachable from inside Northglass.",
        "feedback": "Protects anyone who still has a copy — or a forwarded one."
      },
      {
        "id": "reset",
        "kind": "required",
        "points": 5,
        "label": "Reset d.whitfield’s password and revoke all active sessions and refresh tokens",
        "detail": "Force sign-out everywhere; password reset alone doesn’t kill issued tokens.",
        "result": "Password reset; 3 sessions and 1 refresh token revoked. The 203.0.113.77 Mail API session dropped at 14:41Z.",
        "missed": "The attacker still holds a working session for Dana’s mailbox.",
        "feedback": "Kicks the attacker out. Revoking sessions matters — tokens survive a password change."
      },
      {
        "id": "rules",
        "kind": "required",
        "points": 5,
        "label": "Check d.whitfield’s mailbox for attacker-created inbox or forwarding rules",
        "detail": "Review rules, forwarding settings, and delegates; remove anything malicious.",
        "result": "FOUND: rule “Invoice sync”, created 14:18:52Z from 203.0.113.77 — forwards mail containing “invoice”, “payment”, or “remittance” to qm.billing.dept@mailbox-relay.example, then marks it read. Rule removed; 4 forwarded messages logged for the report.",
        "missed": "A hidden rule named “Invoice sync” is still forwarding every invoice Dana receives to the attacker.",
        "feedback": "Attackers set up forwarding within minutes of getting in. This is how they stay in after a password reset."
      },
      {
        "id": "mfa",
        "kind": "required",
        "points": 3,
        "label": "Review d.whitfield’s registered MFA methods",
        "detail": "Remove any authenticator or phone she didn’t add herself.",
        "result": "FOUND: unfamiliar authenticator device registered 14:17:20Z. Removed; Dana re-enrolled in person with IT.",
        "missed": "An attacker-registered authenticator is still on Dana’s account — they can walk back in after the reset.",
        "feedback": "Attackers who get in often register their own MFA device for persistence."
      },
      {
        "id": "vendor",
        "kind": "neutral",
        "points": 0,
        "label": "Call Quillmarsh using the phone number on file to warn them they’re being impersonated",
        "detail": "Out-of-band, known-good contact only.",
        "result": "Quillmarsh AR (Lena) confirmed: no banking change, no overdue invoice. They’re filing a takedown for the lookalike domain.",
        "missed": "",
        "feedback": "Good practice and good partnership — it doesn’t contain anything at Northglass, so it’s worth no points either way. Put it in your recommendations."
      },
      {
        "id": "reply",
        "kind": "harmful",
        "points": -4,
        "label": "Reply to the sender asking them to confirm the invoice is genuine",
        "detail": "",
        "result": "Your reply went to qm.billing.dept@mailbox-relay.example. The attacker now knows AP is paying attention — and has your signature block.",
        "feedback": "Replies go straight to the attacker’s relay mailbox. Verify with the vendor using contact details you already have."
      },
      {
        "id": "open",
        "kind": "harmful",
        "points": -5,
        "label": "Open invoice.pdf.html on your analyst workstation to see what it does",
        "detail": "",
        "result": "You opened a credential-harvest page on a production machine. Luckily it only wanted a password. Next one might not.",
        "feedback": "Never open suspicious files on a normal workstation. The sandbox summary already gave you the verdict."
      },
      {
        "id": "blockreal",
        "kind": "harmful",
        "points": -3,
        "label": "Block the real vendor domain quillmarsh-freight.example",
        "detail": "",
        "result": "Legitimate Quillmarsh invoices and shipping notices now bounce. Warehouse misses two pickup confirmations.",
        "feedback": "The real vendor is being impersonated — they’re a victim, not the attacker. Blocking them breaks the business."
      },
      {
        "id": "reimage",
        "kind": "overkill",
        "points": -2,
        "label": "Wipe and reimage d.whitfield’s laptop immediately",
        "detail": "",
        "result": "Dana loses a day of work. Reimaging doesn’t touch her cloud session or mailbox rules.",
        "feedback": "Overkill on this evidence. It was a browser credential phish — nothing shows code ran on NG-FIN-LT07. The compromise lives in her identity and mailbox, not her disk."
      },
      {
        "id": "disableall",
        "kind": "overkill",
        "points": -3,
        "label": "Disable every AP team account until the investigation is finished",
        "detail": "",
        "result": "Northglass can’t pay anyone today. The CFO calls Sam.",
        "feedback": "Scope showed one submitted credential. Disabling 14 accounts stops the business to fix one."
      },
      {
        "id": "warnall",
        "kind": "harmful",
        "points": -3,
        "label": "Forward the phishing email to all staff as a warning",
        "detail": "",
        "result": "You re-delivered a working credential lure to about 300 people.",
        "feedback": "Warn with a screenshot and defanged indicators — never forward the live message."
      }
    ]
  },
  "document": {
    "maxScore": 25,
    "sam": "Write it for the client: what happened, what to watch for, what we did, what they should change. Defang indicators (quillmarsh-frieght[.]example, 203.0.113[.]77). Your evidence board is on the right.",
    "fields": [
      {
        "id": "summary",
        "label": "Summary",
        "rows": 4,
        "placeholder": "What happened, who was affected, how bad is it?",
        "max": 6,
        "keys": [
          {
            "id": "k-phish",
            "label": "Identifies it as phishing / credential harvest",
            "points": 2,
            "match": [
              [
                "phish",
                "credential[- ]?harvest"
              ]
            ]
          },
          {
            "id": "k-vendor",
            "label": "Names the vendor impersonation / invoice lure",
            "points": 2,
            "match": [
              [
                "quillmarsh",
                "vendor",
                "invoice"
              ]
            ]
          },
          {
            "id": "k-user",
            "label": "States d.whitfield’s credentials/account were compromised",
            "points": 2,
            "match": [
              [
                "whitfield",
                "dana"
              ],
              [
                "credential",
                "password",
                "sign[- ]?in",
                "compromis",
                "account"
              ]
            ]
          }
        ]
      },
      {
        "id": "iocs",
        "label": "Indicators of compromise (IOCs)",
        "rows": 5,
        "placeholder": "Domains, IPs, addresses, file names — one per line, defanged.",
        "max": 9,
        "keys": [
          {
            "id": "k-lookalike",
            "label": "Lookalike sender domain quillmarsh-frieght.example",
            "points": 2,
            "match": [
              [
                "quillmarsh-frieght\\.example"
              ]
            ]
          },
          {
            "id": "k-phishdomain",
            "label": "Phishing domain quillmarsh-invoice-view.example",
            "points": 2,
            "match": [
              [
                "quillmarsh-invoice-view\\.example"
              ]
            ]
          },
          {
            "id": "k-ip77",
            "label": "Phishing server / attacker sign-in IP 203.0.113.77",
            "points": 2,
            "match": [
              [
                "203\\.0\\.113\\.77"
              ]
            ]
          },
          {
            "id": "k-ip23",
            "label": "Sending IP 198.51.100.23",
            "points": 1,
            "match": [
              [
                "198\\.51\\.100\\.23"
              ]
            ]
          },
          {
            "id": "k-relay",
            "label": "Reply-To / forwarding mailbox qm.billing.dept@mailbox-relay.example",
            "points": 1,
            "match": [
              [
                "mailbox-relay\\.example"
              ]
            ]
          },
          {
            "id": "k-attach",
            "label": "Attachment invoice.pdf.html",
            "points": 1,
            "match": [
              [
                "invoice\\.pdf\\.html"
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
            "id": "k-purge",
            "label": "Message purged from mailboxes",
            "points": 1,
            "match": [
              [
                "purg",
                "remov\\w* (the |all )?(message|email|cop)",
                "delet\\w* (the |all )?(message|email|cop)"
              ]
            ]
          },
          {
            "id": "k-block",
            "label": "Sender / domain / URL blocked",
            "points": 1,
            "match": [
              [
                "block"
              ]
            ]
          },
          {
            "id": "k-reset",
            "label": "Password reset and sessions revoked",
            "points": 1,
            "match": [
              [
                "reset",
                "revok"
              ]
            ]
          },
          {
            "id": "k-rule",
            "label": "Malicious inbox / forwarding rule removed",
            "points": 1,
            "match": [
              [
                "rule",
                "forward"
              ]
            ]
          },
          {
            "id": "k-mfa",
            "label": "MFA methods reviewed / rogue device removed",
            "points": 1,
            "match": [
              [
                "mfa",
                "authenticator",
                "multi[- ]?factor",
                "2fa"
              ]
            ]
          }
        ]
      },
      {
        "id": "recommendation",
        "label": "Recommendation",
        "rows": 4,
        "placeholder": "What should Northglass change so this doesn’t work next time?",
        "max": 5,
        "keys": [
          {
            "id": "k-train",
            "label": "Targeted awareness training for AP / finance",
            "points": 1,
            "match": [
              [
                "train",
                "awareness",
                "educat"
              ]
            ]
          },
          {
            "id": "k-verify",
            "label": "Out-of-band verification for bank-detail / payment changes",
            "points": 1,
            "match": [
              [
                "call[- ]?back",
                "out[- ]of[- ]band",
                "verif",
                "phone",
                "number on file"
              ]
            ]
          },
          {
            "id": "k-banner",
            "label": "External-sender banner / tagging",
            "points": 1,
            "match": [
              [
                "banner",
                "external[- ](sender|email|mail|tag|warning|label)"
              ]
            ]
          },
          {
            "id": "k-lookalike-mon",
            "label": "Lookalike-domain monitoring / DMARC enforcement",
            "points": 1,
            "match": [
              [
                "lookalike",
                "typo[- ]?squat",
                "dmarc",
                "domain monitor",
                "newly registered"
              ]
            ]
          },
          {
            "id": "k-attachpolicy",
            "label": "Block or quarantine HTML attachments",
            "points": 1,
            "match": [
              [
                "html attach",
                "attachment (filter|polic|block|quarantin|strip)",
                "block\\w* \\S*\\.?html",
                "quarantin\\w* html"
              ]
            ]
          },
          {
            "id": "k-phishres",
            "label": "Phishing-resistant MFA (e.g. security keys / number matching)",
            "points": 1,
            "match": [
              [
                "phishing[- ]resistant",
                "fido",
                "security key",
                "passkey",
                "number[- ]matching"
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
        "note": "Clean detection, proportional containment, and a report the client can act on. Sam barely had to edit it."
      },
      {
        "min": 70,
        "label": "Solid containment",
        "note": "The door is shut. Review the gaps below — they’re what separate good from lead-ready."
      },
      {
        "min": 50,
        "label": "Partial — gaps remain",
        "note": "You caught the phish, but something is still open or the report is thin. Replay with the logs and the containment list side by side."
      },
      {
        "min": 0,
        "label": "Needs a second pass",
        "note": "Re-run Mission One. Slow down on the headers and logs, and prefer proportional containment over guesswork."
      }
    ],
    "hook": {
      "title": "Shift channel · 14:52Z",
      "body": "Sam: Nice work on Quillmarsh. One thing is bugging me.\n\nSam: 203.0.113.77 — the phishing page lived there, and that’s where Dana’s session came from. It’s also the address NG-WRKSTN-042 was beaconing to last week. The warehouse PC. Mission Zero wasn’t noise.\n\nSam: Somebody was already inside Northglass before this email landed. The phish was the second move, not the first.\n\nSam: Pull 042’s process tree first thing tomorrow.\n\n>> MISSION TWO · GHOST PROCESS — clearance pending"
    },
    "loreUnlock": {
      "id": "crumb-m1",
      "title": "Evidence locker · LNTRN",
      "body": "X-Mailer: LNTRN Bulk 7\nRule name: Invoice sync\nRelay: qm.billing.dept@mailbox-relay.example\n\nThe relay mailbox received forwards from two other simulated CyberLabs clients this month. Same mailer string every time. Somebody signs their work.\n\nNote clipped to the Training Division archive, unsigned:\n  “They don’t break in. They get invited. Watch the lanterns.”\n\n(SIMULATED training lore)"
    },
    "lockedHint": "Score 70+ to open the evidence-locker crumb. Replay and make sure every open door is shut: purge, blocks, session revoke, forwarding rules, MFA."
  }
};
