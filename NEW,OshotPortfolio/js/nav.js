(() => {
  "use strict";

  const body = document.body;
  const views = document.querySelectorAll(".nav-view");

  const closeMenu = () => {
    const menu = document.getElementById("mainNav");
    if (menu && menu.classList.contains("show")) {
      bootstrap.Collapse.getOrCreateInstance(menu).hide();
    }
  };

  const setView = (view, scrollTop = true) => {
    body.dataset.view = view;
    views.forEach((a) => {
      const on = a.dataset.view === view;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    if (scrollTop) window.scrollTo({ top: 0, behavior: "auto" });
  };

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href^='#']");
    if (!a) return;
    const href = a.getAttribute("href");

    // زرار ABOUT / STUDIO اللي في الـ hero: ينزل لسكشن About بس
    if (href === "#about" && a.classList.contains("hero-btn")) {
      e.preventDefault();
      const target = document.getElementById("about");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      closeMenu();
      return;
    }

    if (href === "#home" || a.classList.contains("brand")) {
      e.preventDefault();
      setView("home");
      closeMenu();
      return;
    }

    if (href === "#about") {
      e.preventDefault();
      setView("about");
      closeMenu();
      return;
    }

    if ((href === "#work" || href === "#reel") && body.dataset.view === "about") {
      e.preventDefault();
      setView("home", false);
      requestAnimationFrame(() => {
        const t = document.querySelector(href);
        if (t) t.scrollIntoView();
      });
      closeMenu();
      return;
    }

    closeMenu();
  });

  setView(location.hash === "#about" ? "about" : "home", false);

  const workLink = document.querySelector('.site-nav a[href="#work"]');
  if (workLink) {
    const clean = () => {
      if (workLink.textContent.trim() !== "SELECTED WORK") {
        workLink.textContent = "SELECTED WORK";
      }
    };
    clean();
    new MutationObserver(clean).observe(workLink, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }
})();