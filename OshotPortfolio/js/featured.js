(() => {
  "use strict";

  const grid = document.getElementById("featGrid");
  if (!grid) return;

  function enhance(card) {
    if (card.dataset.enhanced) return;
    const img = card.querySelector(".feat-img");
    const badge = card.querySelector(".feat-badge");
    const play = card.querySelector(".feat-play");
    const cat = card.querySelector(".feat-cat");
    if (!img) return;
    card.dataset.enhanced = "1";

    const media = document.createElement("div");
    media.className = "feat-media";

    const lens = document.createElement("span");
    lens.className = "feat-lens";
    lens.textContent = cat ? cat.textContent : "";

    const pill = document.createElement("span");
    pill.className = "feat-pill";
    pill.innerHTML = 'VIEW CASE<i class="pill-icon arrow"></i>';

    img.parentNode.insertBefore(media, img);
    media.appendChild(img);
    if (badge) media.appendChild(badge);
    media.appendChild(lens);
    if (play) media.appendChild(play);
    media.appendChild(pill);

    card.addEventListener("mousemove", (e) => {
      const r = media.getBoundingClientRect();
      media.style.setProperty("--x", `${e.clientX - r.left}px`);
      media.style.setProperty("--y", `${e.clientY - r.top}px`);
    });
  }

  const run = () => grid.querySelectorAll(".feat-card").forEach(enhance);

  new MutationObserver(run).observe(grid, { childList: true });
  run();
})();