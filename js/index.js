// Start Sec2
document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.querySelector('#sec2 .slider-wrapper');
  const inner = document.querySelector('#sec2 .inner');
  if (!wrapper || !inner) return;
  const STEP_INTERVAL = 3000;
  const TRANSITION_DURATION = 600;
  let itemStep = 0;
  let isAnimating = false;
  function measure() {
    wrapper.style.width = '100%';
    wrapper.style.maxWidth = '100%';
    void wrapper.offsetWidth; 

    const gap = parseFloat(getComputedStyle(inner).gap) || 0;
    itemStep = inner.children[0].getBoundingClientRect().width + gap;
    const availableWidth = wrapper.clientWidth;
    const visibleCount = Math.max(1, Math.floor(availableWidth / itemStep));

    wrapper.style.width = (visibleCount * itemStep) + 'px';
  }

  function moveNext() {
    if (isAnimating) return;
    isAnimating = true;

    inner.style.transition = `transform ${TRANSITION_DURATION}ms ease`;
    inner.style.transform = `translateX(-${itemStep}px)`;
  }

  inner.addEventListener('transitionend', (e) => {
    if (e.target !== inner || e.propertyName !== 'transform') return;
    const firstItem = inner.children[0];
    inner.appendChild(firstItem);
    inner.style.transition = 'none';
    inner.style.transform = 'translateX(0)';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isAnimating = false;
      });
    });
  });

  measure();
  setInterval(moveNext, STEP_INTERVAL);
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      inner.style.transition = 'none';
      inner.style.transform = 'translateX(0)';
      measure();
    }, 200);
  });
});
// Start Sec3
window.onload = function() {
  let countdownDuration = 2 * 60 * 60 * 1000; 
  let endTime = new Date().getTime() + countdownDuration;

  const timerInterval = setInterval(function() {
    let now = new Date().getTime();
    let distance = endTime - now;

    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    document.getElementById("hours").innerHTML = hours;
    document.getElementById("minutes").innerHTML = minutes;
    document.getElementById("seconds").innerHTML = seconds;

    if (distance < 0) {
      clearInterval(timerInterval);
      document.getElementById("hours").innerHTML = "00";
      document.getElementById("minutes").innerHTML = "00";
      document.getElementById("seconds").innerHTML = "00";
    }
  }, 1000);
};
console.log('js')
// Sec4
function moveSlide(direction) {
  const track = document.getElementById('sliderTrack');
  const cards = track.querySelectorAll('.col-custom');
  if (cards.length === 0) return;

  const cardWidth = cards[0].getBoundingClientRect().width;
  const trackWidth = track.getBoundingClientRect().width;
  const movePercentage = (cardWidth / trackWidth) * 100;

  if (direction === 1) {
    track.style.transition = "transform 0.5s ease-in-out";
    track.style.transform = `translateX(-${movePercentage}%)`;
    setTimeout(() => {
      track.style.transition = "none";
      track.appendChild(cards[0]);
      track.style.transform = "translateX(0)";
    }, 500);
  } 
  else if (direction === -1) {
    track.style.transition = "none";
    track.insertBefore(cards[cards.length - 1], cards[0]);
    track.style.transform = `translateX(-${movePercentage}%)`;
    setTimeout(() => {
      track.style.transition = "transform 0.5s ease-in-out";
      track.style.transform = "translateX(0)";
    }, 20);
  }
}
// Sec6
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
// Sec7
document.addEventListener('DOMContentLoaded', () => {
  const imageFrame = document.getElementById('imageFrame');
  const mainImage = document.getElementById('mainImage');
  const thumbs = Array.from(document.querySelectorAll('.thumb'));
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const images = thumbs.map(t => t.dataset.img);
  let currentIndex = images.indexOf(thumbs.find(t => t.classList.contains('active')).dataset.img);
  if (currentIndex < 0) currentIndex = 0;

  const AUTO_SLIDE_DELAY = 3500;
  let autoSlideTimer = null;

  function goTo(index, { restartAuto = true } = {}) {
    const total = images.length;
    currentIndex = ((index % total) + total) % total;
    imageFrame.classList.add('swap');
    setTimeout(() => {
      mainImage.src = images[currentIndex];
      imageFrame.classList.remove('swap');
    }, 180);
    thumbs.forEach((t, i) => t.classList.toggle('active', i === currentIndex));

    if (restartAuto) restartAutoSlide();
  }

  function next() { goTo(currentIndex + 1); }
  function prev() { goTo(currentIndex - 1); }

  function startAutoSlide() {
    autoSlideTimer = setInterval(() => {
      goTo(currentIndex + 1, { restartAuto: false });
    }, AUTO_SLIDE_DELAY);
  }

  function restartAutoSlide() {
    clearInterval(autoSlideTimer);
    startAutoSlide();
  }
  nextBtn.addEventListener('click', () => next());
  prevBtn.addEventListener('click', () => prev());
  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => goTo(i));
  });
  startAutoSlide();
});
// Sec8
document.addEventListener('DOMContentLoaded', function() {
    
    let currentIndex = 0;
    const track = document.querySelector('.slider-track');
    const prevBtn = document.querySelector('.prev-arrow');
    const nextBtn = document.querySelector('.next-arrow');
    
    if (track && prevBtn && nextBtn) {
        const isRTL = window.getComputedStyle(track).direction === 'rtl';

        function moveSlider(direction) {
            const items = document.querySelectorAll('.slider-item');
            const totalItems = items.length;
            
            let visibleItems = 3;
            if (window.innerWidth < 768) {
                visibleItems = 1;
            } else if (window.innerWidth < 1200) {
                visibleItems = 2;
            }

            const maxIndex = totalItems - visibleItems;
            currentIndex += direction;
            if (currentIndex > maxIndex) {
                currentIndex = 0;
            } else if (currentIndex < 0) {
                currentIndex = maxIndex;
            }

            const itemWidth = items[0].getBoundingClientRect().width;
            const amountToMove = itemWidth * currentIndex;
            if (isRTL) {
                track.style.transform = `translateX(${amountToMove}px)`;
            } else {
                track.style.transform = `translateX(-${amountToMove}px)`;
            }
        }
        nextBtn.addEventListener('click', function() {
            moveSlider(isRTL ? -1 : 1);
        });

        prevBtn.addEventListener('click', function() {
            moveSlider(isRTL ? 1 : -1);
        });
        window.addEventListener('resize', function() {
            track.style.transform = `translateX(0px)`;
            currentIndex = 0;
        });
    }
});
// End Home


document.addEventListener('DOMContentLoaded', function () {

  var genderButtons = document.querySelectorAll('.gender-toggle__btn');
  var productCards = document.querySelectorAll('.product-card');
  var categoryTitle = document.getElementById('categoryTitle');
  var breadcrumbFashion = document.getElementById('breadcrumbFashion');
  var breadcrumbGenderWrap = document.getElementById('breadcrumbGenderWrap');
  var breadcrumbGender = document.getElementById('breadcrumbGender');
  var resultCount = document.getElementById('resultCount');
  var pillGroups = document.querySelectorAll('.category-header__pills');

  function applyGenderFilter(gender) {
    // Update toggle button active state
    genderButtons.forEach(function (btn) {
      btn.classList.toggle('gender-toggle__btn--active', btn.dataset.gender === gender);
    });

    // Title
    categoryTitle.textContent = gender.charAt(0).toUpperCase() + gender.slice(1);

    // Breadcrumb: Home > Shop > Fashion > Men/Women
    breadcrumbGenderWrap.classList.remove('d-none');
    breadcrumbGender.textContent = categoryTitle.textContent;

    // Subcategory pills: show only the matching set
    pillGroups.forEach(function (group) {
      group.classList.toggle('d-none', group.dataset.pillsFor !== gender);
    });

    // Filter products: only the matching gender is shown, never both
    var visibleCount = 0;
    productCards.forEach(function (card) {
      var matches = card.dataset.gender === gender;
      card.style.display = matches ? '' : 'none';
      if (matches) visibleCount++;
    });

    if (resultCount) {
      resultCount.textContent = 'Showing all ' + visibleCount + ' results';
    }
  }

  genderButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyGenderFilter(btn.dataset.gender);
    });
  });

  document.querySelectorAll('.category-header__pills').forEach(function (group) {
    var pills = group.querySelectorAll('.category-pill');
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        pills.forEach(function (p) { p.classList.remove('category-pill--active'); });
        pill.classList.add('category-pill--active');
      });
    });
  });

  var showButtons = document.querySelectorAll('.shop-toolbar__show-btn');
  showButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      showButtons.forEach(function (b) { b.classList.remove('shop-toolbar__show-btn--active'); });
      btn.classList.add('shop-toolbar__show-btn--active');
    });
  });

  var viewButtons = document.querySelectorAll('.shop-toolbar__view-btn');
  var productGrid = document.getElementById('productGrid');

  viewButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      viewButtons.forEach(function (b) { b.classList.remove('shop-toolbar__view-btn--active'); });
      btn.classList.add('shop-toolbar__view-btn--active');

      var isListView = btn.querySelector('.bi-list-ul') !== null;
      if (productGrid) {
        productGrid.classList.toggle('product-grid--list', isListView);
      }
    });
  });

  function bindBadgeCounter(selector) {
    var link = document.querySelector(selector);
    if (!link) return;
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var badge = link.querySelector('.site-header__badge');
      if (!badge) return;
      badge.textContent = (parseInt(badge.textContent, 10) || 0) + 1;
    });
  }
  bindBadgeCounter('a[href="wishlist.html"]');
  bindBadgeCounter('a[href="cart.html"]');

  /* Product card wishlist / cart action buttons also bump the header badges */
  document.querySelectorAll('.product-card__action-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var isWishlist = btn.querySelector('.bi-heart') !== null;
      var isCart = btn.querySelector('.bi-cart') !== null;
      var targetSelector = isWishlist ? 'a[href="wishlist.html"] .site-header__badge'
                          : isCart ? 'a[href="cart.html"] .site-header__badge'
                          : null;
      if (!targetSelector) return;
      var badge = document.querySelector(targetSelector);
      if (badge) badge.textContent = (parseInt(badge.textContent, 10) || 0) + 1;
    });
  });

  var backToTopBtn = document.querySelector('.back-to-top');
  var SCROLL_SHOW_THRESHOLD = 400;

  function updateBackToTopVisibility() {
    if (!backToTopBtn) return;
    var scrolled = window.scrollY || document.documentElement.scrollTop;
    backToTopBtn.classList.toggle('back-to-top--visible', scrolled > SCROLL_SHOW_THRESHOLD);
  }

  window.addEventListener('scroll', updateBackToTopVisibility, { passive: true });
  updateBackToTopVisibility();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var filterBtn = document.querySelector('.btn-filter');
  if (filterBtn) {
    filterBtn.addEventListener('click', function () {
      var minInput = document.querySelector('.filter-price-inputs__field[placeholder="Min"]');
      var maxInput = document.querySelector('.filter-price-inputs__field[placeholder="Max"]');
      var min = minInput && minInput.value ? minInput.value : '0';
      var max = maxInput && maxInput.value ? maxInput.value : '∞';
      console.log('Filtering products by price range: $' + min + ' - $' + max);
    });
  }

  document.querySelectorAll('.filter-brand-search input').forEach(function (input) {
    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      var scope = input.closest('.filter-block');
      var brandItems = scope ? scope.querySelectorAll('.filter-list--scroll li') : [];
      brandItems.forEach(function (item) {
        var label = item.querySelector('label');
        var text = label ? label.textContent.trim().toLowerCase() : '';
        item.style.display = text.indexOf(query) !== -1 ? '' : 'none';
      });
    });
  });

  var productsNavItem = document.getElementById('productsNavItem');
  var productsBackdrop = document.getElementById('productsBackdrop');

  if (productsNavItem && productsBackdrop) {
    productsNavItem.addEventListener('mouseenter', function () {
      productsBackdrop.classList.add('products-backdrop--visible');
    });
    productsNavItem.addEventListener('mouseleave', function () {
      productsBackdrop.classList.remove('products-backdrop--visible');
    });
  }

  var filtersOffcanvasBody = document.getElementById('filtersOffcanvasBody');
  var desktopSidebar = document.getElementById('shopSidebar');

  if (filtersOffcanvasBody && desktopSidebar && filtersOffcanvasBody.childElementCount === 0) {
    filtersOffcanvasBody.appendChild(desktopSidebar.cloneNode(true));
    filtersOffcanvasBody.firstElementChild.classList.remove('d-none', 'd-lg-block');
    filtersOffcanvasBody.firstElementChild.removeAttribute('id');
  }

  var mainImage = document.getElementById('productMainImage');
  var galleryThumbs = document.querySelectorAll('.product-gallery__thumb');

  galleryThumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      galleryThumbs.forEach(function (t) { t.classList.remove('product-gallery__thumb--active'); });
      thumb.classList.add('product-gallery__thumb--active');
      if (mainImage) {
        mainImage.src = thumb.dataset.image;
        mainImage.alt = thumb.dataset.alt || mainImage.alt;
      }
    });
  });

  var zoomWrap = document.getElementById('productZoomWrap');
  if (zoomWrap && mainImage) {
    zoomWrap.addEventListener('mousemove', function (e) {
      var rect = zoomWrap.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      mainImage.style.transformOrigin = x + '% ' + y + '%';
      mainImage.style.transform = 'scale(2)';
    });
    zoomWrap.addEventListener('mouseleave', function () {
      mainImage.style.transform = 'scale(1)';
      mainImage.style.transformOrigin = 'center center';
    });
  }

  document.querySelectorAll('.qty-stepper').forEach(function (stepper) {
    var input = stepper.querySelector('.qty-stepper__input');
    var decreaseBtn = stepper.querySelector('[data-action="decrease"]');
    var increaseBtn = stepper.querySelector('[data-action="increase"]');
    if (decreaseBtn) {
      decreaseBtn.addEventListener('click', function () {
        input.value = Math.max(1, (parseInt(input.value, 10) || 1) - 1);
      });
    }
    if (increaseBtn) {
      increaseBtn.addEventListener('click', function () {
        input.value = (parseInt(input.value, 10) || 1) + 1;
      });
    }
  });

  var colorSwatches = document.querySelectorAll('.color-swatch');
  colorSwatches.forEach(function (swatch) {
    swatch.addEventListener('click', function () {
      colorSwatches.forEach(function (s) { s.classList.remove('color-swatch--active'); });
      swatch.classList.add('color-swatch--active');
    });
  });

  var tabLinks = document.querySelectorAll('.product-tabs__link');
  var tabPanels = document.querySelectorAll('.product-tabs__panel');
  tabLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      tabLinks.forEach(function (l) { l.classList.remove('product-tabs__link--active'); });
      tabPanels.forEach(function (p) { p.classList.remove('product-tabs__panel--active'); });
      link.classList.add('product-tabs__link--active');
      var panel = document.getElementById('tab-' + link.dataset.tab);
      if (panel) panel.classList.add('product-tabs__panel--active');
    });
  });

});