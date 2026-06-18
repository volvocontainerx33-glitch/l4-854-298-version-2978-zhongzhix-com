(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function one(selector, root) {
        return (root || document).querySelector(selector);
    }

    function initMenu() {
        var button = one('.nav-toggle');
        var panel = one('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!expanded));
            panel.hidden = expanded;
        });
    }

    function initHero() {
        var slides = all('[data-hero-slide]');
        var dots = all('[data-hero-dot]');
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function restart(index) {
            window.clearInterval(timer);
            show(index);
            start();
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                restart(index);
            });
        });

        start();
    }

    function initPlayers() {
        all('[data-player]').forEach(function (player) {
            var video = one('video', player);
            var overlay = one('.player-overlay', player);
            var stream = player.getAttribute('data-stream');
            var loaded = false;
            var hls = null;

            if (!video || !stream) {
                return;
            }

            function load() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    return;
                }
                video.src = stream;
            }

            function play() {
                load();
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener('click', play);
            }

            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            });

            video.addEventListener('play', function () {
                player.classList.add('playing');
            });

            video.addEventListener('pause', function () {
                player.classList.remove('playing');
            });

            window.addEventListener('pagehide', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    function initFilters() {
        var panel = one('[data-filter-panel]');
        var list = one('[data-filter-list]');
        if (!panel || !list) {
            return;
        }

        var queryInput = one('[data-filter-query]', panel);
        var regionSelect = one('[data-filter-region]', panel);
        var yearSelect = one('[data-filter-year]', panel);
        var typeSelect = one('[data-filter-type]', panel);
        var cards = all('.filter-card', list);
        var empty = one('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var preset = params.get('q') || '';

        if (preset && queryInput) {
            queryInput.value = preset;
        }

        function value(control) {
            return control ? control.value.trim().toLowerCase() : '';
        }

        function apply() {
            var q = value(queryInput);
            var region = value(regionSelect);
            var year = value(yearSelect);
            var type = value(typeSelect);
            var visible = 0;

            cards.forEach(function (card) {
                var search = card.getAttribute('data-search') || '';
                var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
                var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
                var cardType = (card.getAttribute('data-type') || '').toLowerCase();
                var ok = (!q || search.indexOf(q) !== -1) &&
                    (!region || cardRegion === region) &&
                    (!year || cardYear === year) &&
                    (!type || cardType === type);
                card.classList.toggle('hidden-by-filter', !ok);
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [queryInput, regionSelect, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        apply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initPlayers();
        initFilters();
    });
})();
