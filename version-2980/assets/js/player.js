(function () {
  function initMoviePlayer(source, options) {
    var config = options || {};
    var video = document.getElementById(config.videoId || "movieVideo");
    var button = document.getElementById(config.buttonId || "moviePlayButton");
    var shell = document.getElementById(config.boxId || "moviePlayerBox");
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        });
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      if (button) {
        button.classList.add("hidden");
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (button) {
            button.classList.remove("hidden");
          }
        });
      }
    }

    attachSource();

    if (button) {
      button.addEventListener("click", playVideo);
    }

    if (shell) {
      shell.addEventListener("click", function (event) {
        if (event.target === video && video.paused) {
          playVideo();
        }
      });
    }

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (button && video.currentTime === 0) {
        button.classList.remove("hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
