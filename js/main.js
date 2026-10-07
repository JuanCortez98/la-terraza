document.addEventListener('DOMContentLoaded', () => {
  // Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Header scroll
  const header = document.getElementById('header');
  if (header) {
    const onScroll = () => {
      if (header.classList.contains('solid')) return;
      header.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
  }

  // Mobile nav
  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobileNav');
  const closeNav = document.getElementById('closeNav');
  if (burger && mobileNav) {
    burger.addEventListener('click', () => mobileNav.classList.add('open'));
    if (closeNav) closeNav.addEventListener('click', () => mobileNav.classList.remove('open'));
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => mobileNav.classList.remove('open'));
    });
  }

  // Menu tabs
  document.querySelectorAll('.menu-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('.menu-tab').forEach(item => {
        const isActive = item === tab;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });
      document.querySelectorAll('.menu-panel').forEach(panel => {
        panel.classList.toggle('active', panel.dataset.category === target);
      });
    });
  });

  document.querySelectorAll('.gallery-category').forEach(category => {
    const carousel = category.querySelector('.gallery-grid');
    const items = Array.from(carousel.querySelectorAll('.gallery-item'));
    const previousButton = category.querySelector('[data-gallery-direction="-1"]');
    const nextButton = category.querySelector('[data-gallery-direction="1"]');
    const position = category.querySelector('.gallery-position');

    const updateControls = () => {
      const carouselLeft = carousel.getBoundingClientRect().left;
      const currentIndex = items.reduce((closestIndex, item, index) => {
        const closestDistance = Math.abs(items[closestIndex].getBoundingClientRect().left - carouselLeft);
        const itemDistance = Math.abs(item.getBoundingClientRect().left - carouselLeft);
        return itemDistance < closestDistance ? index : closestIndex;
      }, 0);

      position.textContent = `${currentIndex + 1} / ${items.length}`;
      previousButton.disabled = carousel.scrollLeft <= 1;
      nextButton.disabled = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 1;
    };

    previousButton.addEventListener('click', () => {
      const itemWidth = items[0].getBoundingClientRect().width;
      carousel.scrollBy({ left: -(itemWidth + parseFloat(getComputedStyle(carousel).gap)), behavior: 'smooth' });
    });
    nextButton.addEventListener('click', () => {
      const itemWidth = items[0].getBoundingClientRect().width;
      carousel.scrollBy({ left: itemWidth + parseFloat(getComputedStyle(carousel).gap), behavior: 'smooth' });
    });
    carousel.addEventListener('scroll', updateControls, { passive: true });
    window.addEventListener('resize', updateControls);
    updateControls();
  });

  // Reveal sections as they enter the viewport.
  const revealItems = document.querySelectorAll('section:not(.hero), .footer');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealItems.forEach(item => {
    item.classList.add('reveal');
    revealObserver.observe(item);
  });
});
