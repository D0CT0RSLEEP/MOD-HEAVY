/**
 * MOD-HEAVY Mission Three — embedded mission data (file:// fallback).
 * GENERATED from missions/m3.json by tools/build-embed.js. Do not edit by hand.
 */
window.MODHEAVY_M3_EMBED = {
  "id": "M3",
  "codename": "Exfil Whisper",
  "title": "Mission Three — Exfil Whisper",
  "company": "Northglass Logistics (SIMULATED)",
  "disclaimer": "All people, hosts, domains (.example), IPs (documentation ranges), hashes (SIMULATION), file names, and commands are fabricated for defensive training. Nothing in this mission is runnable or real: the domains don’t resolve, the nameserver answers nothing, the staged files are empty placeholders, and every credential string is fake.",
  "shiftLead": "Sam",
  "estMinutes": "20–30",
  "briefing": {
    "alertId": "NGL-SOC-8961",
    "reported": "2026-09-24T11:48:20Z",
    "reportedLocal": "Thu 24 Sep 2026 · 07:48 ET (SIM)",
    "reporter": "Netflow anomaly watch (overnight DNS baseline deviation on the warehouse VLAN)",
    "context": "The build server is contained and 203.0.113.77 is blocked fleet-wide. But while you were shutting Mission Two’s doors, the netflow team’s overnight baseline flagged the warehouse VLAN: a steady trickle of DNS lookups all night, every night this week, to names no human would type. Too small to be a download, too regular to be a person. It traces to NG-WH-PRINT-07 — a Linux label-printer controller nobody thinks about, which happens to mount the billing-exports fileshare so it can print invoices. You have the resolver query log, the host’s scheduled tasks, a listing of a hidden staging directory, the perimeter egress log, and a known-good DNS profile from a sister label host for comparison.",
    "reporterQuote": "PRINT-07? That box just makes shipping labels. It’s been here since before I started — I don’t think it’s even in the EDR rollout. — Riya Chandra, infrastructure",
    "roe": [
      "Defend only — investigate, contain, escalate, document.",
      "Evidence is read-only. Don’t run, resolve, or “test” anything you find, and never query or probe attacker infrastructure.",
      "Treat every name, domain, hash, and IP as simulated fiction.",
      "Contain proportionally: stop the leak without blacking out the warehouse."
    ],
    "objective": "Find the covert channel carrying data out of Northglass, decide what it is and how much got out, cut it off at the host and the perimeter, and write the incident report Sam sends to Northglass’ CTO and data-protection lead.",
    "sam": "Same four desks. Mission Two was loud — a process, a beacon, a bad PR. This one is quiet on purpose. The traffic is tiny and it hides inside the one protocol we almost never block. Don’t look for volume. Look for shape: where the lookups go, how random the names are, and when they happen."
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
    "sam": "Five evidence sources across the top. Open each one and inspect anything highlighted — query rows, task lines, directory entries, egress rows. Call each: suspicious indicator, or not an indicator. The PRINT-09 profile is a known-good night from a sister label host — use it to see what “normal” DNS looks like here.",
    "sources": [
      {
        "id": "dns",
        "kind": "table",
        "label": "DNS resolver log",
        "sub": "NG-WH-PRINT-07 · 24 Sep 00:00–05:00Z",
        "tag": "ALERT HOST",
        "title": "Internal resolver query log · NG-WH-PRINT-07 (SIM, UTC)",
        "meta": [
          [
            "Host",
            "NG-WH-PRINT-07 (10.20.9.18) · Linux label-printer controller (SIM)"
          ],
          [
            "VLAN",
            "Warehouse (10.20.9.0/24) · egress heavily filtered; DNS to the internal resolver is allowed"
          ],
          [
            "Resolver",
            "10.20.6.53 (internal) — forwards recursively"
          ],
          [
            "Window",
            "24 Sep 00:00–05:00Z (overnight; no shipping activity)"
          ],
          [
            "Most-queried external domain",
            {
              "t": "*.sync.cdn-telemetry-sync.example — 3,060 unique lookups overnight (first seen 22 Sep)",
              "hs": "dns-lookalike"
            }
          ]
        ],
        "columns": [
          "Time",
          "Query name",
          "Type",
          "Answer",
          "Resolver"
        ],
        "rows": [
          [
            "00:14:02",
            "pkg-mirror.northglass.example",
            "A",
            "10.20.6.40",
            "10.20.6.53"
          ],
          {
            "hs": "dns-cdn",
            "cells": [
              "00:31:19",
              "assets.fastparcel-cdn.example",
              "A",
              "198.51.100.21",
              "10.20.6.53"
            ]
          },
          {
            "hs": "dns-cdn",
            "cells": [
              "00:31:19",
              "img.fastparcel-cdn.example",
              "A",
              "198.51.100.21",
              "10.20.6.53"
            ]
          },
          {
            "hs": "dns-entropy",
            "cells": [
              "01:00:08",
              "mfqx7k2j9b3d6a8h4t2w.sync.cdn-telemetry-sync.example",
              "A",
              "198.51.100.53",
              "10.20.6.53"
            ]
          },
          {
            "hs": "dns-txt",
            "cells": [
              "01:01:09",
              "ctl.p0362.sync.cdn-telemetry-sync.example",
              "TXT",
              "(empty)",
              "10.20.6.53"
            ]
          },
          [
            "01:01:40",
            "ntp.northglass.example",
            "A",
            "10.20.6.31",
            "10.20.6.53"
          ],
          {
            "hs": "dns-entropy",
            "cells": [
              "01:02:08",
              "7t4wzc2qk9m3x8b6h2fa.sync.cdn-telemetry-sync.example",
              "A",
              "198.51.100.53",
              "10.20.6.53"
            ]
          },
          {
            "hs": "dns-txt",
            "cells": [
              "01:02:09",
              "ctl.p0363.sync.cdn-telemetry-sync.example",
              "TXT",
              "(empty)",
              "10.20.6.53"
            ]
          },
          {
            "hs": "dns-txt",
            "cells": [
              "01:03:09",
              "ctl.p0364.sync.cdn-telemetry-sync.example",
              "TXT",
              "(empty)",
              "10.20.6.53"
            ]
          },
          [
            "02:58:30",
            "wh-fileshare.northglass.example",
            "A",
            "10.20.6.60",
            "10.20.6.53"
          ],
          {
            "hs": "dns-entropy",
            "cells": [
              "03:00:08",
              "k2j9mfqx7b3d6a8h4t2w.sync.cdn-telemetry-sync.example",
              "A",
              "198.51.100.53",
              "10.20.6.53"
            ]
          }
        ]
      },
      {
        "id": "cron",
        "kind": "terminal",
        "label": "Scheduled tasks",
        "sub": "NG-WH-PRINT-07 · svc-print",
        "tag": "HOST",
        "title": "Scheduled tasks & timers · NG-WH-PRINT-07 (SIM)",
        "lines": [
          "== systemctl --user list-timers  (user: svc-print)",
          "NEXT (UTC)            UNIT                      ACTIVATES",
          "02:00  daily          backup-labels.timer       backup-labels.service   (rsync spool -> 10.20.6.60)",
          "01:00  every min 01-03h labelcache.timer         labelcache.service      (see below)",
          "",
          "== crontab -l  (user: svc-print)",
          "0 2 * * *   /usr/bin/logrotate /home/svc-print/etc/logrotate.conf      # rotate print logs",
          {
            "t": "* 1-3 * * *  /home/svc-print/.cache/.spool/.sync/labelcache --flush   # (not in software inventory)",
            "hs": "cron-exfil"
          },
          "",
          "== unit: backup-labels.service",
          {
            "t": "ExecStart=/usr/bin/rsync -a /var/spool/labels/ rsync://10.20.6.60/label-backups/  (nightly 02:00, since 2024)",
            "hs": "cron-backup"
          },
          "",
          "== file: /home/svc-print/.cache/.spool/.sync/labelcache",
          {
            "t": "ELF 64-bit executable · owner svc-print · created 21 Sep 20:11Z · hash SIMULATION:9ad3f1…e70c · reads ../stage/*.b32, base32-encodes, emits them as DNS labels under sync.cdn-telemetry-sync.example",
            "hs": "cron-script"
          },
          "== end"
        ]
      },
      {
        "id": "stage",
        "kind": "table",
        "label": "Staging directory",
        "sub": "~/.cache/.spool/.sync/ (hidden)",
        "tag": "HOST",
        "title": "Directory listing · /home/svc-print/.cache/.spool/.sync/ (SIM, UTC)",
        "meta": [
          [
            "Path",
            "/home/svc-print/.cache/.spool/.sync/ — hidden dir inside svc-print’s cache (created 21 Sep 20:11Z)"
          ],
          [
            "Not present on",
            "sister host NG-WH-PRINT-09 (same image, same role)"
          ]
        ],
        "columns": [
          "Mode",
          "Size",
          "Modified",
          "Name"
        ],
        "rows": [
          {
            "hs": "stage-archive",
            "cells": [
              "-rw-------",
              "46 MB",
              "09-22 00:58",
              "stage/invoices_export_2026Q3.tar.gz"
            ]
          },
          {
            "hs": "stage-archive",
            "cells": [
              "-rw-------",
              "9.4 MB",
              "09-22 00:58",
              "stage/ap_vendor_master.csv"
            ]
          },
          {
            "hs": "stage-dir",
            "cells": [
              "-rw-------",
              "180 B",
              "09-24 03:59",
              "out/q008639.b32"
            ]
          },
          {
            "hs": "stage-dir",
            "cells": [
              "-rw-------",
              "180 B",
              "09-24 03:59",
              "out/q008640.b32"
            ]
          },
          {
            "hs": "stage-dir",
            "cells": [
              "-rw-------",
              "92 B",
              "09-24 03:59",
              "out/.cursor"
            ]
          },
          [
            "-rwx------",
            "41 KB",
            "09-21 20:11",
            "labelcache"
          ],
          {
            "hs": "stage-spool",
            "cells": [
              "drwxr-xr-x",
              "12 MB",
              "09-24 07:30",
              "/var/spool/labels (current shipping labels)"
            ]
          }
        ]
      },
      {
        "id": "egress",
        "kind": "table",
        "label": "Perimeter egress log",
        "sub": "NG-WH-PRINT-07 · 24 Sep 00:00–05:00Z",
        "tag": "NETWORK",
        "title": "Perimeter firewall egress · NG-WH-PRINT-07 (SIM, UTC)",
        "columns": [
          "Time",
          "Proto/Port",
          "Destination",
          "Note",
          "Out",
          "In"
        ],
        "rows": [
          [
            "00:31:19",
            "TCP/443",
            "198.51.100.21 (fastparcel-cdn.example)",
            "label-stock image fetch",
            "2.1 KB",
            "88 KB"
          ],
          {
            "hs": "dns-external",
            "cells": [
              "01:00:08",
              "UDP/53",
              "198.51.100.53 (external)",
              "DNS direct — bypasses internal resolver 10.20.6.53",
              "181 B",
              "96 B"
            ]
          },
          {
            "hs": "egress-cadence",
            "cells": [
              "01:01:09",
              "UDP/53",
              "198.51.100.53 (external)",
              "burst of 17 queries, then ~58 s silent — 01:00–04:00 only",
              "3.1 KB",
              "1.1 KB"
            ]
          },
          {
            "hs": "egress-cadence",
            "cells": [
              "01:02:09",
              "UDP/53",
              "198.51.100.53 (external)",
              "same burst, same size, same cadence, no shipping load",
              "3.1 KB",
              "1.1 KB"
            ]
          },
          [
            "02:00:04",
            "TCP/873",
            "10.20.6.60 (internal)",
            "nightly rsync label backup",
            "4 KB",
            "0 B"
          ],
          [
            "04:12:40",
            "TCP/443",
            "10.20.6.41 (internal os-updates)",
            "package metadata",
            "0.6 KB",
            "2.2 MB"
          ],
          {
            "hs": "egress-cadence",
            "cells": [
              "03:59:09",
              "UDP/53",
              "198.51.100.53 (external)",
              "last burst of the night, then silent until 01:00",
              "3.1 KB",
              "1.1 KB"
            ]
          }
        ]
      },
      {
        "id": "dnsref",
        "kind": "table",
        "label": "DNS resolver log",
        "sub": "NG-WH-PRINT-09 · same night",
        "reference": true,
        "note": "Reference · same image, same role, same VLAN — a known-good overnight DNS profile",
        "title": "Internal resolver query log · NG-WH-PRINT-09 (SIM, UTC)",
        "columns": [
          "Time",
          "Query name",
          "Type",
          "Answer",
          "Resolver"
        ],
        "rows": [
          [
            "00:14:05",
            "pkg-mirror.northglass.example",
            "A",
            "10.20.6.40",
            "10.20.6.53"
          ],
          [
            "00:31:22",
            "assets.fastparcel-cdn.example",
            "A",
            "198.51.100.21",
            "10.20.6.53"
          ],
          [
            "01:01:40",
            "ntp.northglass.example",
            "A",
            "10.20.6.31",
            "10.20.6.53"
          ],
          [
            "02:00:02",
            "wh-fileshare.northglass.example",
            "A",
            "10.20.6.60",
            "10.20.6.53"
          ],
          [
            "04:12:41",
            "os-updates.northglass.example",
            "A",
            "10.20.6.41",
            "10.20.6.53"
          ]
        ]
      }
    ],
    "hotspots": {
      "dns-entropy": {
        "label": "High-entropy query names",
        "source": "dns",
        "suspicious": true,
        "points": 3,
        "surface": "mfqx7k2j9b3d6a8h4t2w.sync.cdn-telemetry-sync.example (and dozens more like it)",
        "underneath": "Every label is 20 random base32 characters — no English, no product code, never repeated. About 2,880 unique one-time names overnight, all under the same parent. Compare PRINT-09: its longest label is “pkg-mirror”.",
        "explain": "Random, never-repeated, high-entropy subdomains are how data rides out over DNS: the data is the name. Humans and apps query a small set of real names over and over, not thousands of unique gibberish ones.",
        "ioc": "*.sync.cdn-telemetry-sync[.]example — high-entropy DNS exfil labels"
      },
      "dns-txt": {
        "label": "Unusual TXT-record queries",
        "source": "dns",
        "suspicious": true,
        "points": 3,
        "surface": "TXT queries ctl.p0362… / ctl.p0363… / ctl.p0364… .sync.cdn-telemetry-sync.example",
        "underneath": "A label printer has no reason to ask for TXT records, let alone a numbered series (p0362, p0363, p0364… — one per minute) returning empty answers. TXT is a common two-way tunnel carrier because it holds far more than an A record.",
        "explain": "A rising counter in the names plus TXT type is a classic tunnel: the counter sequences the chunks, TXT carries the acknowledgements or commands back. Normal hosts here only ask for A records.",
        "ioc": "TXT tunnel polls ctl.pNNNN.sync.cdn-telemetry-sync[.]example"
      },
      "dns-lookalike": {
        "label": "Look-alike parent domain",
        "source": "dns",
        "suspicious": true,
        "points": 3,
        "surface": "sync.cdn-telemetry-sync.example — 3,060 lookups overnight, first seen 22 Sep",
        "underneath": "The name is built to be ignored — “cdn,” “telemetry,” “sync” are the three words analysts skim past. It resolves to 198.51.100.53, an external nameserver Northglass has no relationship with, and it only started appearing 22 Sep — the day after the Mission Two implant ran.",
        "explain": "All the odd queries funnel to one freshly-seen parent domain dressed up as boring infrastructure. One new authoritative destination collecting thousands of unique names is the exfil endpoint.",
        "ioc": "cdn-telemetry-sync[.]example (NS 198.51.100[.]53) — exfil domain"
      },
      "dns-cdn": {
        "label": "CDN asset lookups",
        "source": "dns",
        "suspicious": false,
        "points": 1,
        "surface": "assets.fastparcel-cdn.example / img.fastparcel-cdn.example — A records",
        "underneath": "Northglass’ shipping-label stock images come from the FastParcel CDN. A handful of repeated, readable hostnames resolving to the same address — PRINT-09 queries them too.",
        "explain": "Not an indicator. Real CDN names are short, readable, and reused. Query count alone isn’t exfil — entropy and destination are. These names mean something; the gibberish ones don’t.",
        "ioc": ""
      },
      "cron-exfil": {
        "label": "Scheduled exfil task",
        "source": "cron",
        "suspicious": true,
        "points": 3,
        "surface": "* 1-3 * * *  /home/svc-print/.cache/.spool/.sync/labelcache --flush",
        "underneath": "A per-minute job, but only from 01:00 to 03:59, running a binary from a hidden folder that isn’t in the software inventory. That is exactly the window the DNS trickle appears — and exactly when no one is on the floor.",
        "explain": "Persistence plus a schedule tuned to the quiet hours is how low-and-slow stays unseen. The legitimate timers here run once; this one wakes every minute, all night.",
        "ioc": "labelcache.timer / crontab every minute 01:00–03:59 — scheduled exfil"
      },
      "cron-script": {
        "label": "Hidden exfil binary",
        "source": "cron",
        "suspicious": true,
        "points": 3,
        "surface": "/home/svc-print/.cache/.spool/.sync/labelcache (ELF, created 21 Sep 20:11Z)",
        "underneath": "Owned by svc-print, created the same evening as the Mission Two implant, hash SIMULATION:9ad3f1…e70c (not in any Northglass inventory). It reads ../stage/*.b32 and emits them as DNS labels under the look-alike domain — a purpose-built tunneller.",
        "explain": "The binary is the engine: it chunks staged data, base32-encodes it into hostnames, and lets the resolver carry it out. Name, path, and birth-time all tie it to the earlier compromise.",
        "ioc": "/home/svc-print/.cache/.spool/.sync/labelcache (hash SIMULATION:9ad3f1…e70c)"
      },
      "cron-backup": {
        "label": "Nightly label backup",
        "source": "cron",
        "suspicious": false,
        "points": 1,
        "surface": "backup-labels.service — rsync /var/spool/labels/ -> 10.20.6.60 (02:00 daily, since 2024)",
        "underneath": "A long-standing internal backup of the print spool to the warehouse fileshare (10.20.6.60). Runs once at 02:00, stays on the internal network, and PRINT-09 has the same job.",
        "explain": "Not an indicator. Internal destination, documented since 2024, once-nightly, and present on the sister host. A backup that never leaves the building isn’t your leak.",
        "ioc": ""
      },
      "stage-dir": {
        "label": "Chunked staging files",
        "source": "stage",
        "suspicious": true,
        "points": 3,
        "surface": "out/q008639.b32, out/q008640.b32, … (180 B each) + out/.cursor",
        "underneath": "Thousands of tiny, fixed-size base32 files numbered in sequence, plus a .cursor file tracking how far the tunneller has got. 180 bytes is about what fits in one DNS query name. New files appear only during the 01:00–04:00 window.",
        "explain": "Fixed-size, sequentially-numbered, base32 chunks with a progress cursor is a staging queue for a covert channel — the data cut into DNS-sized bites, sent a few per minute.",
        "ioc": "~/.cache/.spool/.sync/out/q*.b32 + .cursor — exfil chunk queue"
      },
      "stage-archive": {
        "label": "Staged billing exports",
        "source": "stage",
        "suspicious": true,
        "points": 3,
        "surface": "stage/invoices_export_2026Q3.tar.gz (46 MB) + stage/ap_vendor_master.csv (9.4 MB)",
        "underneath": "A label printer has no reason to hold a quarterly invoice archive or the AP vendor master. These were copied from the billing-exports fileshare at 22 Sep 00:58Z — the raw material the chunk files are made from. (Contents are empty placeholders in this simulation.)",
        "explain": "This is what’s being stolen: customer-and-vendor billing data staged on an overlooked host, then dribbled out over DNS. Finding the staged source tells you the scope of the exposure.",
        "ioc": "Staged billing data: invoices_export_2026Q3.tar.gz, ap_vendor_master.csv"
      },
      "stage-spool": {
        "label": "Live label spool",
        "source": "stage",
        "suspicious": false,
        "points": 1,
        "surface": "/var/spool/labels (12 MB, current shipping labels)",
        "underneath": "The working directory the printer actually uses — world-readable, updated all day, and the thing the legitimate 02:00 backup copies. PRINT-09 has the identical spool.",
        "explain": "Not an indicator. This is the host doing its real job. Big and busy isn’t suspicious — the hidden sibling directory full of base32 chunks is.",
        "ioc": ""
      },
      "dns-external": {
        "label": "DNS bypassing the resolver",
        "source": "egress",
        "suspicious": true,
        "points": 3,
        "surface": "UDP/53 -> 198.51.100.53 (external), bypassing internal resolver 10.20.6.53",
        "underneath": "Warehouse hosts are supposed to use the internal resolver only. This host also talks DNS straight to an external nameserver — the authoritative server for the look-alike domain — so even a resolver block wouldn’t fully stop it. PRINT-09 never leaves 10.20.6.53.",
        "explain": "Direct DNS to an arbitrary external server is both a policy violation and a fallback exfil path. It confirms 198.51.100.53 as the collection point and tells you the perimeter, not just the resolver, has to change.",
        "ioc": "198.51.100[.]53 — external nameserver / DNS exfil collector"
      },
      "egress-cadence": {
        "label": "Low-and-slow cadence",
        "source": "egress",
        "suspicious": true,
        "points": 3,
        "surface": "A burst of ~17 tiny UDP/53 queries every ~60 s, 01:00–04:00 only, then silent",
        "underneath": "Identical ~180 B packets in identical one-per-minute bursts, confined to the small hours, completely independent of shipping volume. Same burst size every minute, over and over. The restraint is the tell — it’s pacing itself to stay under the radar.",
        "explain": "Steady interval + fixed small size + timed to the quiet hours is the signature of deliberate low-and-slow exfiltration. A noisy transfer would have been caught days ago; this one is slow on purpose.",
        "ioc": "~17 queries/min (≈3,060/night), ~180 B each, 01:00–04:00 — low-and-slow DNS exfil"
      }
    }
  },
  "decide": {
    "maxScore": 20,
    "sam": "Call it, justify it, then scope it twice — which host, and how much data. The asset record, the fleet DNS hunt, and the exfil estimate are below. Logs are UTC.",
    "classification": {
      "prompt": "How do you classify this incident?",
      "options": [
        {
          "id": "dnsexfil",
          "label": "Covert data exfiltration over a DNS tunnel (low-and-slow)",
          "detail": "A planted tunneller is staging billing data and leaking it as encoded DNS queries to a look-alike domain.",
          "points": 5,
          "best": true,
          "feedback": "Correct. Staged billing exports, cut into fixed base32 chunks, sent one-per-minute as high-entropy names to a freshly-seen external nameserver during the quiet hours. That’s a deliberate covert exfil channel, not noise."
        },
        {
          "id": "misconfig",
          "label": "Misconfigured host / DNS cache problem",
          "detail": "The printer’s resolver settings are broken; it’s retrying.",
          "points": 1,
          "feedback": "A misconfig doesn’t base32-encode a staged invoice archive into thousands of unique names on a per-minute timer from a hidden binary. The pattern is purposeful, not broken."
        },
        {
          "id": "usb",
          "label": "Insider copying files to removable media",
          "detail": "Someone is walking data out on a USB stick.",
          "points": 1,
          "feedback": "Nothing points to removable media or a person on the floor — the data leaves over the network, over DNS, on a schedule, from a service account’s hidden tooling. This is remote and automated."
        },
        {
          "id": "fp",
          "label": "False positive — normal CDN / telemetry traffic",
          "detail": "“cdn-telemetry-sync” is just a content network.",
          "points": 0,
          "feedback": "Unsafe. The readable CDN (fastparcel-cdn.example) is the decoy. cdn-telemetry-sync.example is a never-before-seen domain collecting high-entropy names — the name is camouflage, not a vendor."
        }
      ]
    },
    "justification": {
      "prompt": "Which of these are real indicators of exfiltration? Select all that apply, then submit.",
      "pointsEach": 1,
      "maxScore": 6,
      "options": [
        {
          "id": "j-entropy",
          "label": "Thousands of unique, high-entropy base32 subdomains under one parent domain",
          "correct": true
        },
        {
          "id": "j-txt",
          "label": "A numbered series of TXT-record queries from a host that should only ask for A records",
          "correct": true
        },
        {
          "id": "j-domain",
          "label": "A freshly-seen look-alike domain (cdn-telemetry-sync.example) as the single destination",
          "correct": true
        },
        {
          "id": "j-cadence",
          "label": "An identical burst of tiny queries every ~60 s, 01:00–04:00 only, independent of shipping activity",
          "correct": true
        },
        {
          "id": "j-stage",
          "label": "A hidden directory of sequential 180 B base32 chunks plus a staged copy of billing exports",
          "correct": true
        },
        {
          "id": "j-cron",
          "label": "A per-minute scheduled task running a hidden, inventory-unknown binary",
          "correct": true
        },
        {
          "id": "j-volume",
          "label": "The host simply makes a lot of DNS queries overnight",
          "correct": false,
          "why": "Volume alone isn’t exfil — the readable CDN lookups are high-count and benign. Entropy and destination are what matter."
        },
        {
          "id": "j-busy",
          "label": "The label printer is a busy host with a big spool",
          "correct": false,
          "why": "A busy spool is the host doing its job; PRINT-09 is just as busy and clean."
        },
        {
          "id": "j-backup",
          "label": "There’s a nightly backup job on the host",
          "correct": false,
          "why": "The 02:00 rsync is an internal, long-standing backup that never leaves the network."
        }
      ]
    },
    "logs": [
      {
        "kind": "meta",
        "title": "Asset & access record · NG-WH-PRINT-07 (SIM)",
        "rows": [
          [
            "Device",
            "Linux label-printer controller (10.20.9.18), warehouse VLAN — 'appliance', not in the EDR rollout"
          ],
          [
            "Owner",
            "Infrastructure / warehouse operations (SIM)"
          ],
          [
            "Service account",
            "svc-print — mounts the billing-exports fileshare (\\\\10.20.6.60\\billing-exports) read-only to render invoices"
          ],
          [
            "Standing access",
            "Read on billing-exports; local shell as svc-print; DNS allowed to 10.20.6.53"
          ],
          [
            "First foothold",
            "SSH login as svc-print from 10.20.8.12 (NG-BLD-02) at 21 Sep 20:09Z — password reused across label hosts; hidden tooling created 20:11Z, half an hour after the Mission Two implant installed persistence"
          ],
          [
            "EDR",
            "Enrolled 24 Sep 09:10Z (during this investigation) — no history before then"
          ]
        ]
      },
      {
        "kind": "table",
        "title": "Fleet DNS hunt · cdn-telemetry-sync.example + NS 198.51.100.53 (SIM)",
        "columns": [
          "Host",
          "Role",
          "Queries to the domain",
          "Direct DNS to 198.51.100.53",
          "Staging dir",
          "Notes"
        ],
        "rows": [
          [
            "NG-WH-PRINT-07",
            "Label printer (warehouse)",
            "Yes — nightly since 22 Sep",
            "Yes",
            "Yes",
            "Alerting host"
          ],
          [
            "NG-WH-PRINT-09",
            "Label printer (warehouse)",
            "No",
            "No",
            "No",
            "Sister host — clean"
          ],
          [
            "NG-BLD-02",
            "Build server",
            "No (contained)",
            "No",
            "No",
            "Mission Two host — isolated 23 Sep"
          ],
          [
            "NG-WRKSTN-042",
            "Warehouse PC",
            "No",
            "No",
            "No",
            "Reimaged 17 Sep (Mission Zero)"
          ],
          [
            "Fleet (resolver-wide)",
            "All other hosts",
            "None",
            "None",
            "None",
            "Only PRINT-07 ever touched the domain"
          ]
        ]
      },
      {
        "kind": "table",
        "title": "Exfil estimate · staged vs. sent (SIM)",
        "columns": [
          "Measure",
          "Value",
          "Basis"
        ],
        "rows": [
          [
            "Staged on host",
            "55 MB (invoices_export_2026Q3.tar.gz 46 MB + ap_vendor_master.csv 9.4 MB)",
            "Hidden stage/ directory"
          ],
          [
            "Payload per query",
            "~110 B usable (180 B name, base32 overhead)",
            "Chunk file size"
          ],
          [
            "Query rate",
            "~16 data queries/min, 01:00–04:00 ≈ 2,880/night",
            "Egress + resolver cadence"
          ],
          [
            "Nights active",
            "3 (22, 23, 24 Sep)",
            "First-seen to containment"
          ],
          [
            "Estimated data out",
            "≈ 0.95 MB (under 2% of staged)",
            "110 B × 2,880 × 3 — bounded by the slow channel"
          ],
          [
            "Cursor position",
            ".cursor at chunk 8,640 of ~500,000",
            "out/.cursor — most of the archive not yet sent"
          ]
        ]
      }
    ],
    "hint": "Tip: a DNS tunnel’s size is estimable — usable bytes per query × queries per night × nights. The .cursor file and the chunk numbering tell you how far it got. “Partial” is still a breach: assume everything that left is compromised, and everything staged is at risk.",
    "scopes": [
      {
        "id": "host",
        "label": "Host",
        "prompt": "Which host and data are in scope?",
        "options": [
          {
            "id": "sc-print07",
            "label": "NG-WH-PRINT-07 is the compromised host; it reached the billing-exports fileshare read-only and staged data there. PRINT-09 and the rest of the fleet are clean.",
            "points": 5,
            "best": true,
            "feedback": "Exactly. One overlooked appliance with read access to billing exports, staging and leaking from there. The fleet DNS hunt is clean everywhere else."
          },
          {
            "id": "sc-fileshare",
            "label": "The billing-exports fileshare (10.20.6.60) itself is compromised and feeding the attacker.",
            "points": 1,
            "feedback": "The fileshare was read from, not compromised — PRINT-07’s legitimate read access was abused. Lock down that access, but the implant lives on PRINT-07."
          },
          {
            "id": "sc-allwh",
            "label": "Every host on the warehouse VLAN is compromised.",
            "points": 1,
            "feedback": "Over-scoped. The hunt shows only PRINT-07 ever queried the domain or held a staging dir; PRINT-09 (identical image) is clean."
          },
          {
            "id": "sc-none",
            "label": "Nothing is compromised — it’s just a chatty appliance.",
            "points": 0,
            "feedback": "A hidden binary chunking a staged invoice archive out over DNS on a timer is not a chatty appliance."
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
            "label": "A partial exfil: ~0.95 MB (under 2% of the 55 MB staged) has left over three nights; the rest is staged but not yet sent. Treat what left as breached and the staged billing/vendor data as at risk.",
            "points": 4,
            "best": true,
            "feedback": "Right. The cursor and the slow channel bound it: a few MB out, most still queued. Partial is still a reportable breach — and the clock was running."
          },
          {
            "id": "da-none",
            "label": "Nothing got out — these are only DNS lookups with empty answers.",
            "points": 0,
            "feedback": "The data is in the query names, not the answers. ~2,900 data queries a night for three nights carried real bytes out; empty TXT replies don’t mean nothing left."
          },
          {
            "id": "da-all",
            "label": "The entire 55 MB archive is already gone.",
            "points": 1,
            "feedback": "The channel is far too slow for that — ~110 B per query, ~2,900/night. The .cursor shows it reached chunk 8,640 of ~500,000. Over-stating the loss sends the wrong number to the CTO."
          },
          {
            "id": "da-everything",
            "label": "Assume all of Northglass’ data has been exfiltrated.",
            "points": 1,
            "feedback": "Over-scoped. The evidence names specific staged files and a bounded channel. Report what the logs support, then widen the hunt — don’t start with the worst case."
          }
        ]
      }
    ]
  },
  "contain": {
    "maxScore": 25,
    "sam": "Pick every action you’d take right now — and only those. Too little leaves the tunnel open and the clock running; too much blacks out the warehouse or has you poking the attacker’s nameserver. When you’re set, execute.",
    "prompt": "Select your containment plan",
    "actions": [
      {
        "id": "blockdns",
        "kind": "required",
        "points": 5,
        "label": "Sinkhole cdn-telemetry-sync.example and block 198.51.100.53; force the warehouse VLAN to the internal resolver only",
        "detail": "DNS sinkhole for the domain, egress block for the external nameserver, and block direct UDP/53 out of 10.20.9.0/24.",
        "result": "Sinkhole + egress block live at 09:22Z. The 09:23Z query resolved to the sinkhole; the direct-to-198.51.100.53 path is now dropped at the perimeter. The channel is cut both ways.",
        "missed": "The tunnel stays open — every minute tonight another chunk leaves, resolver block or not, because the host also talks DNS direct to the external server.",
        "feedback": "Cuts the covert channel at the domain, the destination, and the fallback path — the single most urgent move."
      },
      {
        "id": "isolate",
        "kind": "required",
        "points": 4,
        "label": "Network-isolate NG-WH-PRINT-07 (keep it powered on) and capture a triage image",
        "detail": "Allow only the forensics channel; snapshot memory, the staging dir, and the binary before changing anything.",
        "result": "Host contained at 09:25Z; memory + disk triage image and the stage/ directory captured to the evidence locker. Nothing new left after isolation.",
        "missed": "The host keeps staging and leaking, and you lose the memory and the .cursor state you need to prove how much got out.",
        "feedback": "Stops the bleeding while preserving the evidence that scopes the breach."
      },
      {
        "id": "killpersist",
        "kind": "required",
        "points": 4,
        "label": "Remove the tunneller and its persistence",
        "detail": "Disable and delete labelcache.timer / the crontab line, stop the service, and quarantine the hidden ~/.cache/.spool/.sync/ tree (after the image).",
        "result": "labelcache.timer and the crontab entry removed; service stopped; hidden dir and labelcache binary quarantined (SIMULATION:9ad3f1…e70c). Reboot check: nothing re-staged.",
        "missed": "Clear the cache and the per-minute timer just refills it tomorrow night — the implant has to go, not just its output.",
        "feedback": "The binary and the schedule together — deleting the chunks without the timer doesn’t stick."
      },
      {
        "id": "revoke",
        "kind": "required",
        "points": 4,
        "label": "Rotate svc-print’s credentials and revoke its billing-exports access",
        "detail": "Rotate the reused svc-print password on every label host and remove (or tighten) PRINT-07’s read access to the fileshare.",
        "result": "svc-print credential rotated at 09:30Z; billing-exports mount removed from PRINT-07 (labels don’t need the raw exports). Fileshare audit shows no other host abusing the share.",
        "missed": "The attacker’s foothold keeps its read access to billing exports — a re-dropped implant would just stage again.",
        "feedback": "Takes away the standing access that turned a label printer into a data pump."
      },
      {
        "id": "dataowner",
        "kind": "required",
        "points": 4,
        "label": "Identify what was staged/sent and notify the billing & data-protection owners",
        "detail": "From the staged files and the cursor, enumerate the exposed invoice/vendor data, preserve it, and brief the data-protection lead for breach assessment.",
        "result": "Exposed set scoped: 2026Q3 invoice export + AP vendor master, ~0.95 MB confirmed out, remainder staged. Data-protection lead engaged for notification assessment; affected-record list preserved.",
        "missed": "No one owns the breach side — the data that left customers and vendors goes unassessed and unreported.",
        "feedback": "Exfil is a data-breach case, not just a malware case. Scoping and notifying the data owner is part of containment."
      },
      {
        "id": "hunt",
        "kind": "required",
        "points": 4,
        "label": "Hunt the fleet for the same domain, cadence, staging dir, and foothold date",
        "detail": "Resolver-wide search for cdn-telemetry-sync.example and 198.51.100.53, the .cache/.spool/.sync pattern, and anything created around 21 Sep 20:11Z.",
        "result": "Fleet DNS hunt + file sweep: only PRINT-07 matched. No other host queried the domain, held the staging dir, or gained tooling that evening. EDR now enrolled on the overlooked appliances.",
        "missed": "If the implant seeded a second quiet host, it keeps whispering after you’ve cleaned this one.",
        "feedback": "Low-and-slow likes overlooked devices — confirm this is the only one before you call it contained."
      },
      {
        "id": "report",
        "kind": "neutral",
        "points": 0,
        "label": "Report cdn-telemetry-sync.example to the DNS registry / provider for takedown",
        "detail": "Share the fake-hash IOCs, the domain, and the nameserver for suspension.",
        "result": "Provider opened a case and flagged the domain for review. Useful intel — but takedown is external and slow; your sinkhole is what actually stops tonight’s leak.",
        "missed": "",
        "feedback": "Good citizenship and good intel, but it doesn’t contain anything at Northglass by itself, so it scores zero either way. Put it in lessons learned."
      },
      {
        "id": "blockalldns",
        "kind": "overkill",
        "points": -3,
        "label": "Block all outbound DNS company-wide",
        "detail": "",
        "result": "Half of Northglass can’t resolve anything; the help desk lights up and business stops. The leak was one host and one domain.",
        "feedback": "Overreaction. Sinkhole the domain, block the external nameserver, and pin the warehouse VLAN to the internal resolver — don’t break name resolution for everyone."
      },
      {
        "id": "shutwarehouse",
        "kind": "overkill",
        "points": -3,
        "label": "Shut down all label printing and warehouse systems until further notice",
        "detail": "",
        "result": "Shipping halts; trucks wait at the dock. The scope was one appliance leaking a few MB a night.",
        "feedback": "Disproportionate. Isolate PRINT-07 and cut the channel; the warehouse can keep shipping."
      },
      {
        "id": "reimageall",
        "kind": "overkill",
        "points": -2,
        "label": "Reimage every host on the warehouse VLAN",
        "detail": "",
        "result": "Days of rebuilds across clean machines. The hunt already showed only PRINT-07 is affected.",
        "feedback": "Over-scoped. PRINT-09 and the rest are clean — rebuild the one host you have evidence on, after you’ve imaged it."
      },
      {
        "id": "reimagenow",
        "kind": "harmful",
        "points": -2,
        "label": "Reimage NG-WH-PRINT-07 right now — skip the triage image",
        "detail": "",
        "result": "The implant is gone — and so are the staging files, the .cursor, and the memory you needed to prove what left.",
        "feedback": "Isolate first, image second, rebuild last. Wiping before capture destroys the evidence that scopes the breach for the notification."
      },
      {
        "id": "resolve",
        "kind": "harmful",
        "points": -2,
        "label": "Resolve cdn-telemetry-sync.example from the SOC to see what the nameserver returns",
        "detail": "",
        "result": "You just sent a live query to the attacker’s collector from a Northglass address, confirming someone’s watching.",
        "feedback": "Out of ROE. Don’t interact with attacker infrastructure — analyse the captured logs, sinkhole the domain, and report it."
      },
      {
        "id": "flood",
        "kind": "harmful",
        "points": -5,
        "label": "Flood 198.51.100.53 with junk queries to “poison” the attacker’s data",
        "detail": "",
        "result": "You attacked external infrastructure from Northglass. Sam pulls you off the ticket.",
        "feedback": "Hard stop. Flooding or “poisoning” is an offensive act and an ROE violation — and it tips the attacker off. Sinkhole and preserve, don’t retaliate."
      },
      {
        "id": "cacheflush",
        "kind": "underreaction",
        "points": -3,
        "label": "Just flush the resolver cache and clear the staging files, then close the ticket",
        "detail": "",
        "result": "The per-minute timer re-stages tonight, the host still talks straight to 198.51.100.53, and the channel is open again by 01:00.",
        "feedback": "Underreaction. Clearing output without removing the binary, the schedule, the access, and the channel leaves the whisper running."
      }
    ]
  },
  "document": {
    "maxScore": 25,
    "sam": "Write it for Northglass’ CTO and data-protection lead: what the channel was, what to hunt for, what we did, how much data is in scope, and what changes so a forgotten appliance can’t whisper data out again. Defang indicators (cdn-telemetry-sync[.]example, 198.51.100[.]53). Your evidence board is on the right.",
    "fields": [
      {
        "id": "summary",
        "label": "Summary",
        "rows": 4,
        "placeholder": "What was the channel, which host, how much data?",
        "max": 6,
        "keys": [
          {
            "id": "k-exfil",
            "label": "Identifies DNS-tunnel / covert data exfiltration",
            "points": 2,
            "match": [
              [
                "dns[- ]?tunnel",
                "dns[- ]?exfil",
                "exfiltrat",
                "covert channel",
                "data (theft|exfil)",
                "tunnel(l)?ing"
              ]
            ]
          },
          {
            "id": "k-host",
            "label": "Names NG-WH-PRINT-07 (the overlooked appliance)",
            "points": 2,
            "match": [
              [
                "ng-wh-print-07",
                "print-07",
                "label[- ]?printer",
                "appliance"
              ]
            ]
          },
          {
            "id": "k-data",
            "label": "States the exposed billing/invoice data (partial exfil)",
            "points": 2,
            "match": [
              [
                "billing",
                "invoice",
                "vendor master",
                "exports?"
              ]
            ]
          }
        ]
      },
      {
        "id": "iocs",
        "label": "Indicators of compromise (IOCs)",
        "rows": 5,
        "placeholder": "Domain, nameserver IP, paths, binary, host — one per line, defanged.",
        "max": 9,
        "keys": [
          {
            "id": "k-domain",
            "label": "Exfil domain cdn-telemetry-sync.example",
            "points": 2,
            "match": [
              [
                "cdn-telemetry-sync\\.example"
              ]
            ]
          },
          {
            "id": "k-ns",
            "label": "External nameserver 198.51.100.53",
            "points": 2,
            "match": [
              [
                "198\\.51\\.100\\.53"
              ]
            ]
          },
          {
            "id": "k-path",
            "label": "Hidden staging path ~/.cache/.spool/.sync/",
            "points": 2,
            "match": [
              [
                "\\.spool/\\.sync",
                "\\.sync/",
                "\\.cache/\\.spool"
              ]
            ]
          },
          {
            "id": "k-bin",
            "label": "Tunneller binary labelcache",
            "points": 1,
            "match": [
              [
                "labelcache"
              ]
            ]
          },
          {
            "id": "k-task",
            "label": "Scheduled task labelcache.timer / per-minute cron",
            "points": 1,
            "match": [
              [
                "labelcache\\.timer",
                "labelcache.service",
                "1-3 \\* \\* \\*",
                "per[- ]?minute"
              ]
            ]
          },
          {
            "id": "k-host",
            "label": "Host NG-WH-PRINT-07",
            "points": 1,
            "match": [
              [
                "ng-wh-print-07",
                "print-07"
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
            "label": "Channel cut (sinkhole domain / block nameserver / resolver pinning)",
            "points": 1,
            "match": [
              [
                "sinkhol",
                "block",
                "drop"
              ],
              [
                "cdn-telemetry-sync",
                "198\\.51\\.100\\.53",
                "dns",
                "resolver",
                "egress",
                "domain",
                "nameserver",
                "\\bip\\b"
              ]
            ]
          },
          {
            "id": "k-isolate",
            "label": "NG-WH-PRINT-07 isolated",
            "points": 1,
            "match": [
              [
                "isolat",
                "contain",
                "quarantin"
              ],
              [
                "print-07",
                "host",
                "ng-wh-print-07"
              ]
            ]
          },
          {
            "id": "k-kill",
            "label": "Tunneller + persistence removed",
            "points": 1,
            "match": [
              [
                "remov",
                "kill",
                "delet",
                "disabl",
                "quarantin"
              ],
              [
                "labelcache",
                "timer",
                "cron",
                "persist",
                "binary",
                "implant"
              ]
            ]
          },
          {
            "id": "k-revoke",
            "label": "svc-print credentials rotated / fileshare access revoked",
            "points": 1,
            "match": [
              [
                "rotat",
                "revok",
                "remov"
              ],
              [
                "svc-print",
                "credential",
                "fileshare",
                "access",
                "mount",
                "billing-exports"
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
                "billing",
                "breach",
                "privacy"
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
        "placeholder": "What should Northglass change so a forgotten host can’t whisper data out?",
        "max": 5,
        "keys": [
          {
            "id": "k-dnsmon",
            "label": "DNS monitoring / analytics (entropy, volume, NXDOMAIN, new domains)",
            "points": 1,
            "match": [
              [
                "dns (monitor|analytic|logging|visibility|detection|inspection)",
                "entropy",
                "nxdomain",
                "new(ly)?[- ]seen domain",
                "domain reputation",
                "dns security"
              ]
            ]
          },
          {
            "id": "k-egress",
            "label": "Egress control: force internal resolver, block direct port 53",
            "points": 1,
            "match": [
              [
                "egress",
                "allow[- ]?list",
                "force.*resolver",
                "internal resolver",
                "block.*(53|dns)",
                "outbound"
              ]
            ]
          },
          {
            "id": "k-lp",
            "label": "Least privilege for appliances & fileshare access",
            "points": 1,
            "match": [
              [
                "least[- ]privilege",
                "scoped",
                "read[- ]only",
                "minimal (access|privilege|permission)",
                "tighten.*access",
                "segment"
              ]
            ]
          },
          {
            "id": "k-inventory",
            "label": "Asset inventory + EDR coverage for overlooked devices",
            "points": 1,
            "match": [
              [
                "inventory",
                "asset",
                "edr (coverage|rollout|everywhere)",
                "unmanaged",
                "appliance",
                "iot",
                "coverage"
              ]
            ]
          },
          {
            "id": "k-dlp",
            "label": "Data controls on exports (DLP, don’t stage raw exports on edge hosts)",
            "points": 1,
            "match": [
              [
                "dlp",
                "data loss",
                "data[- ]at[- ]rest",
                "encrypt",
                "classif",
                "don’t stage",
                "staging"
              ]
            ]
          },
          {
            "id": "k-hunt",
            "label": "Post-incident threat hunt for persistence after any compromise",
            "points": 1,
            "match": [
              [
                "threat hunt",
                "hunt for persistence",
                "post[- ]incident",
                "assume.*pivot",
                "lateral"
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
        "note": "You heard the whisper, cut the channel at the host and the perimeter, scoped the data that left, and didn’t black out the warehouse doing it. The CTO and the data-protection lead can act on this today."
      },
      {
        "min": 70,
        "label": "Solid containment",
        "note": "The tunnel is cut and the implant is out. Review the gaps below — they’re what separate good from lead-ready, especially the breach-scoping side."
      },
      {
        "min": 50,
        "label": "Partial — gaps remain",
        "note": "You spotted the covert channel, but something is still open or the data scope is thin. Replay with the exfil estimate and the containment list side by side."
      },
      {
        "min": 0,
        "label": "Needs a second pass",
        "note": "Re-run Mission Three. Compare PRINT-07 against the PRINT-09 profile, look for shape not volume, and cut the channel at the domain, the destination, and the resolver."
      }
    ],
    "hook": {
      "title": "Shift channel · 09:40Z",
      "body": "Sam: Nice catch on NG-WH-PRINT-07. Everyone watches the servers; nobody watches the label printer.\n\nSam: And notice what our 203.0.113.77 block did to this: nothing. The exfil never touched that address — separate infrastructure, a look-alike domain, from day one. Declaring victory on the first block is exactly what they count on.\n\nSam: Remember what this actually was: patient, low-and-slow theft of staged invoice and vendor data, a few hundred kilobytes a night over DNS. No smash-and-grab. Someone wanted our billing data intact and unnoticed.\n\nSam: cdn-telemetry-sync.example and 198.51.100.53 are sinkholed and blocked. Lockers updated. But a domain that clean, registered before the Mission Two implant even ran, doesn’t get picked by accident.\n\nSam: Four incidents, one operator. The warehouse PC, the phish, the poisoned model, now this. Time we found out who’s holding the lantern.\n\n>> MISSION FOUR · LANTERN COURT — clearance pending"
    },
    "loreUnlock": {
      "id": "crumb-m3",
      "title": "Evidence locker · EXW whois",
      "body": "cdn-telemetry-sync.example\n\n  whois: registered 2026-09-10 — eleven days BEFORE the Lumen-7 implant ran.\n  registrant org: “LNTRN Holdings”\n  nameserver: 198.51.100.53 — authoritative for exactly two zones.\n\nThe other zone on that nameserver: lantern-court.example.\n\nSame four letters as the model uploader (M2) and “X-Mailer: LNTRN Bulk 7” (M1).\nThey were staging the exit before we ever saw the entrance.\n\n(SIMULATED training lore)"
    },
    "lockedHint": "Score 70+ to open the evidence-locker crumb. Replay and cut the whisper: sinkhole the domain and block the external nameserver, isolate and image PRINT-07, remove the binary and its timer, rotate svc-print and revoke its fileshare access, scope the data that left, and hunt the fleet — without blacking out the warehouse."
  }
};
