(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var tabs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-tab]"));
      var index = 0;
      var timer = null;

      function show(next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        tabs.forEach(function (tab, i) {
          tab.classList.toggle("active", i === index);
        });
      }

      function start() {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          window.clearInterval(timer);
          show(Number(tab.getAttribute("data-hero-tab")) || 0);
          start();
        });
      });

      show(0);
      start();
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var year = scope.querySelector("[data-year-filter]");
      var empty = scope.querySelector("[data-empty-state]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search-card]"));

      if (input && input.hasAttribute("data-url-query")) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
          input.value = q;
        }
      }

      function filter() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year")
          ].join(" ").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchYear = !selectedYear || cardYear === selectedYear;
          var pass = matchKeyword && matchYear;
          card.style.display = pass ? "" : "none";
          if (pass) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", filter);
      }
      if (year) {
        year.addEventListener("change", filter);
      }
      filter();
    });

    var player = document.querySelector("[data-player]");
    if (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var stream = player.getAttribute("data-stream");
      var attached = false;
      var hls = null;

      function attach() {
        if (attached || !video || !stream) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        attach();
        player.classList.add("is-playing");
        video.setAttribute("controls", "controls");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!attached) {
            play();
          }
        });
      }
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    }
  });
})();
