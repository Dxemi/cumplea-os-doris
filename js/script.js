(() => {
  "use strict";
  const data = window.DORIS_CONTENT || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const scenes = $$(".scene");
  let currentScene = 0;

  function setText(selector, value) {
    const el = $(selector);
    if (el && typeof value === "string") el.textContent = value;
  }

  function applyContent() {
    setText("#cover-name", data.name || "Doris");
    setText(".cover-content .eyebrow", `${data.birthday || "14 DE NOVIEMBRE"}  ✦  UN DÍA PARA CELEBRARTE`);
    setText(".cover-kicker", data.cover?.kicker || "");
    setText("#cover-message", data.cover?.message || "");
    setText("#memories-intro", data.memories?.intro || "");
    setText("#her-intro", data.her?.intro || "");
    setText("#admiration-text", data.her?.admiration || "");
    setText("#love-text", data.her?.love || "");
    setText("#her-quote", data.her?.quote || "");
    setText("#letter-greeting", data.letter?.greeting || "");
    setText("#letter-body", data.letter?.body || "");
    setText("#letter-signoff", data.letter?.signoff || "");
    setText("#final-title", data.final?.title || "");
    setText("#final-message", data.final?.message || "");
    setText("#final-signature", data.final?.signature || "");
    renderMemories();
  }

  function renderMemories() {
    const gallery = $("#memory-gallery");
    if (!gallery) return;
    const items = data.memories?.items || [];
    gallery.innerHTML = "";
    items.forEach((item, index) => {
      const card = document.createElement("figure");
      card.className = `memory-card ${item.size === "large" ? "memory-card--large" : ""}`;
      const frame = document.createElement("div");
      frame.className = "memory-image";
      const placeholder = document.createElement("div");
      placeholder.className = "memory-placeholder";
      const label = document.createElement("b");
      label.textContent = "Un recuerdo nuestro";
      const sub = document.createElement("small");
      sub.textContent = "AÑADE TU FOTOGRAFÍA";
      placeholder.append(label, sub);
      frame.appendChild(placeholder);
      if (item.image) {
        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.title || `Recuerdo ${index + 1}`;
        img.loading = "lazy";
        img.addEventListener("load", () => placeholder.remove());
        img.addEventListener("error", () => { img.remove(); });
        frame.appendChild(img);
      }
      const caption = document.createElement("figcaption");
      caption.className = "memory-caption";
      const date = document.createElement("span");
      date.textContent = item.date || "";
      const title = document.createElement("h3");
      title.textContent = item.title || "";
      const text = document.createElement("p");
      text.textContent = item.text || "";
      caption.append(date, title, text);
      card.append(frame, caption);
      gallery.appendChild(card);
    });
  }

  function goTo(index) {
    const next = Math.max(0, Math.min(scenes.length - 1, index));
    if (next === currentScene) return;
    scenes[currentScene].classList.remove("is-active");
    currentScene = next;
    scenes[currentScene].classList.add("is-active");
    scenes[currentScene].scrollTop = 0;
    $("#global-progress-fill").style.width = `${((currentScene + 1) / scenes.length) * 100}%`;
    if (currentScene === 2) renderPlaylist(activePlaylist);
  }

  $$("[data-next]").forEach(button => button.addEventListener("click", () => goTo(currentScene + 1)));
  $$("[data-prev]").forEach(button => button.addEventListener("click", () => goTo(currentScene - 1)));
  $("#restart")?.addEventListener("click", () => goTo(0));

  // Audio player: tracks are loaded from the editable content.js file.
  const audio = $("#audio-player");
  let activePlaylist = "good";
  let activeTrackIndex = -1;
  let currentTracks = [];

  const formatTime = seconds => {
    if (!Number.isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  function renderPlaylist(key) {
    activePlaylist = key;
    currentTracks = data.music?.[key] || [];
    activeTrackIndex = -1;
    $("#playlist-label").textContent = key === "good" ? "PLAYLIST 01 · LUZ" : "PLAYLIST 02 · REFUGIO";
    $("#track-title").textContent = currentTracks.length ? "Elige una canción" : "Tu música espera aquí";
    $("#track-artist").textContent = currentTracks.length ? "Selecciona una canción de la lista" : "Añade tus archivos MP3 en js/contenido.js";
    $("#track-list").innerHTML = "";
    currentTracks.forEach((track, index) => {
      const button = document.createElement("button");
      button.className = "track-item";
      button.type = "button";
      const number = document.createElement("span");
      number.className = "track-index";
      number.textContent = String(index + 1).padStart(2, "0");
      const details = document.createElement("span");
      const title = document.createElement("strong");
      title.textContent = track.title || `Canción ${index + 1}`;
      const artist = document.createElement("small");
      artist.textContent = track.artist || "Artista";
      details.append(title, artist);
      button.append(number, details);
      button.addEventListener("click", () => loadTrack(index, true));
      $("#track-list").appendChild(button);
    });
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    $("#play-track").textContent = "▶";
    $("#progress").value = 0;
    $("#current-time").textContent = "0:00";
    $("#duration").textContent = "0:00";
  }

  function loadTrack(index, autoplay = false) {
    if (!currentTracks.length || !currentTracks[index]) return;
    activeTrackIndex = index;
    const track = currentTracks[index];
    audio.src = track.file;
    audio.load();
    $("#track-title").textContent = track.title || "Canción";
    $("#track-artist").textContent = track.artist || "";
    $$(".track-item").forEach((el, i) => el.classList.toggle("is-current", i === index));
    const art = $("#album-art");
    if (track.cover) {
      art.style.backgroundImage = `linear-gradient(rgba(55,48,69,.12),rgba(55,48,69,.12)),url("${track.cover}")`;
      art.style.backgroundSize = "cover";
      art.style.backgroundPosition = "center";
    } else {
      art.style.backgroundImage = "";
      art.style.background = activePlaylist === "good"
        ? "radial-gradient(circle at 50% 38%,#f6dfc6,#d9a9a4 55%,#8d8399)"
        : "radial-gradient(circle at 50% 38%,#d8d8e8,#999bb8 55%,#4e5875)";
    }
    if (autoplay) audio.play().then(() => $("#play-track").textContent = "Ⅱ").catch(() => $("#play-track").textContent = "▶");
  }

  $("#play-track").addEventListener("click", () => {
    if (activeTrackIndex < 0) {
      if (currentTracks.length) loadTrack(0, true);
      return;
    }
    if (audio.paused) audio.play().then(() => $("#play-track").textContent = "Ⅱ").catch(() => {});
    else { audio.pause(); $("#play-track").textContent = "▶"; }
  });
  $("#prev-track").addEventListener("click", () => {
    if (currentTracks.length) loadTrack((activeTrackIndex - 1 + currentTracks.length) % currentTracks.length, true);
  });
  $("#next-track").addEventListener("click", () => {
    if (currentTracks.length) loadTrack((activeTrackIndex + 1) % currentTracks.length, true);
  });
  audio.addEventListener("timeupdate", () => {
    $("#current-time").textContent = formatTime(audio.currentTime);
    if (Number.isFinite(audio.duration) && audio.duration > 0) $("#progress").value = (audio.currentTime / audio.duration) * 100;
  });
  audio.addEventListener("loadedmetadata", () => $("#duration").textContent = formatTime(audio.duration));
  audio.addEventListener("ended", () => {
    if (currentTracks.length) loadTrack((activeTrackIndex + 1) % currentTracks.length, true);
  });
  audio.addEventListener("pause", () => $("#play-track").textContent = "▶");
  audio.addEventListener("play", () => $("#play-track").textContent = "Ⅱ");
  $("#progress").addEventListener("input", event => {
    if (Number.isFinite(audio.duration)) audio.currentTime = (Number(event.target.value) / 100) * audio.duration;
  });
  $("#volume").addEventListener("input", event => audio.volume = Number(event.target.value));
  audio.volume = 0.8;

  $$(".playlist-tab").forEach(tab => tab.addEventListener("click", () => {
    $$(".playlist-tab").forEach(t => {
      const selected = t === tab;
      t.classList.toggle("is-selected", selected);
      t.setAttribute("aria-selected", String(selected));
    });
    renderPlaylist(tab.dataset.playlist);
  }));

  applyContent();
  renderPlaylist("good");
  $("#global-progress-fill").style.width = `${100 / scenes.length}%`;
})();