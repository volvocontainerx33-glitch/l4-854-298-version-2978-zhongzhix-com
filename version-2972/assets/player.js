(function () {
  const video = document.getElementById('moviePlayer');
  const cover = document.querySelector('[data-play-cover]');
  let attached = false;
  let hls = null;

  if (!video || typeof streamUrl !== 'string' || !streamUrl) {
    return;
  }

  const attachStream = function () {
    if (attached) {
      return;
    }
    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  };

  const startPlay = function () {
    attachStream();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    video.setAttribute('controls', 'controls');
    const playing = video.play();
    if (playing && typeof playing.catch === 'function') {
      playing.catch(function () {
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      });
    }
  };

  if (cover) {
    cover.addEventListener('click', startPlay);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlay();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
})();
