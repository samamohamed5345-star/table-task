// Start Sec2
document.addEventListener("DOMContentLoaded", function () {
  const wrapper = document.querySelector(".slider-wrapper");
  const track = document.getElementById("sliderTrack");
  const originalItems = Array.from(track.children);
  const total = originalItems.length;
  const gap = 20;
  let index = 0;
  let timer = null;

  function clearClones() {
    track.querySelectorAll('[data-clone="true"]').forEach(function (el) {
      el.remove();
    });
  }

  function getItemWidth() {
    return originalItems[0].getBoundingClientRect().width + gap;
  }

  function getVisibleCount() {
    const count = Math.round((wrapper.clientWidth + gap) / getItemWidth());
    return count > 0 ? count : 1;
  }

  function buildClones(visibleCount) {
    clearClones();
    for (let i = 0; i < visibleCount; i++) {
      const clone = originalItems[i % total].cloneNode(true);
      clone.setAttribute("data-clone", "true");
      track.appendChild(clone);
    }
  }

  function moveTo(i, animate) {
    if (!animate) {
      track.style.transition = "none";
    }
    track.style.transform = "translateX(-" + i * getItemWidth() + "px)";
    if (!animate) {
      track.offsetHeight;
      track.style.transition = "";
    }
  }

  function next() {
    index++;
    moveTo(index, true);
  }

  track.addEventListener("transitionend", function (e) {
    if (e.propertyName !== "transform") return;
    if (index >= total) {
      index = 0;
      moveTo(index, false);
    }
  });

  function start() {
    stop();
    timer = setInterval(next, 3000);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function init() {
    index = 0;
    moveTo(0, false);
    buildClones(getVisibleCount());
    start();
  }

  window.addEventListener("resize", init);

  init();
});
// End Sec2