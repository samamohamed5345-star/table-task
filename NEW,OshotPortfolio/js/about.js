(() => {
  "use strict";

  const section = document.getElementById("about");
  if (!section) return;

  const modalEl = document.getElementById("filmModal");
  const frame = document.getElementById("filmFrame");
  const kicker = document.getElementById("filmKicker");
  const title = document.getElementById("filmTitle");
  const desc = document.getElementById("filmDesc");

  if (modalEl && frame) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

    section.querySelectorAll(".ab-card").forEach((card) => {
      const media = card.querySelector(".ab-media");
      const btn = card.querySelector(".ab-watch");
      const id = card.dataset.drive;
      if (!media || !id) return;

      media.addEventListener("mousemove", (e) => {
        const r = media.getBoundingClientRect();
        media.style.setProperty("--x", `${e.clientX - r.left}px`);
        media.style.setProperty("--y", `${e.clientY - r.top}px`);
      });

      const open = () => {
        kicker.textContent = card.dataset.kicker || "";
        title.textContent = card.dataset.title || "";
        desc.textContent = card.dataset.desc || "";
        frame.src = `https://drive.google.com/file/d/${id}/preview`;
        modal.show();
      };

      media.addEventListener("click", open);
      if (btn) btn.addEventListener("click", open);
    });

    modalEl.addEventListener("hidden.bs.modal", () => {
      frame.src = "about:blank";
    });
  }

  const file = document.getElementById("abTeamFile");
  const img = document.getElementById("abTeamImg");
  if (file && img) {
    let url = "";
    img.addEventListener("error", () => { img.style.visibility = "hidden"; });
    file.addEventListener("change", () => {
      const f = file.files && file.files[0];
      if (!f || !f.type.startsWith("image/")) return;
      if (url) URL.revokeObjectURL(url);
      url = URL.createObjectURL(f);
      img.style.visibility = "";
      img.src = url;
    });
  }
})();