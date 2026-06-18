import { H as Hls } from './hls-dru42stk.js';

function qs(selector, scope = document) {
    return scope.querySelector(selector);
}

function qsa(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
}

export function initializeSite() {
    const toggle = qs('.menu-toggle');
    const panel = qs('.mobile-panel');

    if (toggle && panel) {
        toggle.addEventListener('click', () => {
            const open = panel.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(open));
            panel.setAttribute('aria-hidden', String(!open));
        });
    }

    initializeHero();
    initializeFilters();
}

function initializeHero() {
    const carousel = qs('[data-hero-carousel]');

    if (!carousel) {
        return;
    }

    const slides = qsa('.hero-slide', carousel);
    const dots = qsa('[data-hero-target]', carousel);
    let active = 0;
    let timer = null;

    const show = (index) => {
        active = (index + slides.length) % slides.length;
        slides.forEach((slide, itemIndex) => {
            slide.classList.toggle('is-active', itemIndex === active);
        });
        dots.forEach((dot, itemIndex) => {
            dot.classList.toggle('is-active', itemIndex === active);
        });
    };

    const play = () => {
        clearInterval(timer);
        timer = setInterval(() => show(active + 1), 5200);
    };

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            show(Number(dot.dataset.heroTarget || 0));
            play();
        });
    });

    if (slides.length > 1) {
        play();
    }
}

function initializeFilters() {
    qsa('[data-filter-panel]').forEach((panel) => {
        const list = panel.parentElement.querySelector('[data-filter-list]');

        if (!list) {
            return;
        }

        const input = qs('[data-filter-input]', panel);
        const year = qs('[data-filter-year]', panel);
        const type = qs('[data-filter-type]', panel);
        const cards = qsa('.movie-card', list);

        const apply = () => {
            const term = (input?.value || '').trim().toLowerCase();
            const yearValue = year?.value || '';
            const typeValue = type?.value || '';

            cards.forEach((card) => {
                const text = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre
                ].join(' ').toLowerCase();
                const yearOk = !yearValue || card.dataset.year === yearValue;
                const typeOk = !typeValue || (card.dataset.type || '').includes(typeValue);
                const termOk = !term || text.includes(term);
                card.hidden = !(yearOk && typeOk && termOk);
            });
        };

        [input, year, type].forEach((control) => {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    });
}

function resultCard(item) {
    const tags = Array.isArray(item.tags) ? item.tags.slice(0, 2).join(' / ') : item.genre;

    return `
<article class="movie-card" data-title="${escapeHtml(item.title)}">
    <a class="movie-card__cover" href="${item.url}" aria-label="${escapeHtml(item.title)}">
        <img src="${item.image}" alt="${escapeHtml(item.title)}" loading="lazy">
        <span class="movie-card__play">▶</span>
    </a>
    <div class="movie-card__body">
        <div class="movie-card__meta">
            <span>${escapeHtml(tags || item.genre)}</span>
            <span>${escapeHtml(item.rating)}</span>
        </div>
        <h3><a href="${item.url}">${escapeHtml(item.title)}</a></h3>
        <p>${escapeHtml(item.oneLine)}</p>
        <div class="movie-card__foot">
            <span>${escapeHtml(item.year)}</span>
            <span>${escapeHtml(item.region)}</span>
            <span>${escapeHtml(item.type)}</span>
        </div>
    </div>
</article>`;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function initializeSearchPage(searchData) {
    const form = qs('[data-global-search-form]');
    const input = qs('[data-global-search-input]');
    const category = qs('[data-global-category]');
    const type = qs('[data-global-type]');
    const results = qs('[data-search-results]');
    const count = qs('[data-search-count]');

    if (!form || !input || !results || !count) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';

    const render = () => {
        const term = input.value.trim().toLowerCase();
        const categoryValue = category?.value || '';
        const typeValue = type?.value || '';

        const matched = searchData.filter((item) => {
            const haystack = [
                item.title,
                item.year,
                item.region,
                item.type,
                item.genre,
                item.category,
                item.oneLine,
                ...(Array.isArray(item.tags) ? item.tags : [])
            ].join(' ').toLowerCase();
            const termOk = !term || haystack.includes(term);
            const categoryOk = !categoryValue || item.category === categoryValue;
            const typeOk = !typeValue || String(item.type).includes(typeValue);
            return termOk && categoryOk && typeOk;
        }).slice(0, 80);

        count.textContent = `找到 ${matched.length} 条相关内容`;
        results.innerHTML = matched.map(resultCard).join('');
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        render();
    });

    [input, category, type].forEach((control) => {
        if (control) {
            control.addEventListener('input', render);
            control.addEventListener('change', render);
        }
    });

    render();
}

export function initializePlayer(source) {
    const video = qs('#movie-player');
    const shell = qs('.player-shell');
    const cover = qs('.player-cover');

    if (!video || !shell || !cover || !source) {
        return;
    }

    let loaded = false;
    let hls = null;

    const attach = () => {
        if (loaded) {
            return;
        }

        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }

        shell.classList.add('is-ready');
    };

    const start = async () => {
        attach();
        try {
            await video.play();
            shell.classList.add('is-playing');
        } catch (error) {
            shell.classList.remove('is-playing');
        }
    };

    cover.addEventListener('click', start);

    video.addEventListener('click', () => {
        if (!loaded) {
            start();
        }
    });

    video.addEventListener('play', () => {
        shell.classList.add('is-playing');
    });

    video.addEventListener('pause', () => {
        shell.classList.remove('is-playing');
    });

    window.addEventListener('beforeunload', () => {
        if (hls) {
            hls.destroy();
        }
    });
}
