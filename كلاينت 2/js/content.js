/* OSHOT — content layer
 * Google Sheet (CSV) -> work cards + case modal. Videos on Vimeo, images on Google Drive.
 * Replaces the CASES array, the static cards and the case-modal code in index.js.
 */
(() => {
  "use strict";

  const CONFIG = {
    // Google Sheet -> File > Share > Publish to web > (your sheet tab) > CSV -> paste the link here
    SHEET_CSV_URL: "",
    CACHE_KEY: "oshot_projects_v1"
  };

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

  /* ---------- media sources: Vimeo ID / Vimeo URL / "ID/hash" / Drive link or ID / mp4 URL ---------- */
  function media(v) {
    v = (v || "").trim();
    if (!v) return null;
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
    return { t: "mp4", url: v };
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
     PROJECTS — الفيديوهات والبيانات هنا. غيّر اللينكات من هنا مباشرة.
     film  = الفيديو الكبير
     extra = التلات فيديوهات الصغيرين، بينهم علامة |
     تقدر تحط لينك Google Drive (ملف أو مجلد) أو رقم فيديو Vimeo.
     (لو حطيت رابط الشيت في SHEET_CSV_URL، الشيت هو اللي هيتقرا بدل القايمة دي)
     ===================================================================== */
  const D = (id) => `https://drive.google.com/file/d/${id}/view`;

  const PROJECTS = [
    {
      cat: "brand", size: "wide", year: "2026",
      title: "Integrated Brand Identity & Visual Campaign.",
      client: "FULL BRAND CAMPAIGN SUITE",
      lens: "ANAMORPHIC & PRIME LENS SET",
      film: D("10w57--8FI-bFI9dQRxgvGe3cY-1Fbois"),
      extra: [D("1fqFlDFFyJy4UmzXViW6BCBFJ0R5l9r-N"), D("1zRJCxbQKoheluOrAc4CoRnix9jYhTXUy"), D("1qOVtqpl8MHdGHrLw7MllXIIlFkHhSTPY")].join("|"),
      synopsis: "منظومة بصرية وحملة إعلانية متكاملة للشركات تشمل التخطيط الإبداعي، إنتاج الفيديوهات الترويجية، وتصميم المخرجات البصرية المتعددة لضمان حضور قوي ومتناسق للعلامة التجارية.",
      deliverables: "Campaign Strategy & Direction|Hero Brand Films|Multi-Platform Social Assets|Key Visuals & CGI Integration",
      acq: "Full Studio Cinema Package", optics: "Anamorphic & Prime Lens Set",
      lighting: "Custom Multi-Point Studio Rig", pipeline: "S-Log3 / ACES Color Pipeline"
    },
    {
      cat: "product", size: "tall", year: "2026",
      title: "Precision Studio Lighting & Macro Craft.",
      client: "PRODUCT & MACRO SHOWCASE",
      lens: "90MM F/2.8 MACRO G OSS",
      film: "", extra: "",
      synopsis: "معرض متخصص في تصوير المنتجات والماكرو داخل الاستوديو (أحذية رياضية، مستحضرات تجميل، مكملات غذائية، ومشروبات) مع التحكم الدقيق في الانعكاسات وتصميم الإضاءة والـ CGI.",
      deliverables: "Studio Product Photography|Macro Motion Clips|3D CGI & AI-Enhanced Carousels",
      acq: "Sony Alpha High-Res + Fujifilm System", optics: "90mm f/2.8 Macro G OSS",
      lighting: "Optical Snoot, Scrims & Gradient Tubes", pipeline: "16-Bit RAW & S-Log3 Studio"
    },
    {
      cat: "tvc", size: "tall", year: "2026",
      title: "Crafted in Gold — High-Impact Commercial.",
      client: "AL-DHAHABI (الذهبي)",
      lens: "G-MASTER PRIME SERIES",
      film: "", extra: "",
      synopsis: "إعلان تجاري متكامل يبرز جودة المنتج الذهبي من خلال زوايا تصوير ديناميكية، إضاءة دافئة تعزز الملمس، وإيقاع مونتاج سريع يجذب الانتباه من الثانية الأولى.",
      deliverables: "Main Hero TVC (16:9)|Social Cutdowns (9:16)|Color Grading & Sound Design",
      acq: "Sony Cinema Line FX6", optics: "G-Master Prime Series",
      lighting: "Warm Tungsten Key + High-Speed Rim", pipeline: "S-Log3 / S-Gamut3.Cine 10-Bit"
    },
    {
      cat: "cine", size: "wide", year: "2026",
      title: "Director of Photography — Narrative & Visual Craft.",
      client: "CINEMATOGRAPHY SHOWCASE",
      lens: "CINEMA PRIMES",
      film: "", extra: "",
      synopsis: "مختارات سينمائية تبرز دور مدير التصوير (DOP) في بناء الحالة الدرامية عبر الإضاءة السينمائية، تكوين الكادر، وحركة الكاميرا المدروسة.",
      deliverables: "Principal Photography (DOP)|Lighting Design|DaVinci Resolve Color Grading",
      acq: "Sony Cinema Line (S-Log3 / RAW)", optics: "Cinema Primes",
      lighting: "Natural Motivated Light + HMI Fill", pipeline: "DaVinci Wide Gamut / Film Print Emulation"
    },
    {
      cat: "cine", size: "wide", year: "2026",
      title: "Petra Living Heritage — Cinematic Documentary.",
      client: "PETRA HERITAGE (البتراء)",
      lens: "24-70MM GM II & 70-200MM GM",
      film: "", extra: "",
      synopsis: "توثيق سينمائي في قلب مدينة البتراء الوردية (الخزنة) يمزج بين عظمة المكان التاريخي والتكوين البصري السينمائي تحت إضاءة الشمس الطبيعية والظلال العميقة.",
      deliverables: "Documentary Cinematography|Location Aerial & Gimbal Work|Cinematic Color Grade",
      acq: "Sony FX6 / S-Log3", optics: "24-70mm GM II & 70-200mm GM",
      lighting: "Golden Hour Natural Sun & Bounce", pipeline: "S-Log3 / Custom Desert Kodachrome LUT"
    },
    {
      cat: "tvc", size: "tall", year: "2026",
      title: "Taste in Motion — Tabletop & Food Cinema.",
      client: "BURGER MAKERS",
      lens: "90MM MACRO & 50MM PRIME",
      film: "", extra: "",
      synopsis: "إعلان تجاري سينمائي متخصص في تصوير الأطعمة (Tabletop Commercial) يركز على تفاصيل المكونات الطازجة، حركة اللهب، والإضاءة عالية التباين لفتح الشهية وإبراز جودة المنتج.",
      deliverables: "Hero Food Commercial|Macro Cutdowns|High-Speed 120fps Sequences",
      acq: "Sony Cinema Line 4K 120fps", optics: "90mm Macro & 50mm Prime",
      lighting: "Hard Backlight + Specular Catchlights", pipeline: "S-Log3 Rec.709 Food LUT"
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
    return (rows && rows.length ? rows : PROJECTS)
      .filter((r) => (r.published || "TRUE").toUpperCase() !== "FALSE")
      .map((r, i) => ({
        num: String(i + 1).padStart(2, "0"),
        cat: r.cat || "tvc",
        wide: (r.size || "").toLowerCase() === "wide",
        title: r.title, client: r.client, year: r.year || "2026", lens: r.lens,
        preview: media(r.preview),
        films: [r.film, ...(r.extra || "").split("|")].map(media).filter(Boolean),
        poster: imgUrl(r.poster),
        synopsis: r.synopsis, execution: r.execution,
        deliverables: (r.deliverables || "").split("|").map((s) => s.trim()).filter(Boolean),
        director: r.director || "Karim Samhan", dop: r.dop || "Karim Samhan (OSHOT)",
        acq: r.acq, optics: r.optics, lighting: r.lighting, pipeline: r.pipeline
      }));
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
      if (p.poster) poster.style.backgroundImage = `url("${p.poster}")`;
      else thumb(p.preview || p.films[0]).then((u) => { if (u) poster.style.backgroundImage = `url("${u}")`; });

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
      eng = { els: [f], paused: () => true, play() {}, pause() {} }; // Drive = no grade wipe
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

    // Vimeo: two synced players, the second one is flattened + clipped by CSS (.case-flat)
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
      `<button type="button" class="case-thumb" data-i="${i + 1}" aria-label="Video ${i + 2}"><img alt=""></button>`).join("");
    thumbs.querySelectorAll(".case-thumb").forEach((b, i) =>
      thumb(order[i + 1]).then((u) => { if (u) b.firstChild.src = u; }));
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

  /* ---------- boot ---------- */
  load().then((rows) => { P = rows; renderGrid(); });
})();