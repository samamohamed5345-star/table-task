// ==========================================
// 1) Typewriter effect
// بيكتب كل كلمة حرف بحرف، يقف شوية، يمسحها، وبعدين يروح للكلمة اللي بعدها
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const words = ["Developer", "Designer", "Freelancer", "Photographer"];
  const typedTextEl = document.getElementById("typed-text");

  if (!typedTextEl) return; // أمان لو العنصر مش موجود

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const typingSpeed = 100;      // سرعة الكتابة (مللي ثانية لكل حرف)
  const deletingSpeed = 50;     // سرعة المسح (أسرع من الكتابة)
  const pauseAfterWord = 1000;  // وقفة بعد ما الكلمة تخلص كتابة
  const pauseBeforeNext = 300;  // وقفة قبل ما يبدأ الكلمة اللي بعدها

  function type() {
    const currentWord = words[wordIndex];

    if (isDeleting) {
      charIndex--;
    } else {
      charIndex++;
    }

    typedTextEl.textContent = currentWord.substring(0, charIndex);

    let delay = isDeleting ? deletingSpeed : typingSpeed;

    if (!isDeleting && charIndex === currentWord.length) {
      delay = pauseAfterWord;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delay = pauseBeforeNext;
    }

    setTimeout(type, delay);
  }

  type();
});


// ==========================================
// 2) Counter animation (عد الأرقام تصاعديًا)
// بيشتغل لما قسم الـ counter يظهر في الشاشة وقت السكرول
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const counterSection = document.getElementById("counter");
  const counters = document.querySelectorAll(".counter-number");

  if (!counterSection || counters.length === 0) return; // أمان

  let hasAnimated = false; // عشان الحركة تحصل مرة واحدة بس

  function animateCounter(el) {
    const target = +el.getAttribute("data-target"); // الرقم النهائي
    const duration = 1500; // مدة الحركة بالمللي ثانية (1.5 ثانية)
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1); // من 0 لـ 1
      const currentValue = Math.floor(progress * target);

      el.textContent = currentValue;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target; // نتأكد إن الرقم النهائي مظبوط بالظبط
      }
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          counters.forEach(animateCounter);
        }
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(counterSection);
});