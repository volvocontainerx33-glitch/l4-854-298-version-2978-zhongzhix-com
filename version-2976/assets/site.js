(function () {
  const toggle = document.querySelector('[data-role="menu-toggle"]');
  const mobileNav = document.querySelector('[data-role="mobile-nav"]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-role="hero"]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const next = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(next);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  document.querySelectorAll('.movie-search-scope').forEach(function (scope) {
    const input = scope.querySelector('[data-role="search-input"]');
    const region = scope.querySelector('[data-role="region-filter"]');
    const year = scope.querySelector('[data-role="year-filter"]');
    const chips = Array.from(scope.querySelectorAll('[data-filter-genre]'));
    const cards = Array.from(scope.querySelectorAll('[data-role="movie-list"] > *'));
    let genre = '';

    function textOf(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
    }

    function apply() {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      const regionValue = region ? region.value : '';
      const yearValue = year ? year.value : '';

      cards.forEach(function (card) {
        const text = textOf(card);
        const okKeyword = !keyword || text.includes(keyword);
        const okRegion = !regionValue || card.getAttribute('data-region') === regionValue;
        const okYear = !yearValue || card.getAttribute('data-year') === yearValue;
        const okGenre = !genre || text.includes(genre.toLowerCase());
        card.classList.toggle('hidden-by-filter', !(okKeyword && okRegion && okYear && okGenre));
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (region) {
      region.addEventListener('change', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        genre = chip.getAttribute('data-filter-genre') || '';
        apply();
      });
    });
  });
})();
