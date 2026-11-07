/* OSHOT — content layer
 * Projects -> work cards + case modal.
 * File names: assets/work-01-a.mp4 (main) + work-01-b/c/d (the three small ones), same for 02..06
 * The small ones can be videos (mp4) or images (any extension) — use vids("02", "auto") for images.
 */
(() => {
  "use strict";

  const CONFIG = {
    SHEET_CSV_URL: "",
    CACHE_KEY: "oshot_projects_v2"
  };

  const IMG_EXTS = ["jpg", "jpeg", "png", "webp", "JPG", "JPEG", "PNG", "WEBP", "avif", "gif"];

  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- CSV ---------- */
  function parseCSV(t) {
    const rows = [];
    let row = [], cur = "", q = false;
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (q) {
        if (c === '"') { if (t[i + 1] === '"') { cur += '"'; i++; } else q = false; }
        else cur += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(cur); cur = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && t[i + 1] === "\n") i++;
        row.push(cur); cur = ""; rows.push(row); row = [];
      } else cur += c;
    }
    if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
    const head = rows.shift().map((h) => h.trim().toLowerCase());
    return rows
      .filter((r) => r.some((x) => x.trim()))
      .map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] || "").trim()])));
  }

  /* ---------- media sources ---------- */
  function media(v) {
    v = (v || "").trim();
    if (!v) return null;
    if (v.startsWith("auto:")) return { t: "auto", base: v.slice(5) };
    if (/vimeo\.com/i.test(v)) {
      const id = (v.match(/(\d{6,})/) || [])[1];
      const h = (v.match(/(?:\/\d+\/|h=)([a-f0-9]{8,})/i) || [])[1] || "";
      return id ? { t: "vimeo", id, h } : null;
    }
    let m = v.match(/^(\d{6,})(?:\/([a-z0-9]+))?$/i);
    if (m) return { t: "vimeo", id: m[1], h: m[2] || "" };
    if (/drive\.google\.com/i.test(v)) {
      m = v.match(/\/folders\/([\w-]+)/);
      if (m) return { t: "folder", id: m[1] };
      m = v.match(/\/d\/([\w-]+)|[?&]id=([\w-]+)/);
      return m ? { t: "drive", id: m[1] || m[2] } : null;
    }
    if (/^[\w-]{20,}$/.test(v)) return { t: "drive", id: v };
    if (/\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i.test(v)) return { t: "img", url: v };
    return { t: "mp4", url: v };
  }

  /* بيجرّب الامتدادات لحد ما يلاقي الصورة الحقيقية، ولو ملقاش يعتبره mp4 */
  const probe = (url) => new Promise((res) => {
    const i = new Image();
    i.onload = () => res(true);
    i.onerror = () => res(false);
    i.src = url;
  });

  async function resolveMedia(m) {
    if (!m || m.t !== "auto") return m;
    for (const ext of IMG_EXTS) {
      if (await probe(`${m.base}.${ext}`)) return { t: "img", url: `${m.base}.${ext}` };
    }
    return { t: "mp4", url: `${m.base}.mp4` };
  }

  const imgUrl = (v) => {
    const m = media(v);
    if (!m) return "";
    return m.t === "drive" ? `https://drive.google.com/thumbnail?id=${m.id}&sz=w1600` : (m.url || "");
  };

  const vurl = (m, q) => `https://player.vimeo.com/video/${m.id}?${m.h ? "h=" + m.h + "&" : ""}${q}`;

  const thumbCache = {};
  async function thumb(m) {
    if (!m) return "";
    if (m.t === "drive") return imgUrl(m.id);
    if (m.t !== "vimeo") return "";
    if (thumbCache[m.id] !== undefined) return thumbCache[m.id];
    try {
      const u = `https://vimeo.com/${m.id}${m.h ? "/" + m.h : ""}`;
      const r = await fetch(`https://vimeo.com/api/oembed.json?width=1280&url=${encodeURIComponent(u)}`);
      thumbCache[m.id] = (await r.json()).thumbnail_url || "";
    } catch { thumbCache[m.id] = ""; }
    return thumbCache[m.id];
  }

  /* =====================================================================
     PROJECTS
     الملفات في فولدر assets بالأسماء دي:
       work-01-a.mp4  = الفيديو الكبير
       work-01-b / work-01-c / work-01-d = التلات الصغيرين
     لو التلاتة فيديوهات mp4:      ...vids("01")
     لو التلاتة صور (أي امتداد):   ...vids("02", "auto")
     لو عايزة امتداد معين لكل واحدة: ...vids("02", { b: "png", c: "jpg", d: "webp" })
     ===================================================================== */
  const vids = (n, ext = {}) => {
    if (ext === "auto") ext = { b: "auto", c: "auto", d: "auto" };
    const a = ["a", "b", "c", "d"].map((l) =>
      ext[l] === "auto" ? `auto:assets/work-${n}-${l}` : `assets/work-${n}-${l}.${ext[l] || "mp4"}`);
    return { preview: a[0], film: a[0], extra: a.slice(1).join("|") };
  };

  const PROJECTS = [
    {
      cat: "brand", size: "wide", year: "2026",
      title: "Global Link — Flagship Brand Launch.",
      client: "GLOBAL LINK",
      ref: "GLOBAL LINK",
      lens: "35MM & 85MM PRIME (F/1.4)",
      ...vids("01"),
      synopsis: "A flagship brand launch campaign positioning Global Link as the vital artery of regional connectivity. Designed from the ground up with an editorial dark-luxury aesthetic, blending sweeping architectural scale with intimate human craft.",
      execution: "Translating abstract telecommunications and logistics infrastructure into a visceral, emotionally resonant cinematic film without relying on generic stock tropes.",
      deliverables: "Master Hero Film (2.39:1)|30s Broadcast TVC|Key Visual Stills Campaign|Social Vertical Cutdowns",
      director: "Karim Samhan", dop: "Karim Samhan (OSHOT)",
      acq: "Sony Cinema Line • 10-bit 4:2:2 S-Log3",
      optics: "35mm & 85mm Prime Lenses (f/1.4)",
      lighting: "Anamorphic Streak + Warm Tungsten Key & Haze",
      pipeline: "S-Log3 / S-Gamut3.Cine → DaVinci Resolve Film Print Emulation"
    },
    {
      cat: "product", size: "tall", year: "2026",
      title: "Vitabiotics — Wellman & Wellwoman.",
      client: "VITABIOTICS",
      ref: "VITABIOTICS — WELLMAN & WELLWOMAN",
      lens: "90MM MACRO 1:1 + 85MM PRIME",
      ...vids("02", "auto"),
      synopsis: "High-speed tabletop and macro commercial cinematography for Vitabiotics' flagship Wellman and Wellwoman lines. Every metallic foil reflection, blister pack texture, and kinetic water droplet was choreographed in-camera.",
      execution: "Controlling metallic packaging reflections while maintaining ultra-clean, high-key pharmaceutical purity at 120 frames per second.",
      deliverables: "2X 30S Commercial Spots|Macro Loop Assets|High-Res Packshot Stills",
      director: "Karim Samhan", dop: "Karim Samhan",
      acq: "4K 120fps High-Speed • 10-bit 4:2:2",
      optics: "90mm Macro 1:1 + 85mm Prime",
      lighting: "High-Key Book Light, Overhead Scrim & Specular Rim Control",
      pipeline: "Clinical Crisp White Balance + Vibrant Brand Accent Isolation"
    },
    {
      cat: "tvc", size: "tall", year: "2026",
      title: "Banzeen — Night Launch Anthem.",
      client: "BANZEEN",
      ref: "BANZEEN",
      lens: "24MM WIDE & 50MM PRIME",
      ...vids("03"),
      synopsis: "An adrenaline-charged commercial launch for BANZEEN. Utilizing low-angle car-to-car rigging, whip-pans, and rhythmic sound design to turn an everyday utility into a bold lifestyle statement.",
      execution: "Achieving dynamic motion blur and pristine night-exterior shadow retention across multiple urban locations in a single night shoot.",
      deliverables: "60S Launch Anthem|15S Bumper Ads|Sound Design & Score",
      director: "Karim Samhan", dop: "Karim Samhan",
      acq: "Full-Frame Cinema • 180° Shutter Rule • S-Log3",
      optics: "24mm Wide & 50mm Prime Lenses",
      lighting: "Practical Sodium-Vapor Mixed with Bi-Color LED Tubes",
      pipeline: "High-Contrast Carbon & Ignition Red Custom LUT"
    },
    {
      cat: "cine", size: "wide", year: "2026",
      title: "Liwa Festival — Desert Chronicle.",
      client: "LIWA FESTIVAL (UAE)",
      ref: "LIWA FESTIVAL — DESERT CHRONICLE",
      lens: "35MM, 50MM & 85MM WEATHER-SEALED",
      ...vids("04"),
      synopsis: "A multi-day visual chronicle across Muzerra'a, Liwa Village, and the iconic Moreeb Dune. Capturing the raw horsepower, heritage falconry, and monumental desert light installations of the UAE's premier winter festival.",
      execution: "Operating cinema sensors and prime glass in extreme desert sandstorms while transitioning seamlessly from blinding midday dunes to low-light night concerts.",
      deliverables: "Official Aftermovie|Daily Highlight Reels|Aerial & Ground B-Roll Archive",
      director: "Oshot Live Unit", dop: "Karim Samhan",
      acq: "Dual-Base ISO Cinema Package • Variable ND 2-7 Stops",
      optics: "35mm, 50mm & 85mm Weather-Sealed Primes",
      lighting: "Golden Hour Natural Shaping + Night Festival Practicals",
      pipeline: "Warm Desert Amber & Deep Midnight Teal Separation"
    },
    {
      cat: "cine", size: "wide", year: "2026",
      title: "Petra & Amman — Visual Study.",
      client: "PETRA × DOWNTOWN AMMAN",
      ref: "PETRA & DOWNTOWN AMMAN",
      lens: "35MM & 50MM PRIME",
      ...vids("05"),
      synopsis: "Poetic visual study contrasting the timeless Nabataean carvings of Petra with the layered urban typography and historic staircases of Downtown Amman.",
      execution: "Preserving highlight roll-off in harsh Levantine sunlight while retaining rich texture in deep canyon shadows.",
      deliverables: "Editorial Short Film|Exhibition Stills|Tourism Licensing Package",
      director: "Karim Samhan", dop: "Karim Samhan",
      acq: "Sony S-Log3 • 24fps True Cinema Cadence",
      optics: "35mm & 50mm Prime Lenses",
      lighting: "Chiaroscuro Natural Shafts & Candlelight",
      pipeline: "Kodak 2383 Print Curve with Halation"
    },
    {
      cat: "tvc", size: "tall", year: "2026",
      title: "Early Detection — Three-Act TVC.",
      client: "AWARENESS CAMPAIGN",
      ref: "EARLY DETECTION AWARENESS TVC",
      lens: "50MM & 85MM PORTRAIT PRIMES",
      ...vids("06"),
      synopsis: "A meticulously storyboarded three-act narrative TVC weaving together a mother at home, a teacher in her classroom, and athletes entering a stadium—uniting everyday resilience with early-detection awareness.",
      execution: "Executing frame-accurate match-cuts between three drastically different lighting environments (intimate domestic interior, institutional classroom, and open-air stadium).",
      deliverables: "Full Storyboard & Pre-Vis|90S Broadcast TVC|Out-of-Home Stills",
      director: "Karim Samhan", dop: "Karim Samhan",
      acq: "10-bit 4:2:2 Cinema Line • Dolly & Gimbal Package",
      optics: "50mm & 85mm Portrait Primes",
      lighting: "Soft Diffused Window Key (Home/Classroom) + Stadium Floods",
      pipeline: "Empathetic Warm Skin Tones + Signature Ribbon Accent"
    }
  ];

  /* ---------- load ---------- */
  async function load() {
    let rows = null;
    try {
      if (!CONFIG.SHEET_CSV_URL) throw 0;
      const r = await fetch(CONFIG.SHEET_CSV_URL, { cache: "no-cache" });
      if (!r.ok) throw 0;
      const txt = await r.text();
      rows = parseCSV(txt);
      try { localStorage.setItem(CONFIG.CACHE_KEY, txt); } catch {}
    } catch {
      try { const c = localStorage.getItem(CONFIG.CACHE_KEY); if (c) rows = parseCSV(c); } catch {}
    }
    const list = (rows && rows.length ? rows : PROJECTS)
      .filter((r) => (r.published || "TRUE").toUpperCase() !== "FALSE")
      .map((r, i) => ({
        num: String(i + 1).padStart(2, "0"),
        cat: r.cat || "tvc",
        wide: (r.size || "").toLowerCase() === "wide",
        title: r.title, client: r.client, year: r.year || "2026", lens: r.lens,
        ref: r.ref || r.client || r.title,
        preview: media(r.preview),
        films: [r.film, ...(r.extra || "").split("|")].map(media).filter(Boolean),
        poster: imgUrl(r.poster),
        synopsis: r.synopsis, execution: r.execution,
        deliverables: (r.deliverables || "").split("|").map((s) => s.trim()).filter(Boolean),
        director: r.director || "Karim Samhan", dop: r.dop || "Karim Samhan (OSHOT)",
        acq: r.acq, optics: r.optics, lighting: r.lighting, pipeline: r.pipeline
      }));

    await Promise.all(list.map(async (p) => {
      p.preview = await resolveMedia(p.preview);
      p.films = await Promise.all(p.films.map(resolveMedia));
    }));
    return list;
  }

  const CAT_LABEL = { tvc: "COMMERCIAL TVC", brand: "BRAND CAMPAIGNS", product: "PRODUCT & MACRO", cine: "CINEMATOGRAPHY / DOP" };

  /* ---------- styles for the dynamic parts ---------- */
  const st = document.createElement("style");
  st.textContent = `
    .wm-poster{position:absolute;inset:0;background:#1b1b1b center/cover no-repeat;transition:transform .7s cubic-bezier(.2,.7,.2,1)}
    .work-card:hover .wm-poster{transform:scale(1.03)}
    .wm-live{position:absolute;top:50%;left:50%;height:100%;aspect-ratio:16/9;width:auto;transform:translate(-50%,-50%);border:0;object-fit:cover;pointer-events:none;opacity:0;animation:wmIn .5s .25s forwards}
    video.wm-live{width:100%;height:100%;aspect-ratio:auto;transform:none;top:0;left:0}
    @keyframes wmIn{to{opacity:1}}
    .case-thumb img{display:block;width:100%;height:100%;object-fit:cover}
    iframe.case-video{border:0}
    img.case-player{object-fit:contain;cursor:default}
  `;
  document.head.appendChild(st);

  /* ---------- cards ---------- */
  const grid = $("#workGrid");
  const caseEl = $("#caseModal");
  let P = [];

  function makeLive(m) {
    let el;
    if (m.t === "vimeo") {
      el = document.createElement("iframe");
      el.src = vurl(m, "background=1&autoplay=1&loop=1&muted=1");
      el.allow = "autoplay";
      el.tabIndex = -1;
    } else if (m.t === "mp4") {
      el = document.createElement("video");
      Object.assign(el, { src: m.url, autoplay: true, muted: true, loop: true, playsInline: true });
    } else return null;
    el.className = "wm-live";
    return el;
  }

  function renderGrid() {
    if (!P.length) {
      grid.innerHTML = '<p style="grid-column:1/-1;color:#8a8a8a;font-family:var(--font-mono);font-size:12px">CONTENT UNAVAILABLE — CHECK SHEET LINK</p>';
      return;
    }
    grid.innerHTML = P.map((p) => `
      <a class="work-card ${p.wide ? "is-wide" : "is-offset"}" href="#" data-cat="${esc(p.cat)}">
        <div class="work-media">
          <div class="wm-poster"></div>
          <span class="work-num">${p.num}</span>
          <span class="work-lens">${esc(p.lens)}</span>
          <span class="work-arrow">↗</span>
          <span class="work-pill">VIEW CASE<i class="pill-icon arrow"></i></span>
        </div>
        <div class="work-info">
          <div>
            <span class="work-cat">${CAT_LABEL[p.cat] || esc(p.cat)}</span>
            <h3 class="work-name">${esc(p.title)}</h3>
          </div>
          <div class="work-meta"><span>${esc(p.client)}</span><span>${esc(p.year)}</span></div>
        </div>
      </a>`).join("");

    const navLink = $('.site-nav a[href="#work"]');
    if (navLink) navLink.textContent = `SELECTED WORK (${P.length})`;

    grid.querySelectorAll(".work-card").forEach((card, i) => {
      const p = P[i];
      const box = $(".work-media", card);
      const poster = $(".wm-poster", card);
      const first = p.preview || p.films[0];
      if (p.poster) poster.style.backgroundImage = `url("${p.poster}")`;
      else if (first && first.t === "img") poster.style.backgroundImage = `url("${first.url}")`;
      else if (first && first.t === "mp4") {
        const v = document.createElement("video");
        Object.assign(v, { src: first.url + "#t=0.5", muted: true, playsInline: true, preload: "metadata" });
        v.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:1";
        poster.appendChild(v);
      } else thumb(first).then((u) => { if (u) poster.style.backgroundImage = `url("${u}")`; });

      card.addEventListener("mousemove", (e) => {
        const r = box.getBoundingClientRect();
        box.style.setProperty("--x", `${e.clientX - r.left}px`);
        box.style.setProperty("--y", `${e.clientY - r.top}px`);
      });

      let live = null;
      const on = () => {
        if (live || !p.preview) return;
        live = makeLive(p.preview);
        if (live) box.insertBefore(live, $(".work-num", box));
      };
      const off = () => { live?.remove(); live = null; };
      card.addEventListener("mouseenter", on);
      card.addEventListener("mouseleave", off);
      if (matchMedia("(hover:none)").matches) {
        new IntersectionObserver(([en]) => (en.isIntersecting ? on() : off()), { threshold: 0.6 }).observe(card);
      }

      card.addEventListener("click", (e) => {
        e.preventDefault();
        openCase(i);
        bootstrap.Modal.getOrCreateInstance(caseEl).show();
      });
    });
  }

  /* ---------- filters ---------- */
  document.querySelectorAll(".work-filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      document.querySelectorAll(".work-filter").forEach((b) => b.classList.toggle("is-active", b === btn));
      grid.querySelectorAll(".work-card").forEach((c) => { c.hidden = f !== "all" && c.dataset.cat !== f; });
      grid.classList.toggle("is-filtered", f !== "all");
    });
  });

  /* ---------- case modal ---------- */
  const stage = $("#caseStage");
  const vF = $("#caseFinal");
  const vG = $("#caseFlat");
  const range = $("#caseRange");
  const handle = $("#caseHandle");
  const thumbs = $("#caseThumbs");
  const setText = (id, v) => { $("#" + id).textContent = v || ""; };
  let order = [];
  let eng = null;
  let dragging = false;
  let currentRef = "";

  function setPos(p) {
    const pos = Math.min(98, Math.max(2, p));
    stage.style.setProperty("--pos", `${pos}%`);
    range.value = Math.round(100 - pos);
    range.style.setProperty("--v", `${range.value}%`);
  }
  range.addEventListener("input", () => setPos(100 - Number(range.value)));
  handle.addEventListener("pointerdown", (e) => { e.preventDefault(); dragging = true; handle.setPointerCapture(e.pointerId); });
  handle.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const r = stage.getBoundingClientRect();
    setPos(((e.clientX - r.left) / r.width) * 100);
  });
  ["pointerup", "pointercancel"].forEach((t) => handle.addEventListener(t, () => { dragging = false; }));

  function clearEngine() {
    if (eng) {
      eng.players?.forEach((pl) => pl.destroy().catch(() => {}));
      eng.els.forEach((e) => e.remove());
      eng = null;
    }
    [vF, vG].forEach((v) => { v.pause(); v.removeAttribute("src"); v.load(); v.hidden = true; });
  }

  function mount(m) {
    clearEngine();
    if (!m) return;

    if (m.t === "img") {
      const im = document.createElement("img");
      im.className = "case-player";
      im.alt = "";
      im.src = m.url;
      stage.append(im);
      eng = { els: [im], paused: () => true, play() {}, pause() {} };
      return;
    }

    if (m.t === "mp4") {
      [vF, vG].forEach((v) => { v.hidden = false; v.src = `${m.url}#t=0.5`; });
      vF.ontimeupdate = () => { if (Math.abs(vG.currentTime - vF.currentTime) > 0.15) vG.currentTime = vF.currentTime; };
      eng = {
        els: [],
        paused: () => vF.paused,
        play() { vG.currentTime = vF.currentTime; vF.play().catch(() => {}); vG.play().catch(() => {}); },
        pause() { vF.pause(); vG.pause(); }
      };
      return;
    }

    if (m.t === "drive") {
      const f = document.createElement("iframe");
      f.className = "case-player";
      f.src = `https://drive.google.com/file/d/${m.id}/preview`;
      f.allow = "autoplay; fullscreen";
      stage.append(f);
      eng = { els: [f], paused: () => true, play() {}, pause() {} };
      return;
    }

    if (m.t === "folder") {
      const f = document.createElement("iframe");
      f.className = "case-player";
      f.src = `https://drive.google.com/embeddedfolderview?id=${m.id}#grid`;
      stage.append(f);
      eng = { els: [f], paused: () => true, play() {}, pause() {} };
      return;
    }

    if (!window.Vimeo) return;
    const mk = (muted, cls) => {
      const f = document.createElement("iframe");
      f.className = `case-video ${cls}`;
      f.src = vurl(m, `controls=0&muted=${muted ? 1 : 0}&playsinline=1&dnt=1&title=0&byline=0&portrait=0`);
      f.allow = "autoplay; fullscreen";
      f.style.pointerEvents = "none";
      return f;
    };
    const a = mk(false, "case-final");
    const b = mk(true, "case-flat");
    stage.prepend(a, b);
    const pa = new Vimeo.Player(a);
    const pb = new Vimeo.Player(b);
    let paused = true;
    pa.on("timeupdate", async (d) => {
      const t = await pb.getCurrentTime().catch(() => d.seconds);
      if (Math.abs(t - d.seconds) > 0.3) pb.setCurrentTime(d.seconds).catch(() => {});
    });
    pa.on("ended", () => { paused = true; pb.pause().catch(() => {}); });
    eng = {
      els: [a, b],
      players: [pa, pb],
      paused: () => paused,
      play() { paused = false; pa.play().catch(() => {}); pb.play().catch(() => {}); },
      pause() { paused = true; pa.pause().catch(() => {}); pb.pause().catch(() => {}); }
    };
  }

  function renderThumbs() {
    thumbs.innerHTML = order.slice(1).map((_, i) =>
      `<button type="button" class="case-thumb" data-i="${i + 1}" aria-label="Item ${i + 2}"><img alt=""></button>`).join("");
    thumbs.querySelectorAll(".case-thumb").forEach((b, i) => {
      const m = order[i + 1];
      if (m.t === "img") b.innerHTML = `<img src="${esc(m.url)}" alt="">`;
      else if (m.t === "mp4") b.innerHTML = `<video src="${esc(m.url)}#t=0.5" muted playsinline preload="metadata"></video>`;
      else thumb(m).then((u) => { if (u) b.firstChild.src = u; });
    });
    $(".case-frames").hidden = order.length < 2;
  }

  thumbs.addEventListener("click", (e) => {
    const b = e.target.closest(".case-thumb");
    if (!b) return;
    const i = Number(b.dataset.i);
    [order[0], order[i]] = [order[i], order[0]];
    mount(order[0]);
    renderThumbs();
    eng?.play();
  });

  function openCase(i) {
    const p = P[i];
    currentRef = p.ref;
    setText("caseTag", `CASE STUDY // ${p.num}`);
    setText("caseClient", `${p.client} (${p.year})`);
    setText("caseCat", CAT_LABEL[p.cat] || p.cat);
    setText("caseTitle", p.title);
    setText("caseSynopsis", p.synopsis);
    setText("caseExecution", p.execution);
    $("#caseSynopsis").dir = "auto";
    $("#caseExecution").dir = "auto";
    $("#caseExecLabel").hidden = $("#caseExecution").hidden = !p.execution;
    setText("caseDirector", p.director);
    setText("caseDop", p.dop);
    setText("caseAcq", p.acq);
    setText("caseOptics", p.optics);
    setText("caseLighting", p.lighting);
    setText("casePipeline", p.pipeline);
    $("#caseChips").innerHTML = p.deliverables.map((d) => `<span class="case-chip">${esc(d)}</span>`).join("");
    order = [...p.films];
    mount(order[0]);
    renderThumbs();
    setPos(32);
  }

  stage.addEventListener("click", (e) => {
    if (e.target.closest(".case-wipe-handle, .case-slider, .case-player")) return;
    if (!eng) return;
    eng.paused() ? eng.play() : eng.pause();
  });

  caseEl.addEventListener("hidden.bs.modal", clearEngine);

  /* ---------- COMMISSION SIMILAR FILM -> opens the brief form ---------- */
  const cta = $(".case-cta");
  if (cta) {
    cta.removeAttribute("data-bs-dismiss");
    cta.setAttribute("href", "#");
    cta.addEventListener("click", (e) => {
      e.preventDefault();
      const ref = currentRef;
      caseEl.addEventListener("hidden.bs.modal", () => openBriefWithRef(ref), { once: true });
      bootstrap.Modal.getOrCreateInstance(caseEl).hide();
    });
  }

  /* ---------- service images (MADE OF MANY MOVING PARTS) ----------
     بيحمّل الصور فورًا (من غير lazy) وبيجرّب الامتدادات المشهورة */
  document.querySelectorAll(".sv-img").forEach((img) => {
    const base = (img.getAttribute("src") || "").replace(/\.[^./]+$/, "");
    let k = 0;
    const next = () => { if (k < IMG_EXTS.length) img.src = `${base}.${IMG_EXTS[k++]}`; };
    img.addEventListener("error", next);
    img.loading = "eager";
    if (img.complete && img.naturalWidth === 0) next();
  });

  /* ---------- boot ---------- */
  load().then((rows) => { P = rows; renderGrid(); });
})();