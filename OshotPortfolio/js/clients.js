(() => {
  "use strict";

  const EXTS = ["png", "jpg", "jpeg", "webp", "svg", "PNG", "JPG", "JPEG"];
  const SPEED = { left: 55, right: 45 }; // px / second
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;

  /* ---------- load an image, trying other extensions if needed ---------- */
  function settle(img) {
    return new Promise((resolve) => {
      img.loading = "eager";
      const cur = img.getAttribute("src") || "";
      const m = cur.match(/\.([^./?#]+)$/);
      const curExt = m ? m[1] : "";
      const base = cur.replace(/\.[^./]+$/, "");
      const queue = EXTS.filter((e) => e !== curExt);

      const cleanup = () => {
        img.removeEventListener("load", onLoad);
        img.removeEventListener("error", onError);
      };
      const onLoad = () => { cleanup(); resolve(true); };
      const onError = () => {
        const next = queue.shift();
        if (next) img.src = `${base}.${next}`;
        else { cleanup(); resolve(false); }
      };

      img.addEventListener("load", onLoad);
      img.addEventListener("error", onError);
      if (img.complete) (img.naturalWidth > 0 ? onLoad() : onError());
    });
  }

  const withTimeout = (p, ms) =>
    Promise.race([p, new Promise((r) => setTimeout(() => r(false), ms))]);

  /* ---------- marquee row (runs on the compositor via WAAPI) ---------- */
  class Row {
    constructor(rowEl) {
      this.row = rowEl;
      this.track = rowEl.querySelector(".cl-track");
      this.group = rowEl.querySelector(".cl-group");
      this.reverse = rowEl.classList.contains("is-reverse");
      this.base = this.reverse ? SPEED.right : SPEED.left;
      this.clones = [];
      this.anim = null;
      this.dur = 0;
      this.rate = 1;
      this.raf = 0;
      this.visible = true;
      this.token = 0;
    }

    async init() {
      const imgs = [...this.group.querySelectorAll("img")];
      const res = await Promise.all(imgs.map((i) => withTimeout(settle(i), 8000)));
      res.forEach((ok, i) => { if (!ok) imgs[i].closest(".cl-item")?.remove(); });
      await Promise.all(
        [...this.group.querySelectorAll("img")].map((i) => i.decode?.().catch(() => {}))
      );

      await this.build();
      this.bind();
      this.row.classList.add("is-ready");
    }

    async build() {
      const my = ++this.token;

      // remember progress so a resize doesn't restart the loop
      const frac = this.anim && this.dur
        ? ((this.anim.currentTime % this.dur) / this.dur) || 0
        : 0;

      if (this.anim) { this.anim.cancel(); this.anim = null; }
      this.clones.forEach((c) => c.remove());
      this.clones = [];
      if (reduceMotion) return;

      const makeClone = () => {
        const c = this.group.cloneNode(true);
        c.setAttribute("aria-hidden", "true");
        c.querySelectorAll("img").forEach((img) => { img.alt = ""; img.loading = "eager"; });
        this.track.appendChild(c);
        this.clones.push(c);
        return c;
      };

      const first = makeClone();
      const W = first.getBoundingClientRect().left - this.group.getBoundingClientRect().left;
      if (W <= 0) return;

      const extra = Math.max(0, Math.ceil(this.row.clientWidth / W) - 1);
      for (let i = 0; i < extra; i++) makeClone();

      // make sure every clone is decoded before it can scroll into view
      await Promise.all(
        this.clones.flatMap((c) => [...c.querySelectorAll("img")].map((i) => i.decode?.().catch(() => {})))
      );
      if (my !== this.token) return; // a newer build started

      this.dur = (W / this.base) * 1000;
      const from = this.reverse ? -W : 0;
      const to = this.reverse ? 0 : -W;

      this.anim = this.track.animate(
        [
          { transform: `translate3d(${from}px,0,0)` },
          { transform: `translate3d(${to}px,0,0)` },
        ],
        { duration: this.dur, iterations: Infinity, easing: "linear" }
      );
      this.anim.currentTime = frac * this.dur;
      this.anim.updatePlaybackRate(this.rate);
      if (!this.visible) this.anim.pause();
    }

    easeTo(target) {
      cancelAnimationFrame(this.raf);
      const step = () => {
        if (!this.anim) return;
        const diff = target - this.rate;
        this.rate = Math.abs(diff) < 0.01 ? target : this.rate + diff * 0.12;
        this.anim.updatePlaybackRate(this.rate);
        if (this.rate !== target) this.raf = requestAnimationFrame(step);
      };
      this.raf = requestAnimationFrame(step);
    }

    bind() {
      if (reduceMotion) return;
      if (canHover) {
        this.row.addEventListener("mouseenter", () => this.easeTo(0));
        this.row.addEventListener("mouseleave", () => this.easeTo(1));
      }
      new IntersectionObserver(([e]) => {
        this.visible = e.isIntersecting;
        if (!this.anim) return;
        this.visible ? this.anim.play() : this.anim.pause();
      }).observe(this.row);
    }
  }

  /* ---------- boot ---------- */
  const rows = [...document.querySelectorAll(".cl-row")]
    .filter((r) => r.querySelector(".cl-track .cl-group"))
    .map((r) => new Row(r));
  if (!rows.length) return;

  Promise.all(rows.map((r) => r.init())).then(() => {
    let lastW = window.innerWidth, timer;
    window.addEventListener("resize", () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (window.innerWidth === lastW) return;
        lastW = window.innerWidth;
        rows.forEach((r) => r.build());
      }, 250);
    });
  });
})();