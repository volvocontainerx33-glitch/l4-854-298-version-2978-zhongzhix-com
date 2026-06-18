(function () {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
    });
  });

  const carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    let current = 0;
    let timer = null;

    const showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const start = function () {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    const restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restart();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    const buttons = Array.from(scope.querySelectorAll('[data-filter]'));
    const items = Array.from(scope.querySelectorAll('[data-filter-text]'));

    if (!buttons.length || !items.length) {
      return;
    }

    buttons[0].classList.add('is-active');

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        const filter = button.getAttribute('data-filter') || '全部';
        buttons.forEach(function (target) {
          target.classList.toggle('is-active', target === button);
        });
        items.forEach(function (item) {
          const source = item.getAttribute('data-filter-text') || '';
          const matched = filter === '全部' || source.indexOf(filter) !== -1;
          item.classList.toggle('is-hidden', !matched);
        });
      });
    });
  });

  const resultBox = document.querySelector('[data-search-results]');
  if (resultBox && Array.isArray(window.SEARCH_MOVIES)) {
    const params = new URLSearchParams(window.location.search);
    const keyword = (params.get('q') || '').trim();
    const title = document.querySelector('[data-search-title]');
    const subtitle = document.querySelector('[data-search-subtitle]');
    const normalizedKeyword = keyword.toLowerCase();
    const escapeHtml = function (value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };
    const buildCard = function (movie) {
      return [
        '<article class="movie-card">',
        '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="poster-shade"></span>',
        '<span class="type-badge">' + escapeHtml(movie.type) + '</span>',
        '<span class="year-badge">' + escapeHtml(movie.year) + '</span>',
        '<span class="play-bubble">▶</span>',
        '</a>',
        '<div class="card-body">',
        '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
        '<p>' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
        '<div class="tag-row"><span>' + escapeHtml(movie.category) + '</span></div>',
        '</div>',
        '</article>'
      ].join('');
    };

    if (!keyword) {
      if (title) {
        title.textContent = '片库搜索';
      }
      if (subtitle) {
        subtitle.textContent = '输入关键词浏览片库内容';
      }
      resultBox.innerHTML = window.SEARCH_MOVIES.slice(0, 60).map(buildCard).join('');
      return;
    }

    const matched = window.SEARCH_MOVIES.filter(function (movie) {
      return movie.searchText.toLowerCase().indexOf(normalizedKeyword) !== -1;
    }).slice(0, 120);

    if (title) {
      title.textContent = '“' + keyword + '” 的搜索结果';
    }
    if (subtitle) {
      subtitle.textContent = matched.length ? '已为你筛选相关剧集' : '没有找到完全匹配的内容';
    }
    resultBox.innerHTML = matched.length ? matched.map(buildCard).join('') : '<div class="story-card"><h2>换个关键词试试</h2><p>可以输入剧名、地区、年份、类型或标签继续查找。</p></div>';
  }
})();
