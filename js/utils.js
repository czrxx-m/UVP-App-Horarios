/* Utilidades pequeñas compartidas por la interfaz. No edites este archivo para cambiar clases. */
(() => {
  const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const DATE_DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const SHORT_DAYS = { Lunes: "Lun", Martes: "Mar", Miércoles: "Mié", Jueves: "Jue", Viernes: "Vie", Sábado: "Sáb", Domingo: "Dom" };
  const ICONS = {
    home: '<path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/><path d="m8 14 2 2 4-4"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5"/><path d="M5 17v3h14v-3"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
    "calendar-check": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18m3 4 2 2 4-4"/>',
    leaf: '<path d="M20.8 3.2C12 3 5.2 5.9 4 12.1c-.8 4 2.2 7.2 6 6.5 6.1-1.1 9.9-7.8 10.8-15.4Z"/><path d="M3 21c3.4-6.1 7.8-10.4 14-14"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    user: '<path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="8" r="4"/>',
    flask: '<path d="M9 3h6m-5 0v6L4.8 18.1A2 2 0 0 0 6.5 21h11a2 2 0 0 0 1.7-2.9L14 9V3"/><path d="M7 16h10"/>',
    calculator: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2m4 0h2M8 15h2m4 0h2M8 18h2m4 0h2"/>',
    brain: '<path d="M12 5a3 3 0 0 0-5.8-1A4 4 0 0 0 4 11a4 4 0 0 0 2 7.4A3.5 3.5 0 0 0 12 17Z"/><path d="M12 5a3 3 0 0 1 5.8-1A4 4 0 0 1 20 11a4 4 0 0 1-2 7.4A3.5 3.5 0 0 1 12 17Zm0 0v16m-4-12h4m4 3h-4"/>',
    sprout: '<path d="M12 21v-9"/><path d="M12 13C5 13 3 8 4 4c5 0 9 3 8 9Zm0-3c0-5 4-8 8-8 1 5-2 9-8 9"/><path d="M7 21h10"/>',
    activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h7"/>',
    coffee: '<path d="M4 8h13v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z"/><path d="M17 10h2a2 2 0 1 1 0 4h-2M8 3v2m5-2v2"/>',
    sunplant: '<circle cx="17" cy="6" r="2"/><path d="M17 1v2m0 6v2m-5-5h2m6 0h2M4 20c3-4 6-6 10-6m-8 6h10M10 14c-4 0-6-3-6-6 4 0 7 2 7 6m3 0c0-4 3-7 7-7 0 4-3 7-7 7"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.5 2.6-1.7-.7a8.2 8.2 0 0 1-1.7 1l-.3 1.8h-3l-.3-1.8a8.2 8.2 0 0 1-1.7-1l-1.7.7-1.5-2.6 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.5-2.6 1.7.7a8.2 8.2 0 0 1 1.7-1l.3-1.8h3l.3 1.8a8.2 8.2 0 0 1 1.7 1l1.7-.7 1.5 2.6-1.4 1.1a7 7 0 0 1 0 1.9Z"/>',
    sparkles: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15ZM5 2l.7 1.8L7.5 4.5l-1.8.7L5 7l-.7-1.8-1.8-.7 1.8-.7L5 2Z"/>',
    print: '<path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v4a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7zM17 11h1"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4.4m-6.6 8.4 6.6 4.4"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    contrast: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18Z"/>',
    motion: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.5 9a7 7 0 0 1 11.7-2L20 12M4 12l2.8 5a7 7 0 0 0 11.7-2"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
    shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>'
  };
  function h(tag, className = "", text = "") {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null && text !== "") el.textContent = String(text);
    return el;
  }
  function icon(name, className = "") {
    const el = h("span", className);
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = `<svg viewBox="0 0 24 24" focusable="false">${ICONS[name] || ICONS.leaf}</svg>`;
    return el;
  }
  function mins(time) { const [hours, minutes] = String(time).split(":").map(Number); return hours * 60 + minutes; }
  function normalize(value) { return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-MX").trim(); }
  function formatTime(time) {
    const [hh, mm] = time.split(":").map(Number);
    const suffix = hh >= 12 ? "p. m." : "a. m.";
    return `${hh % 12 || 12}:${String(mm).padStart(2, "0")} ${suffix}`;
  }
  function formatDuration(value) {
    const total = Math.max(0, Math.round(value));
    const hours = Math.floor(total / 60), minutes = total % 60;
    if (!hours) return `${minutes} min`;
    if (!minutes) return `${hours} h`;
    return `${hours} h ${minutes} min`;
  }
  function plural(value, singular, pluralForm = `${singular}s`) { return `${value} ${value === 1 ? singular : pluralForm}`; }
  function dateName(date, withYear = false) {
    return new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", ...(withYear ? { year: "numeric" } : {}) }).format(date);
  }
  function dayForDate(date) { return DATE_DAYS[date.getDay()]; }
  function dateForDay(day, base = new Date()) {
    const result = new Date(base); result.setHours(0, 0, 0, 0);
    const indexMonday = (result.getDay() + 6) % 7;
    result.setDate(result.getDate() - indexMonday + DAYS.indexOf(day));
    return result;
  }
  function dateAtTime(date, time) {
    const result = new Date(date); const [hh, mm] = time.split(":").map(Number); result.setHours(hh, mm, 0, 0); return result;
  }
  function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function accentFor(subject) {
    const s = normalize(subject);
    if (/quim|botan|matem|pensamiento|competencias/.test(s)) return "accent-yellow";
    if (/vole|deport|actividad/.test(s)) return "accent-cream";
    if (/autonomia|caracter|proposito/.test(s)) return "accent-red";
    return "";
  }
  function iconForSubject(subject) {
    const s = normalize(subject);
    if (/botan|edaf|agro|planta|cultiv|suelo/.test(s)) return "sprout";
    if (/quim/.test(s)) return "flask";
    if (/matemat/.test(s)) return "calculator";
    if (/pensamiento|logico|competencias/.test(s)) return "brain";
    if (/vole|deport|actividad/.test(s)) return "activity";
    if (/autonomia|caracter|proposito/.test(s)) return "sunplant";
    return "leaf";
  }
  function isActivity(subject) { return /v[oó]ley|actividad deportiva/i.test(subject); }
  window.HU = { DAYS, DATE_DAYS, SHORT_DAYS, h, icon, mins, normalize, formatTime, formatDuration, plural, dateName, dayForDate, dateForDay, dateAtTime, sameDay, accentFor, iconForSubject, isActivity };
})();
