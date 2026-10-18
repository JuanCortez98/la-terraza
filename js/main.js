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

  const menuImages = document.querySelectorAll('.menu-showcase img');
  if (menuImages.length && typeof HTMLDialogElement !== 'undefined') {
    const imageDialog = document.createElement('dialog');
    imageDialog.className = 'menu-image-dialog';
    imageDialog.setAttribute('aria-label', 'Imagen ampliada del menú');
    imageDialog.innerHTML = '<button type="button" aria-label="Cerrar imagen ampliada">×</button><img alt="">';
    document.body.append(imageDialog);
    const expandedImage = imageDialog.querySelector('img');
    imageDialog.querySelector('button').addEventListener('click', () => imageDialog.close());
    imageDialog.addEventListener('click', event => {
      if (event.target === imageDialog) imageDialog.close();
    });
    menuImages.forEach(image => {
      image.tabIndex = 0;
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', `Ampliar: ${image.alt}`);
      const openImage = () => {
        expandedImage.src = image.currentSrc || image.src;
        expandedImage.alt = image.alt;
        imageDialog.showModal();
      };
      image.addEventListener('click', openImage);
      image.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        openImage();
      });
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

  // Branded placeholders keep the layout intact until the restaurant media is added.
  const escapeXml = (value) => value.replace(/[<>&"']/g, character => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;'
  }[character]));

  document.querySelectorAll('img').forEach(image => {
    image.addEventListener('error', () => {
      if (image.dataset.placeholderApplied) return;
      image.dataset.placeholderApplied = 'true';
      if (image.classList.contains('brand-mark')) {
        image.style.visibility = 'hidden';
        return;
      }
      const label = escapeXml((image.alt || 'Fotografía pendiente').slice(0, 72));
      const artwork = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d8c79f"/><stop offset="1" stop-color="#82927b"/></linearGradient></defs><rect width="1600" height="900" fill="url(#g)"/><circle cx="1320" cy="180" r="160" fill="#f5efdf" fill-opacity=".45"/><path d="M0 700 500 420l310 210 330-300 460 370v200H0z" fill="#234b38" fill-opacity=".28"/><text x="800" y="760" text-anchor="middle" font-family="Arial,sans-serif" font-size="34" fill="#183a2b">${label}</text></svg>`;
      image.classList.add('image-placeholder');
      image.alt = `${image.alt || 'Fotografía'} · pendiente de incorporar`;
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(artwork)}`;
    }, { once: true });
  });

  document.querySelectorAll('video').forEach(video => {
    const showVideoPlaceholder = () => {
      const holder = video.parentElement;
      if (!holder || holder.querySelector('.video-pending-message')) return;
      holder.classList.add('video-pending-holder');
      const message = document.createElement('span');
      message.className = 'video-pending-message';
      message.textContent = 'Espacio reservado para el vídeo';
      holder.append(message);
    };
    video.addEventListener('error', showVideoPlaceholder);
    video.querySelectorAll('source').forEach(source => source.addEventListener('error', showVideoPlaceholder));
    video.addEventListener('loadeddata', () => holder.querySelector('.video-pending-message')?.remove());
    const holder = video.parentElement;
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

  // Preload internal pages so navigation feels instant.
  const pageLinks = Array.from(new Set(
    Array.from(document.querySelectorAll('a[href]'))
      .map(link => new URL(link.getAttribute('href'), location.href))
      .filter(url => url.origin === location.origin && url.pathname.endsWith('.html') && url.pathname !== location.pathname)
      .map(url => url.pathname)
  ));

  if (HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) {
    const rules = document.createElement('script');
    rules.type = 'speculationrules';
    rules.textContent = JSON.stringify({ prerender: [{ source: 'list', urls: pageLinks, eagerness: 'moderate' }] });
    document.head.appendChild(rules);
  } else {
    const prefetched = new Set();
    const prefetch = (pathname) => {
      if (prefetched.has(pathname)) return;
      prefetched.add(pathname);
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = pathname;
      document.head.appendChild(link);
    };
    const warmUp = () => pageLinks.forEach(prefetch);
    if ('requestIdleCallback' in window) requestIdleCallback(warmUp, { timeout: 3000 });
    else setTimeout(warmUp, 2000);
    document.addEventListener('touchstart', event => {
      const link = event.target.closest && event.target.closest('a[href]');
      if (link) prefetch(new URL(link.getAttribute('href'), location.href).pathname);
    }, { passive: true });
  }
});
