(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 360) {
        backTop.classList.add('show');
      } else {
        backTop.classList.remove('show');
      }
    });

    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function showSlide(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  var grid = document.querySelector('[data-filter-grid]');

  if (grid) {
    var search = document.querySelector('[data-filter-search]');
    var category = document.querySelector('[data-filter-category]');
    var year = document.querySelector('[data-filter-year]');
    var region = document.querySelector('[data-filter-region]');
    var type = document.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
    var emptyState = document.querySelector('[data-empty-state]');

    function getParam(name) {
      return new URLSearchParams(window.location.search).get(name) || '';
    }

    if (search && getParam('q')) {
      search.value = getParam('q');
    }

    function norm(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var q = norm(search && search.value);
      var c = category ? category.value : '';
      var y = year ? year.value : '';
      var r = region ? region.value : '';
      var t = type ? type.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = norm([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre')
        ].join(' '));
        var ok = true;

        if (q && haystack.indexOf(q) === -1) ok = false;
        if (c && card.getAttribute('data-category') !== c) ok = false;
        if (y && card.getAttribute('data-year') !== y) ok = false;
        if (r && card.getAttribute('data-region') !== r) ok = false;
        if (t && card.getAttribute('data-type') !== t) ok = false;

        card.style.display = ok ? '' : 'none';
        if (ok) visible += 1;
      });

      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    }

    [search, category, year, region, type].forEach(function (el) {
      if (el) {
        el.addEventListener('input', applyFilters);
        el.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();

function initMoviePlayer(source) {
  function setup() {
    var video = document.getElementById('videoPlayer');
    var layer = document.getElementById('playLayer');
    var button = document.getElementById('playButton');
    var ready = false;

    if (!video || !layer || !source) {
      return;
    }

    function prepare() {
      if (ready) {
        return;
      }
      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      prepare();
      layer.classList.add('is-hidden');
      video.controls = true;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    layer.addEventListener('click', play);

    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        play();
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      layer.classList.add('is-hidden');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
}
