/* =========================================================
   OSHOT — index.js
   (Selected Work cards, case modal and filters live in content.js)
   ========================================================= */

const studioBtn = document.getElementById("studioBtn");

/* ---------- Live timecode ---------- */
const tcEl = document.getElementById("timecode");
const fps = 24;
const startFrames = (1 * 60 + 23) * fps + 20;
const t0 = performance.now();
const pad = (n) => String(n).padStart(2, "0");

function tick(now) {
  const total = startFrames + Math.floor((now - t0) / (1000 / fps));
  const frames = total % fps;
  const seconds = Math.floor(total / fps) % 60;
  const minutes = Math.floor(total / fps / 60) % 60;
  const hours = Math.floor(total / fps / 3600);
  const text = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
  if (tcEl.textContent !== text) tcEl.textContent = text;
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

/* ---------- Reel stage ---------- */
const stage = document.getElementById("reelStage");
const gateButtons = document.querySelectorAll(".gate-btn");

gateButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    gateButtons.forEach((b) => {
      const active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", String(active));
    });
    stage.classList.toggle("is-full", btn.dataset.gate === "full");
  });
});

stage.addEventListener("mousemove", (e) => {
  const rect = stage.getBoundingClientRect();
  stage.style.setProperty("--x", `${e.clientX - rect.left}px`);
  stage.style.setProperty("--y", `${e.clientY - rect.top}px`);
});

const modalEl = document.getElementById("reelModal");
const reelVideo = document.getElementById("reelVideo");

stage.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }
});

modalEl.addEventListener("shown.bs.modal", () => {
  reelVideo.play().catch(() => {});
});

modalEl.addEventListener("hidden.bs.modal", () => {
  reelVideo.pause();
});

document.querySelectorAll("[data-time]").forEach((btn) => {
  btn.addEventListener("click", () => {
    reelVideo.currentTime = Number(btn.dataset.time);
    reelVideo.play().catch(() => {});
  });
});

/* ---------- Capabilities accordion ---------- */
const svRows = document.querySelectorAll(".sv-row");

svRows.forEach((row) => {
  const head = row.querySelector(".sv-head");

  head.addEventListener("mousemove", (e) => {
    const rect = head.getBoundingClientRect();
    head.style.setProperty("--x", `${e.clientX - rect.left}px`);
    head.style.setProperty("--y", `${e.clientY - rect.top}px`);
  });

  head.addEventListener("click", () => {
    const willOpen = !row.classList.contains("is-open");

    svRows.forEach((r) => {
      r.classList.remove("is-open");
      r.querySelector(".sv-head").setAttribute("aria-expanded", "false");
    });

    if (willOpen) {
      row.classList.add("is-open");
      head.setAttribute("aria-expanded", "true");
    }
  });
});

/* ---------- Brief form ---------- */
let MAIL_TO = "hello@oshotproduction.com";

const SCOPE_LABELS = [
  "Full Production (Concept to Master)",
  "Production + Post (Script to Master)",
  "DOP & Camera Unit Only",
  "Studio Tabletop & Packshots"
];

const SCOPE_TO_SCALE = ["1", "1", "1", "0"];

const cfgOpts = document.querySelectorAll(".cfg-opt");
const cfgScope = document.getElementById("cfgScope");
const cfgLaunch = document.getElementById("cfgLaunch");
const briefEl = document.getElementById("briefModal");
const briefForm = document.getElementById("briefForm");
const briefTitle = document.getElementById("briefTitle");
const briefName = document.getElementById("briefName");
const briefBrand = document.getElementById("briefBrand");
const briefScale = document.getElementById("briefScale");
const briefMsg = document.getElementById("briefMsg");
const briefSend = document.getElementById("briefSend");
const briefMail = document.getElementById("briefMail");
const contactStart = document.getElementById("contactStart");

let chosenFormat = "";

cfgOpts.forEach((btn) => {
  btn.addEventListener("click", () => {
    chosenFormat = btn.dataset.format;
    cfgOpts.forEach((b) => {
      const active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", String(active));
    });
  });
});

function briefHeading() {
  const format = chosenFormat || cfgOpts[0].dataset.format;
  return `${format} — ${SCOPE_LABELS[cfgScope.selectedIndex]}`;
}

function buildMailto(withBody) {
  let url = `mailto:${MAIL_TO}?subject=${encodeURIComponent(briefHeading())}`;
  if (withBody) {
    const body = [
      `Name: ${briefName.value.trim()}`,
      `Brand / Agency: ${briefBrand.value.trim()}`,
      `Production Scale: ${briefScale.options[briefScale.selectedIndex].text}`,
      "",
      briefMsg.value.trim()
    ].join("\n");
    url += `&body=${encodeURIComponent(body)}`;
  }
  return url;
}

function checkBrief() {
  const ok =
    briefName.value.trim() !== "" &&
    briefBrand.value.trim() !== "" &&
    briefMsg.value.trim() !== "";
  briefSend.disabled = !ok;
}

function openBrief() {
  briefTitle.textContent = briefHeading();
  briefScale.selectedIndex = Number(SCOPE_TO_SCALE[cfgScope.selectedIndex]);
  briefMail.href = buildMailto(false);
  checkBrief();
  bootstrap.Modal.getOrCreateInstance(briefEl).show();
}

cfgLaunch.addEventListener("click", openBrief);
contactStart.addEventListener("click", openBrief);

[briefName, briefBrand, briefMsg].forEach((el) => el.addEventListener("input", checkBrief));

briefForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (briefSend.disabled) return;
  window.location.href = buildMailto(true);
  bootstrap.Modal.getOrCreateInstance(briefEl).hide();
});

document.getElementById("backTop").addEventListener("click", (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ---------- Studio controls panel ---------- */
const studioPanel = document.getElementById("studioPanel");
const studioLabel = document.getElementById("studioLabel");
const spClose = document.getElementById("spClose");

function setStudio(open) {
  studioPanel.hidden = !open;
  studioBtn.setAttribute("aria-expanded", String(open));
  studioLabel.textContent = open ? "CLOSE STUDIO PROPS" : "STUDIO CONTROLS";
}

studioBtn.addEventListener("click", () => setStudio(studioPanel.hidden));
spClose.addEventListener("click", () => setStudio(false));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !studioPanel.hidden) setStudio(false);
});

const DEFAULTS = {
  founder: "Karim Samhan",
  email: "hello@oshotproduction.com",
  location: "Amman, Jordan",
  slate: "OSHOT COMMERCIAL REEL / 2025—26"
};

function bind(key, value) {
  const v = value.trim() || DEFAULTS[key];
  document.querySelectorAll(`[data-bind="${key}"]`).forEach((el) => {
    el.textContent = el.hasAttribute("data-upper") ? v.toUpperCase() : v;
  });
  return v;
}

document.getElementById("spName").addEventListener("input", (e) => bind("founder", e.target.value));
document.getElementById("spLoc").addEventListener("input", (e) => bind("location", e.target.value));
document.getElementById("spSlate").addEventListener("input", (e) => bind("slate", e.target.value));

document.getElementById("spEmail").addEventListener("input", (e) => {
  MAIL_TO = bind("email", e.target.value);
  document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
    a.href = a === briefMail ? buildMailto(false) : `mailto:${MAIL_TO}`;
  });
});

const reelPicture = document.querySelector(".reel-picture");
document.getElementById("spImg").addEventListener("input", (e) => {
  const url = e.target.value.trim();
  if (url) {
    reelPicture.style.backgroundImage = `url("${url.replace(/"/g, "%22")}")`;
    reelPicture.classList.add("has-img");
  } else {
    reelPicture.style.backgroundImage = "";
    reelPicture.classList.remove("has-img");
  }
});

studioPanel.querySelectorAll(".sp-switch input").forEach((sw) => {
  sw.addEventListener("change", () => {
    const id = sw.dataset.target;
    document.getElementById(id).hidden = !sw.checked;
    const li = document.querySelector(`.site-nav a[href="#${id}"]`)?.closest("li");
    if (li) li.hidden = !sw.checked;
  });
});