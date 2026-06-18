(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("open");
    });
  }

  var backTop = document.querySelector(".back-top");

  function updateBackTop() {
    if (!backTop) {
      return;
    }

    if (window.scrollY > 320) {
      backTop.classList.add("show");
    } else {
      backTop.classList.remove("show");
    }
  }

  if (backTop) {
    window.addEventListener("scroll", updateBackTop, { passive: true });
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    updateBackTop();
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function startHero() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startHero();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        startHero();
      });
    });

    showSlide(0);
    startHero();
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  var filterForms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));

  filterForms.forEach(function (form) {
    var scopeSelector = form.getAttribute("data-filter-form");
    var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
    var input = form.querySelector("[data-filter-input]");
    var sort = form.querySelector("[data-sort-select]");
    var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll(".movie-card")) : [];

    function applyFilter() {
      var query = normalizeText(input ? input.value : "");
      cards.forEach(function (card) {
        var haystack = normalizeText([
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year")
        ].join(" "));
        card.style.display = !query || haystack.indexOf(query) !== -1 ? "" : "none";
      });
    }

    function applySort() {
      if (!sort || !scope) {
        return;
      }

      var mode = sort.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === "year") {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        }

        if (mode === "views") {
          return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
        }

        if (mode === "title") {
          return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
        }

        return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
      });

      sorted.forEach(function (card) {
        scope.appendChild(card);
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      applyFilter();
    });

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    if (sort) {
      sort.addEventListener("change", function () {
        applySort();
        applyFilter();
      });
      applySort();
    }
  });
})();
