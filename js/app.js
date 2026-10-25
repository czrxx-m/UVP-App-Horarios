/*
 * MI HORARIO UVP 2.0
 * Controlador de pantallas, preferencias locales, accesos rápidos y herramientas.
 * El horario vive exclusivamente en data/horario.js.
 */
(() => {
  "use strict";
  const U = window.HU;
  const R = window.AppRender;
  const M = window.HorarioModel;
  const PREFS_KEY = "mi-horario-uvp-preferences-v2";
  const FAVORITES_KEY = "mi-horario-uvp-favorites-v2";
  const VIEWS = ["inicio", "semana", "materias", "mas"];
  const byId = id => document.getElementById(id);
  const safeRead = (key, fallback) => {
    try { const value = localStorage.getItem(key); return value === null ? fallback : JSON.parse(value); }
    catch (_) { return fallback; }
  };
  const safeWrite = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (_) { return false; }
  };
  const state = {
    view: "inicio",
    selectedDay: U.DATE_DAYS[new Date().getDay()],
    manualDay: false,
    query: "",
    filter: "all",
    installPrompt: null,
    timer: null,
    toastTimer: null,
    favorites: new Set(Array.isArray(safeRead(FAVORITES_KEY, [])) ? safeRead(FAVORITES_KEY, []) : []),
    prefs: { contrast: false, reduceMotion: false, ...safeRead(PREFS_KEY, {}) }
  };

  function updateHeader(now) {
    byId("topbar-date").textContent = U.dateName(now).toLocaleUpperCase("es-MX");
    byId("welcome-date").textContent = U.dateName(now, true).replace(/^./, c => c.toLocaleUpperCase("es-MX")) + " · una cosa a la vez.";
    byId("footer-year").textContent = now.getFullYear();
    const semester = (window.MI_HORARIO && window.MI_HORARIO.semestre) || "Horario académico";
    byId("semester-label").textContent = semester;
    byId("more-semester").textContent = semester;
  }

  function renderDayPicker() {
    const now = new Date();
    const dateMap = Object.fromEntries(U.DAYS.map(day => [day, M.dayClasses(day)]));
    R.renderDayPicker(state.selectedDay, now, dateMap, day => {
      state.selectedDay = day;
      state.manualDay = day !== U.DATE_DAYS[new Date().getDay()];
      renderDayPicker();
      renderWeek();
    });
  }

  function renderWeek() {
    const date = U.dateForDay(state.selectedDay, new Date());
    R.renderWeek(state.selectedDay, date, M.dayClasses(state.selectedDay), new Date());
  }

  function updateNav() {
    document.querySelectorAll(".nav-item[data-view], .mobile-nav-item[data-view]").forEach(button => {
      const active = button.dataset.view === state.view;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-current", active ? "page" : "false");
    });
  }

  function updateMoreStats() {
    const subjects = M.allSubjects();
    const classes = subjects.filter(subject => !subject.activity);
    const sessions = U.DAYS.reduce((total, day) => total + M.dayClasses(day).length, 0);
    byId("more-subject-count").textContent = `${classes.length} materias`;
    byId("more-session-count").textContent = `${sessions} sesiones semanales`;
  }

  function refresh() {
    const now = new Date();
    if (!state.manualDay && state.selectedDay !== U.DATE_DAYS[now.getDay()]) {
      state.selectedDay = U.DATE_DAYS[now.getDay()];
      renderDayPicker();
    }
    updateHeader(now);
    const today = new Date(now); today.setHours(0, 0, 0, 0);
    const todayClasses = M.classesForDate(today);
    const feature = M.getFeatureModel(now);
    R.renderFeature(feature, now);
    R.renderStats(M.calcStats(todayClasses, now, today));
    R.renderTodayAgenda(todayClasses, now, feature.mode === "next-ahead" ? { clase: feature.cls } : null);
    renderWeek();
    R.renderSubjects(M.allSubjects(), state.query, state.filter, state.favorites);
    updateMoreStats();
    updateNav();
  }

  function navigate(view, changeHash = true) {
    if (!VIEWS.includes(view)) view = "inicio";
    state.view = view;
    document.querySelectorAll(".view").forEach(section => {
      const active = section.id === `view-${view}`;
      section.hidden = !active;
      section.classList.toggle("is-visible", active);
    });
    updateNav();
    if (changeHash && location.hash !== `#${view}`) history.replaceState(null, "", `#${view}`);
    if (view === "semana") renderWeek();
    if (view === "materias") {
      R.renderSubjects(M.allSubjects(), state.query, state.filter, state.favorites);
    }
    if (view === "mas") updateMoreStats();
    window.scrollTo({ top: 0, behavior: document.documentElement.classList.contains("reduce-motion") ? "auto" : "smooth" });
  }

  function showToast(message) {
    const toast = byId("toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3000);
  }

  function applyPreferences() {
    document.body.classList.toggle("high-contrast", Boolean(state.prefs.contrast));
    document.documentElement.classList.toggle("reduce-motion", Boolean(state.prefs.reduceMotion));
    byId("pref-contrast").checked = Boolean(state.prefs.contrast);
    byId("pref-motion").checked = Boolean(state.prefs.reduceMotion);
  }

  function setupNavigation() {
    document.addEventListener("click", event => {
      const favoriteButton = event.target.closest("[data-favorite]");
      if (favoriteButton) {
        const name = favoriteButton.dataset.favorite;
        if (state.favorites.has(name)) state.favorites.delete(name); else state.favorites.add(name);
        safeWrite(FAVORITES_KEY, [...state.favorites]);
        R.renderSubjects(M.allSubjects(), state.query, state.filter, state.favorites);
        showToast(state.favorites.has(name) ? `${name} se guardó en favoritas.` : `${name} se quitó de favoritas.`);
        return;
      }

      const viewButton = event.target.closest("[data-view]");
      if (viewButton) {
        navigate(viewButton.dataset.view);
        if (viewButton.dataset.view === "materias" && viewButton.dataset.focusSearch === "true") {
          window.setTimeout(() => byId("subject-search-input").focus({ preventScroll: true }), 40);
        }
        return;
      }
      const link = event.target.closest("[data-view-link]");
      if (link) { event.preventDefault(); navigate(link.dataset.viewLink); return; }
      const filterButton = event.target.closest("[data-filter]");
      if (filterButton) {
        state.filter = filterButton.dataset.filter;
        document.querySelectorAll("[data-filter]").forEach(button => button.classList.toggle("is-selected", button === filterButton));
        R.renderSubjects(M.allSubjects(), state.query, state.filter, state.favorites);
      }
    });

    byId("go-today").addEventListener("click", () => {
      state.selectedDay = U.DATE_DAYS[new Date().getDay()];
      state.manualDay = false;
      renderDayPicker(); renderWeek();
      showToast("Estás viendo el día de hoy.");
    });
    byId("subject-search-input").addEventListener("input", event => {
      state.query = event.target.value;
      R.renderSubjects(M.allSubjects(), state.query, state.filter, state.favorites);
    });
    byId("subject-search-input").addEventListener("keydown", event => {
      if (event.key === "Escape" && event.currentTarget.value) {
        event.currentTarget.value = "";
        state.query = "";
        R.renderSubjects(M.allSubjects(), state.query, state.filter, state.favorites);
      }
    });
    window.addEventListener("hashchange", () => navigate(location.hash.slice(1) || "inicio", false));
    document.addEventListener("keydown", event => {
      const target = event.target;
      const typing = target && (target.matches("input, textarea, select") || target.isContentEditable);
      if (!typing && event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        navigate("materias");
        window.setTimeout(() => byId("subject-search-input").focus({ preventScroll: true }), 40);
      }
      if (!typing && event.key.toLowerCase() === "h" && !event.ctrlKey && !event.metaKey && !event.altKey) navigate("inicio");
    });
  }

  function setupInstall() {
    const button = byId("install-button");
    window.addEventListener("beforeinstallprompt", event => {
      event.preventDefault(); state.installPrompt = event; button.hidden = false;
    });
    button.addEventListener("click", async () => {
      if (!state.installPrompt) {
        showToast("En el menú de Chrome, elige “Instalar app” o “Añadir a pantalla de inicio”.");
        return;
      }
      state.installPrompt.prompt();
      try { await state.installPrompt.userChoice; } catch (_) { /* El diálogo pudo cerrarse. */ }
      state.installPrompt = null; button.hidden = true;
    });
    window.addEventListener("appinstalled", () => { button.hidden = true; showToast("Mi Horario quedó instalado en tu dispositivo."); });
  }

  function setupConnection() {
    const status = document.querySelector(".offline-status");
    const label = byId("connection-label");
    const render = () => {
      const offline = !navigator.onLine;
      status.classList.toggle("is-offline", offline);
      label.textContent = offline ? "Modo sin conexión" : "Lista para tu día";
    };
    window.addEventListener("online", render); window.addEventListener("offline", render); render();
  }

  function setupServiceWorker() {
    if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(error => console.warn("No se pudo registrar el modo sin conexión:", error));
    });
  }

  function setupSplash() {
    const splash = byId("splash");
    const delay = state.prefs.reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 100 : 650;
    window.setTimeout(() => splash.classList.add("is-hidden"), delay);
    window.setTimeout(() => splash.remove(), delay + 470);
  }

  function icsEscape(value) {
    return String(value ?? "").replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  }
  function icsDate(date) {
    return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}00`;
  }
  function icsFold(line) {
    const rows = []; let row = ""; let bytes = 0;
    for (const char of Array.from(line)) {
      const size = typeof TextEncoder !== "undefined" ? new TextEncoder().encode(char).length : char.length;
      if (bytes + size > 73 && row) { rows.push(row); row = ` ${char}`; bytes = 1 + size; }
      else { row += char; bytes += size; }
    }
    rows.push(row);
    return rows.join("\r\n");
  }
  function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = filename; anchor.hidden = true;
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  function exportCalendar() {
    const now = new Date();
    const lines = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Mi Horario UVP//ES-MX//", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
      `X-WR-CALNAME:${icsEscape("Mi Horario UVP")}`, "X-WR-TIMEZONE:America/Mexico_City"
    ];
    const startDay = new Date(now); startDay.setHours(0, 0, 0, 0);
    let count = 0;
    for (let offset = 0; offset < 28; offset++) {
      const date = new Date(startDay); date.setDate(startDay.getDate() + offset);
      M.classesForDate(date).forEach((cls, index) => {
        const start = U.dateAtTime(date, cls.inicio); const end = U.dateAtTime(date, cls.fin);
        if (end <= now) return;
        const details = [cls.profesor ? `Profesor: ${cls.profesor}` : "", cls.salon ? `Salón: ${cls.salon}` : ""].filter(Boolean).join(" · ");
        lines.push("BEGIN:VEVENT", `UID:${date.getFullYear()}-${offset}-${index}-${count}@mihorariouvp.local`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}`, `DTSTART:${icsDate(start)}`, `DTEND:${icsDate(end)}`, `SUMMARY:${icsEscape(cls.materia)}`, `DESCRIPTION:${icsEscape(details || "Actividad académica")}`, `LOCATION:${icsEscape(cls.salon || "")}`, "END:VEVENT");
        count++;
      });
    }
    lines.push("END:VCALENDAR");
    const content = lines.map(icsFold).join("\r\n") + "\r\n";
    downloadFile("mi-horario-uvp-4-semanas.ics", content, "text/calendar;charset=utf-8");
    showToast(count ? `Calendario preparado: ${count} eventos en las próximas 4 semanas.` : "No hay clases futuras para exportar en este periodo.");
  }

  async function writeClipboard(text, successMessage) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const field = document.createElement("textarea");
        field.value = text; field.setAttribute("readonly", "");
        field.style.position = "fixed"; field.style.opacity = "0"; field.style.pointerEvents = "none";
        document.body.appendChild(field); field.select();
        const copied = document.execCommand("copy"); field.remove();
        if (!copied) throw new Error("No se pudo copiar el texto");
      }
      showToast(successMessage);
      return true;
    } catch (_) {
      showToast("Tu navegador no permitió copiar automáticamente. Inténtalo desde una página segura HTTPS.");
      return false;
    }
  }

  function todayText() {
    const now = new Date(); const classes = M.classesForDate(now);
    const header = `MI HORARIO UVP · ${U.dateName(now, true).toLocaleUpperCase("es-MX")}`;
    if (!classes.length) return `${header}\nHoy no tienes clases programadas.`;
    return [header, "", ...classes.map(cls => `${U.formatTime(cls.inicio)} – ${U.formatTime(cls.fin)} | ${cls.materia}\nSalón: ${cls.salon || "Por confirmar"}${cls.profesor ? ` · Profesor: ${cls.profesor}` : ""}`)].join("\n");
  }

  function buildPrintSheet() {
    const root = byId("print-sheet"); root.replaceChildren();
    const header = U.h("header", "print-header");
    const logo = document.createElement("img"); logo.src = "assets/uvp-symbol.png"; logo.alt = "Símbolo UVP";
    const brand = U.h("div");
    const title = U.h("h1", "", "Mi Horario UVP");
    const career = (window.MI_HORARIO && window.MI_HORARIO.carrera) || "Ingeniería en Agronomía";
    const semester = (window.MI_HORARIO && window.MI_HORARIO.semestre) || "Horario académico";
    const meta = U.h("p", "", `${career} · ${semester} · Generado el ${U.dateName(new Date(), true)}`);
    brand.append(title, meta); header.append(logo, brand); root.appendChild(header);
    const days = U.h("div", "print-days");
    U.DAYS.forEach(day => {
      const column = U.h("section", "print-day"); column.appendChild(U.h("h2", "", day));
      const classes = M.dayClasses(day);
      if (!classes.length) column.appendChild(U.h("p", "print-empty", "Sin actividades programadas."));
      classes.forEach(cls => {
        const item = U.h("div", "print-class");
        item.appendChild(U.h("strong", "", `${U.formatTime(cls.inicio)} – ${U.formatTime(cls.fin)}  ·  ${cls.materia}`));
        item.appendChild(U.h("small", "", [cls.salon ? `Salón: ${cls.salon}` : "Salón por confirmar", cls.profesor ? `Profesor: ${cls.profesor}` : ""].filter(Boolean).join("  ·  ")));
        column.appendChild(item);
      });
      days.appendChild(column);
    });
    root.appendChild(days);
  }

  function setupMoreTools() {
    byId("export-calendar-button").addEventListener("click", exportCalendar);
    byId("copy-today-button").addEventListener("click", () => writeClipboard(todayText(), "El horario de hoy se copió."));
    byId("share-app-button").addEventListener("click", async () => {
      const url = `${location.origin}${location.pathname}`;
      const payload = { title: "Mi Horario UVP", text: "Mi horario de Ingeniería en Agronomía", url };
      if (navigator.share) {
        try { await navigator.share(payload); } catch (error) { if (error && error.name !== "AbortError") showToast("No se pudo abrir el menú para compartir."); }
      } else {
        await writeClipboard(url, "Enlace de la app copiado.");
      }
    });
    byId("print-schedule-button").addEventListener("click", () => {
      buildPrintSheet(); byId("print-sheet").hidden = false;
      window.setTimeout(() => window.print(), 80);
    });
    window.addEventListener("afterprint", () => { byId("print-sheet").hidden = true; });

    byId("pref-contrast").addEventListener("change", event => {
      state.prefs.contrast = event.currentTarget.checked;
      safeWrite(PREFS_KEY, state.prefs); applyPreferences();
      showToast(state.prefs.contrast ? "Contraste reforzado activado." : "Contraste estándar restaurado.");
    });
    byId("pref-motion").addEventListener("change", event => {
      state.prefs.reduceMotion = event.currentTarget.checked;
      safeWrite(PREFS_KEY, state.prefs); applyPreferences();
      showToast(state.prefs.reduceMotion ? "Animaciones reducidas." : "Animaciones activadas.");
    });
    byId("check-updates-button").addEventListener("click", async () => {
      if (!("serviceWorker" in navigator)) { showToast("Este navegador no admite actualización automática de la app."); return; }
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) await registration.update();
        showToast("Se comprobó la versión. Cierra y vuelve a abrir la app si hay cambios pendientes.");
      } catch (_) { showToast("No se pudo comprobar la actualización. Revisa tu conexión."); }
    });
  }

  function preventUnwantedMobileGestures() {
    // Evita menú de selección y menú contextual al mantener presionado texto decorativo.
    document.addEventListener("contextmenu", event => {
      if (event.target.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
    });
    document.addEventListener("dragstart", event => {
      if (event.target instanceof HTMLImageElement) event.preventDefault();
    });
    document.addEventListener("touchstart", event => {
      if (event.touches && event.touches.length > 1) event.preventDefault();
    }, { passive: false });
    document.addEventListener("touchmove", event => {
      if (event.touches && event.touches.length > 1) event.preventDefault();
    }, { passive: false });
    ["gesturestart", "gesturechange", "gestureend"].forEach(type => {
      document.addEventListener(type, event => event.preventDefault(), { passive: false });
    });
  }

  function setupServiceWorker() {
    if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(error => console.warn("No se pudo registrar el modo sin conexión:", error));
    });
  }

  function start() {
    document.querySelectorAll("[data-icon]").forEach(node => node.replaceChildren(U.icon(node.dataset.icon)));
    state.selectedDay = U.DATE_DAYS[new Date().getDay()];
    applyPreferences();
    setupNavigation(); setupInstall(); setupConnection(); setupMoreTools(); preventUnwantedMobileGestures(); setupServiceWorker(); setupSplash();
    renderDayPicker();
    navigate((location.hash || "#inicio").replace(/^#/, ""), false);
    refresh();
    const alignAndRefresh = () => {
      clearTimeout(state.timer);
      const now = new Date();
      const wait = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds()) + 80;
      state.timer = setTimeout(() => { refresh(); alignAndRefresh(); }, wait);
    };
    alignAndRefresh();
    document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });
    window.addEventListener("pageshow", () => refresh());
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true }); else start();
})();
