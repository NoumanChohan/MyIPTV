(function () {
  var page = (document.body && document.body.dataset && document.body.dataset.page) ? document.body.dataset.page : '';
  var navbar = document.getElementById('navbar');
  var menuToggle = document.getElementById('menuToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  var countdown = document.getElementById('countdown');
  var viewerCount = document.getElementById('viewerCount');
  var liveToast = document.getElementById('liveToast');
  var toastTitle = document.getElementById('toastTitle');
  var toastText = document.getElementById('toastText');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      var target = document.querySelector(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      if (mobileMenu && mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  window.addEventListener('scroll', function () {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 16);
    }
  }, { passive: true });

  if (countdown) {
    var remainingSeconds = 86399;
    var updateCountdown = function () {
      var hours = String(Math.floor(remainingSeconds / 3600)).padStart(2, '0');
      var minutes = String(Math.floor((remainingSeconds % 3600) / 60)).padStart(2, '0');
      var seconds = String(remainingSeconds % 60).padStart(2, '0');
      countdown.textContent = hours + ':' + minutes + ':' + seconds;
      remainingSeconds = remainingSeconds > 0 ? remainingSeconds - 1 : 86399;
    };
    updateCountdown();
    window.setInterval(updateCountdown, 1000);
  }

  if (viewerCount) {
    var updateViewerCount = function () {
      var base = 1200;
      var random = Math.floor(Math.random() * 140);
      viewerCount.textContent = (base + random).toLocaleString();
    };
    updateViewerCount();
    window.setInterval(updateViewerCount, 3500);
  }

  var revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add('in-view');
    });
  }

  var statElements = document.querySelectorAll('[data-count]');
  if (statElements.length && 'IntersectionObserver' in window) {
    var animateCount = function (element, target) {
      var duration = 1500;
      var startTime = null;
      var isDecimal = String(target).indexOf('.') !== -1;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = target * eased;
        element.textContent = isDecimal ? current.toFixed(1) : Math.floor(current).toLocaleString();
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          element.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString();
        }
      }

      window.requestAnimationFrame(step);
    };

    var statObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.dataset.animated === 'true') return;
        el.dataset.animated = 'true';
        animateCount(el, parseFloat(el.getAttribute('data-count')));
        observer.unobserve(el);
      });
    }, { threshold: 0.55 });

    statElements.forEach(function (el) {
      statObserver.observe(el);
    });
  }

  if (liveToast && toastTitle && toastText) {
    var notifications = [
      { name: 'Carlos de Sao Paulo', plan: 'plano IPTV de 6 meses' },
      { name: 'Ana do Rio', plan: 'teste gratis de IPTV' },
      { name: 'Marcos de Brasilia', plan: 'plano IPTV de 12 meses' },
      { name: 'Juliana de Curitiba', plan: 'plano IPTV de 3 meses' },
      { name: 'Rafael de Recife', plan: 'plano IPTV de 1 mes' },
      { name: 'Fernanda de Salvador', plan: 'plano IPTV de 12 meses' }
    ];

    var notificationIndex = 0;
    var showNotification = function () {
      var item = notifications[notificationIndex % notifications.length];
      toastTitle.textContent = item.name + ' acabou de assinar';
      toastText.textContent = 'Pedido do ' + item.plan + ' confirmado ha poucos segundos.';
      liveToast.classList.add('visible');
      window.setTimeout(function () {
        liveToast.classList.remove('visible');
      }, 3000);
      notificationIndex += 1;
    };

    window.setTimeout(showNotification, 1400);
    window.setInterval(showNotification, 4000);
  }

  var heroVideo = document.querySelector('.hero-section-video');
  if (heroVideo) {
    var tryPlayHeroVideo = function () {
      var playPromise = heroVideo.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () { /* autoplay can be blocked until interaction */ });
      }
    };
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.setAttribute('muted', '');
    heroVideo.setAttribute('playsinline', '');
    heroVideo.addEventListener('loadeddata', tryPlayHeroVideo);
    heroVideo.addEventListener('canplay', tryPlayHeroVideo);
    window.addEventListener('click', tryPlayHeroVideo, { once: true });
    window.addEventListener('touchstart', tryPlayHeroVideo, { once: true });
    tryPlayHeroVideo();
  }

  document.querySelectorAll('.faq-item').forEach(function (item, _index, list) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      list.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });
})();
