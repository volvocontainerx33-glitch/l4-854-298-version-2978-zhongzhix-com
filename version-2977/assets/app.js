(function () {
  var hlsUrl = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
  var hlsPromise = null;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsPromise) {
      return hlsPromise;
    }

    hlsPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = hlsUrl;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error("hls-load-error"));
      };
      document.head.appendChild(script);
    });

    return hlsPromise;
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));

    forms.forEach(function (form) {
      var section = form.closest("section") || document;
      var list = section.querySelector("[data-card-list]") || document.querySelector("[data-card-list]");
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll(".movie-card")) : [];
      var keyword = form.querySelector("[data-filter-keyword]");
      var region = form.querySelector("[data-filter-region]");
      var type = form.querySelector("[data-filter-type]");
      var year = form.querySelector("[data-filter-year]");
      var empty = document.createElement("div");

      if (!cards.length) {
        return;
      }

      empty.className = "no-results";
      empty.textContent = "没有找到匹配的影片";
      list.appendChild(empty);

      if (keyword) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");

        if (q) {
          keyword.value = q;
        }
      }

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function apply() {
        var q = normalize(keyword && keyword.value);
        var reg = normalize(region && region.value);
        var typ = normalize(type && type.value);
        var yr = normalize(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-tags"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var matched = true;

          if (q && haystack.indexOf(q) === -1) {
            matched = false;
          }

          if (reg && cardRegion !== reg) {
            matched = false;
          }

          if (typ && cardType !== typ) {
            matched = false;
          }

          if (yr && cardYear !== yr) {
            matched = false;
          }

          card.style.display = matched ? "" : "none";

          if (matched) {
            visible += 1;
          }
        });

        empty.style.display = visible ? "none" : "block";
      }

      [keyword, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  function initVideoPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".video-shell"));

    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var source = shell.getAttribute("data-source");
      var playButtons = Array.prototype.slice.call(shell.querySelectorAll("[data-play]"));
      var muteButton = shell.querySelector("[data-muted]");
      var fullscreenButton = shell.querySelector("[data-fullscreen]");
      var message = shell.querySelector("[data-video-message]");
      var initialized = false;
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function showMessage(text) {
        if (!message) {
          return;
        }

        message.textContent = text;
        message.classList.add("is-visible");
      }

      function prepare() {
        if (initialized) {
          return Promise.resolve();
        }

        initialized = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          return Promise.resolve();
        }

        return loadHls().then(function (Hls) {
          if (!Hls || !Hls.isSupported()) {
            throw new Error("hls-not-supported");
          }

          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);

          hlsInstance.on(Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              showMessage("视频加载失败，请稍后重试");
            }
          });
        }).catch(function () {
          showMessage("当前环境无法播放该视频源");
        });
      }

      function togglePlay() {
        prepare().then(function () {
          if (video.paused) {
            video.play().then(function () {
              shell.classList.add("is-playing");
            }).catch(function () {
              showMessage("播放启动失败，请再次点击播放");
            });
          } else {
            video.pause();
            shell.classList.remove("is-playing");
          }
        });
      }

      playButtons.forEach(function (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          togglePlay();
        });
      });

      video.addEventListener("click", togglePlay);
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        shell.classList.remove("is-playing");
      });

      if (muteButton) {
        muteButton.addEventListener("click", function () {
          video.muted = !video.muted;
          muteButton.textContent = video.muted ? "取消静音" : "静音";
        });
      }

      if (fullscreenButton) {
        fullscreenButton.addEventListener("click", function () {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (shell.requestFullscreen) {
            shell.requestFullscreen();
          }
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initVideoPlayers();
  });
})();
