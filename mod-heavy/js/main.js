/**
 * MOD-HEAVY Mission Zero — client-side mission state & scoring.
 * Defensive / blue-team training only. No offensive tooling.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "modheavy-m0";
  const FALLBACK_MISSION = null; // populated if fetch fails — see embed below

  /** @type {object|null} */
  let mission = null;
  const state = {
    severityId: null,
    actionId: null,
    severityPoints: 0,
    actionPoints: 0,
    notes: "",
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function showView(name) {
    $$(".view").forEach((el) => {
      el.classList.toggle("active", el.dataset.view === name);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      history.replaceState(null, "", "#" + name);
    } catch (_) {
      /* ignore */
    }
  }

  function tickClock() {
    const el = $("#ops-clock");
    if (!el) return;
    const now = new Date();
    el.textContent =
      now.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }) + " local";
  }

  function loadStored() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.notes) {
        state.notes = data.notes;
        const ta = $("#analyst-notes");
        if (ta) ta.value = data.notes;
      }
    } catch (_) {
      /* ignore corrupt storage */
    }
  }

  function saveNotes() {
    const ta = $("#analyst-notes");
    state.notes = ta ? ta.value.trim() : "";
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          notes: state.notes,
          severityId: state.severityId,
          actionId: state.actionId,
          score: totalScore(),
          updated: new Date().toISOString(),
        })
      );
      toast("Notes saved on this device.");
    } catch (_) {
      toast("Could not save (storage blocked).");
    }
  }

  function toast(msg) {
    const el = $("#toast");
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      el.hidden = true;
    }, 2800);
  }

  function totalScore() {
    return state.severityPoints + state.actionPoints;
  }

  function feedbackClass(points, maxForChoice) {
    if (points >= maxForChoice) return "good";
    if (points > 0) return "ok";
    return "bad";
  }

  function renderBriefing() {
    const b = mission.briefing;
    $("#brief-title").textContent = mission.title;
    $("#brief-code").textContent =
      mission.id + " · " + mission.codename + " · " + mission.company;
    const body = $("#brief-body");
    body.innerHTML = "";
    const p = document.createElement("p");
    p.textContent = b.context;
    body.appendChild(p);
    const h = document.createElement("h3");
    h.className = "subhead";
    h.textContent = "Rules of engagement";
    body.appendChild(h);
    const ul = document.createElement("ul");
    b.roe.forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      ul.appendChild(li);
    });
    body.appendChild(ul);
    const obj = document.createElement("p");
    obj.innerHTML = "<strong>Objective:</strong> ";
    obj.appendChild(document.createTextNode(b.objective));
    body.appendChild(obj);
    const disc = document.createElement("p");
    disc.className = "dim tiny";
    disc.textContent = mission.disclaimer;
    body.appendChild(disc);
  }

  function renderAlert() {
    const a = mission.alert;
    $("#alert-id").textContent = a.id;
    const meta = $("#alert-meta");
    meta.innerHTML = "";
    const rows = [
      ["Received", a.received + " (SIM)"],
      ["Source", a.source],
      ["Host", a.host],
      ["User", a.user],
    ];
    rows.forEach(([k, v]) => {
      const dt = document.createElement("dt");
      dt.textContent = k;
      const dd = document.createElement("dd");
      dd.textContent = v;
      meta.appendChild(dt);
      meta.appendChild(dd);
    });
    $("#alert-summary").textContent = a.summary;
    const inds = $("#alert-indicators");
    inds.innerHTML = "";
    a.indicators.forEach((ind) => {
      const li = document.createElement("li");
      const lab = document.createElement("span");
      lab.className = "ind-label";
      lab.textContent = ind.label;
      const val = document.createElement("span");
      val.textContent = ind.value;
      li.appendChild(lab);
      li.appendChild(val);
      inds.appendChild(li);
    });
    const noise = $("#alert-noise");
    noise.innerHTML = "";
    a.noise.forEach((n) => {
      const li = document.createElement("li");
      li.textContent = n;
      noise.appendChild(li);
    });
  }

  function maxPoints(options) {
    return Math.max(...options.map((o) => o.points));
  }

  function renderOptions(container, options, kind) {
    container.innerHTML = "";
    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt";
      btn.dataset.id = opt.id;
      btn.dataset.kind = kind;
      const label = document.createElement("span");
      label.textContent = opt.label;
      btn.appendChild(label);
      if (opt.detail) {
        const d = document.createElement("span");
        d.className = "opt-detail";
        d.textContent = opt.detail;
        btn.appendChild(d);
      }
      btn.addEventListener("click", () => onChoose(kind, opt, container));
      container.appendChild(btn);
    });
  }

  function onChoose(kind, opt, container) {
    const buttons = $$(".opt", container);
    buttons.forEach((b) => {
      b.disabled = true;
      b.classList.toggle("selected", b.dataset.id === opt.id);
      const match = (kind === "severity" ? mission.severity : mission.actions).options.find(
        (o) => o.id === b.dataset.id
      );
      if (match && match.best) b.classList.add("best");
      if (b.dataset.id === opt.id && opt.points === 0) b.classList.add("poor");
    });

    if (kind === "severity") {
      state.severityId = opt.id;
      state.severityPoints = opt.points;
      const fb = $("#sev-feedback");
      fb.hidden = false;
      fb.textContent = opt.feedback;
      fb.className =
        "feedback " + feedbackClass(opt.points, maxPoints(mission.severity.options));
      const step = $("#step-action");
      step.classList.add("unlocked");
      step.classList.remove("step-locked");
    } else {
      state.actionId = opt.id;
      state.actionPoints = opt.points;
      const fb = $("#act-feedback");
      fb.hidden = false;
      fb.textContent = opt.feedback;
      fb.className =
        "feedback " + feedbackClass(opt.points, maxPoints(mission.actions.options));
      $("#act-continue").hidden = false;
    }
  }

  function renderTriagePrompts() {
    $("#sev-prompt").textContent = mission.severity.prompt;
    $("#act-prompt").textContent = mission.actions.prompt;
    renderOptions($("#sev-options"), mission.severity.options, "severity");
    renderOptions($("#act-options"), mission.actions.options, "action");
    $("#sev-feedback").hidden = true;
    $("#act-feedback").hidden = true;
    $("#act-continue").hidden = true;
    $("#step-action").classList.add("step-locked");
    $("#step-action").classList.remove("unlocked");
  }

  function renderAfterAction() {
    const score = totalScore();
    const max = mission.afterAction.maxScore;
    $("#score-num").textContent = score + "/" + max;
    const bands = mission.afterAction.scoreBands.slice().sort((a, b) => b.min - a.min);
    const band = bands.find((b) => score >= b.min) || bands[bands.length - 1];
    $("#score-label").textContent = band.label;
    $("#score-note").textContent = band.note;

    const lore = mission.afterAction.loreUnlock;
    const unlock = score >= mission.afterAction.passScore;
    const panel = $("#lore-panel");
    if (unlock) {
      panel.hidden = false;
      $("#lore-title").textContent = lore.title;
      $("#lore-body").textContent = lore.body;
    } else {
      panel.hidden = false;
      $("#lore-title").textContent = "Lore locked";
      $("#lore-body").textContent =
        "Score " +
        mission.afterAction.passScore +
        "+ to unlock the ops-floor memo. Replay and prefer investigate / isolate / escalate over ignoring the alert.";
    }
  }

  function resetMission() {
    state.severityId = null;
    state.actionId = null;
    state.severityPoints = 0;
    state.actionPoints = 0;
    renderTriagePrompts();
    showView("briefing");
  }

  function bindNav() {
    document.body.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-nav]");
      if (!btn) return;
      const target = btn.getAttribute("data-nav");
      if (target === "triage") {
        if (!mission) return;
        renderAlert();
        if (!state.severityId) renderTriagePrompts();
      }
      if (target === "after") {
        if (!state.actionId) return;
        renderAfterAction();
      }
      showView(target);
    });

    $("#btn-save-notes")?.addEventListener("click", saveNotes);
    $("#btn-replay")?.addEventListener("click", resetMission);
  }

  /** Embedded copy so file:// open works without fetch CORS issues. */
  const EMBEDDED = {
    id: "M0",
    codename: "Static on the Line",
    title: "Mission Zero — Orientation & First Alert",
    company: "Northglass Logistics (SIMULATED)",
    disclaimer:
      "All hosts, IPs, hashes, and personnel are fabricated for defensive training. No real systems are involved.",
    shiftLead: "Sam",
    briefing: {
      context:
        "You are a CyberLabs analyst on shift for the MOD-HEAVY training floor. Northglass Logistics is a simulated client network used only for defensive drills.",
      roe: [
        "Defend only — investigate, contain, escalate, document.",
        "Never attempt to exploit, reverse-engineer for flags, or attack any system.",
        "Treat all evidence as simulated fiction.",
        "When unsure, isolate and escalate rather than dig deeper into risky curiosity.",
      ],
      objective:
        "Classify the inbound alert severity and choose a safe first action. Score is based on judgment, not speed-runs.",
    },
    alert: {
      id: "NGL-SOC-8841",
      received: "2026-09-16T21:04:12Z",
      source: "EDR — endpoint sensor (SIM)",
      host: "NG-WRKSTN-042 (warehouse floor PC)",
      user: "j.mendez (warehouse clerk — SIM)",
      summary:
        "Unusual outbound connection pattern after a scheduled software update window. Sensor flagged repeated short bursts to an unfamiliar external IP in documentation range 203.0.113.0/24 (TEST-NET-3).",
      indicators: [
        {
          label: "Dest IP",
          value: "203.0.113.77 (SIMULATION — documentation range)",
        },
        {
          label: "Port",
          value: "443/tcp (encrypted — content not inspected)",
        },
        {
          label: "Process",
          value: "updater_helper.exe — parent: scheduled task (SIM)",
        },
        {
          label: "Hash",
          value: "SIMULATION:a1b2c3d4e5f67890… (not a real sample)",
        },
        {
          label: "Volume",
          value: "~2.4 MB over 6 minutes — small bursts",
        },
      ],
      noise: [
        "Nightly inventory sync ran on schedule 20 minutes earlier (expected).",
        "Same host had a false-positive adware alert last month (closed, benign).",
      ],
    },
    severity: {
      prompt: "How would you classify this alert for Northglass Logistics?",
      options: [
        {
          id: "info",
          label: "Informational",
          points: 0,
          feedback:
            "Too soft. Repeated unknown egress after an update window deserves more than a shrug — even if it turns out benign.",
        },
        {
          id: "low",
          label: "Low",
          points: 1,
          feedback:
            "Defensible as a first pass, but the unknown destination and burst pattern suggest you should treat it as at least medium until cleared.",
        },
        {
          id: "medium",
          label: "Medium",
          points: 3,
          feedback:
            "Solid call. Unknown egress + post-update timing warrants active triage without panicking the floor.",
          best: true,
        },
        {
          id: "critical",
          label: "Critical",
          points: 1,
          feedback:
            "Possible over-escalation. Volume is small and there's no confirmed data loss yet — medium keeps urgency without burning the pager for every anomalous blip.",
        },
      ],
    },
    actions: {
      prompt: "What is your first action?",
      options: [
        {
          id: "investigate",
          label: "Investigate logs",
          detail:
            "Pull EDR timeline, DNS, and proxy summaries for NG-WRKSTN-042 (read-only).",
          points: 3,
          feedback:
            "Good first move. Understanding scope before you touch the host keeps you from flying blind — and stays defensive.",
          best: true,
        },
        {
          id: "isolate",
          label: "Isolate host",
          detail:
            "Network-quarantine NG-WRKSTN-042 via EDR containment policy.",
          points: 2,
          feedback:
            "Safe containment. Isolation stops further egress; follow up with log review so you know what you locked down.",
        },
        {
          id: "escalate",
          label: "Escalate to shift lead",
          detail:
            "Hand off to Sam with alert ID NGL-SOC-8841 and your severity call.",
          points: 2,
          feedback:
            "Reasonable when you're unsure. Escalation is a strength — just capture what you've already observed so Sam isn't starting cold.",
        },
        {
          id: "ignore",
          label: "Ignore / close as noise",
          detail: "Mark false positive based on last month's adware ticket.",
          points: 0,
          feedback:
            "Unsafe. Prior false positives don't clear a new unknown egress pattern. Closing early is how small problems become incidents.",
        },
      ],
    },
    afterAction: {
      maxScore: 6,
      passScore: 4,
      loreUnlock: {
        id: "crumb-m0",
        title: "Ops Floor Memo — Fragment",
        body:
          'FROM: Training Division archive\nSUBJECT: Why we call it MOD-HEAVY\n\n"Heavy" isn\'t about firepower. It\'s about the weight of the decision when the floor is quiet and the alert isn\'t. Contain first. Curiosity later — and never past the ROE.\n\n— Sam\n(SIMULATED training lore)',
      },
      scoreBands: [
        {
          min: 5,
          label: "Sharp judgment",
          note: "You balanced urgency with process. Ready for deeper modules when they ship.",
        },
        {
          min: 3,
          label: "Solid trainee",
          note: "Core instincts are sound. Re-read the ROE and evidence noise next time.",
        },
        {
          min: 0,
          label: "Needs a second pass",
          note: "Re-run Mission Zero with the briefing open. Prefer investigate / isolate / escalate over closing early.",
        },
      ],
    },
  };

  async function loadMission() {
    try {
      const res = await fetch("missions/m0.json", { cache: "no-store" });
      if (res.ok) {
        mission = await res.json();
        return;
      }
    } catch (_) {
      /* file:// or offline — use embed */
    }
    mission = EMBEDDED;
  }

  async function init() {
    tickClock();
    setInterval(tickClock, 1000);
    bindNav();
    loadStored();
    await loadMission();
    renderBriefing();
    const hash = (location.hash || "").replace(/^#/, "");
    const allowed = ["hub", "about", "briefing", "triage", "after"];
    if (allowed.includes(hash)) {
      if (hash === "triage") {
        renderAlert();
        renderTriagePrompts();
        showView("triage");
      } else if (hash === "after") {
        if (state.actionId) {
          renderAfterAction();
          showView("after");
        } else {
          showView("hub");
        }
      } else {
        showView(hash);
      }
    } else {
      showView("hub");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
