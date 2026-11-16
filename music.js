(() => {
    const timeKey = "birthday-site-music-time";
    const playingKey = "birthday-site-music-playing";
    const songPath = "Tu Chahiye Bajrangi Bhaijaan 320 Kbps.mp3";

    let audio = document.getElementById("background-audio");
    if (!audio) {
        audio = document.createElement("audio");
        audio.id = "background-audio";
        const source = document.createElement("source");
        source.src = songPath;
        source.type = "audio/mpeg";
        audio.append(source);
        document.body.append(audio);
    }

    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.5;

    let toggle = document.getElementById("music-toggle");
    if (!toggle) {
        toggle = document.createElement("button");
        toggle.id = "music-toggle";
        toggle.type = "button";
        document.body.append(toggle);
    }

    toggle.classList.add("music-toggle");
    toggle.setAttribute("aria-label", "Start background music");

    if (!document.getElementById("shared-music-style")) {
        const style = document.createElement("style");
        style.id = "shared-music-style";
        style.textContent = `
            .music-toggle {
                position: fixed;
                right: 20px;
                bottom: 20px;
                z-index: 10;
                min-height: 44px;
                padding: 10px 18px;
                border: 1px solid rgba(69, 6, 25, 0.8);
                border-radius: 999px;
                background: linear-gradient(135deg, #74072d, #b92353, #e35486);
                box-shadow: 0 0 18px rgba(255, 104, 139, 0.35), 0 12px 24px rgba(137, 37, 69, 0.22);
                color: #fffafd;
                font: inherit;
                font-weight: 700;
                cursor: pointer;
                transition: transform 180ms ease, box-shadow 180ms ease;
            }

            .music-toggle:hover,
            .music-toggle:focus-visible {
                transform: translateY(-2px) scale(1.02);
                box-shadow: 0 0 22px rgba(255, 104, 139, 0.42), 0 14px 28px rgba(137, 37, 69, 0.26);
            }
        `;
        document.head.append(style);
    }

    const updateToggle = () => {
        const isPlaying = !audio.paused;
        toggle.textContent = isPlaying ? "⏸ Pause " : "▶ Start ";
        toggle.setAttribute(
            "aria-label",
            isPlaying ? "Pause  music" : "Start  music"
        );
    };

    const hideUnavailableMusic = () => {
        audio.pause();
        toggle.hidden = true;
    };

    audio.addEventListener("error", hideUnavailableMusic, { once: true });
    if (audio.error) {
        hideUnavailableMusic();
    }

    const rememberPlayback = () => {
        sessionStorage.setItem(timeKey, String(audio.currentTime));
        sessionStorage.setItem(playingKey, String(shouldPlay));
    };

    let shouldPlay = sessionStorage.getItem(playingKey) !== "false";
    let restored = false;
    const restorePlayback = () => {
        if (restored) {
            return;
        }
        restored = true;

        const savedTime = Number(sessionStorage.getItem(timeKey));
        if (Number.isFinite(savedTime) && savedTime > 0) {
            audio.currentTime = audio.duration > 0
                ? savedTime % audio.duration
                : savedTime;
        }

        if (shouldPlay) {
            audio.play().then(updateToggle).catch(updateToggle);
        } else {
            updateToggle();
        }
    };

    audio.addEventListener("loadedmetadata", restorePlayback, { once: true });
    audio.addEventListener("timeupdate", rememberPlayback);
    audio.addEventListener("play", updateToggle);
    audio.addEventListener("pause", updateToggle);
    window.addEventListener("pagehide", rememberPlayback);
    toggle.addEventListener("click", () => {
        if (audio.paused) {
            shouldPlay = true;
            sessionStorage.setItem(playingKey, "true");
            audio.play().then(updateToggle).catch(updateToggle);
        } else {
            shouldPlay = false;
            sessionStorage.setItem(playingKey, "false");
            audio.pause();
        }
    });

    if (audio.readyState >= 1) {
        restorePlayback();
    }
    updateToggle();
})();
