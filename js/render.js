/* Renderizado de vistas: aquí se construyen tarjetas y listas a partir de los datos. */
(() => {
  const U = window.HU;
  const h = U.h;
  function clear(node) { node.replaceChildren(); }
  function append(parent, ...children) { children.filter(Boolean).forEach(child => parent.appendChild(child)); return parent; }
  function dayTag(date, now) {
    if (U.sameDay(date, now)) return "HOY";
    const tom = new Date(now); tom.setDate(tom.getDate() + 1);
    if (U.sameDay(date, tom)) return "MAÑANA";
    return new Intl.DateTimeFormat("es-MX", { weekday: "long" }).format(date).toLocaleUpperCase("es-MX");
  }
  function stateOf(cls, date, now) {
    if (!U.sameDay(date, now)) return "programada";
    const start = U.dateAtTime(date, cls.inicio), end = U.dateAtTime(date, cls.fin);
    if (now >= end) return "finalizada";
    if (now >= start && now < end) return "en-curso";
    return "pendiente";
  }
  function addDetail(parent, iconName, text) {
    const item = h("span", "detail-pill"); append(item, U.icon(iconName), h("span", "", text)); parent.appendChild(item); return item;
  }
  function subjectEmblem(subject, extra = "") {
    return append(h("span", `subject-emblem ${U.accentFor(subject)} ${extra}`.trim()), U.icon(U.iconForSubject(subject)));
  }
  function renderFeature(model, now) {
    const root = document.getElementById("featured-class"); clear(root);
    const card = document.querySelector(".feature-card");
    const stateLabel = document.getElementById("feature-state");
    const dayLabel = document.getElementById("feature-day");
    const context = document.getElementById("feature-context");
    const footnote = document.getElementById("feature-footnote");
    const progress = document.getElementById("feature-progress-fill");
    card.classList.toggle("is-next-ahead", model.mode === "next-ahead");
    card.classList.toggle("is-empty", model.mode === "empty");
    context.hidden = true; context.textContent = "";
    progress.style.width = "0%";

    if (model.mode === "empty") {
      stateLabel.textContent = "SIN CLASES PRÓXIMAS"; dayLabel.textContent = "TODO EN ORDEN";
      const wrapper = h("div", "feature-class-copy");
      append(wrapper, h("p", "class-time-label", "UN RESPIRO TAMBIÉN CUENTA"), h("h2", "", "Tienes espacio para recargar energía."), h("p", "class-subject-note", "No hay actividades programadas en los próximos días."));
      append(root, subjectEmblem("Botánica General"), wrapper);
      footnote.textContent = "DISFRUTA TU TIEMPO"; return;
    }
    const cls = model.cls;
    const modeLabel = model.mode === "current" ? "AHORA · CLASE EN CURSO" : model.mode === "next-ahead" ? "SIGUIENTE · VE PREPARÁNDOTE" : "TU PRÓXIMA CLASE";
    stateLabel.textContent = modeLabel;
    dayLabel.textContent = model.date ? dayTag(model.date, now) : "TODO EN ORDEN";
    const wrapper = h("div", "feature-class-copy");
    const timing = model.mode === "current" ? `TERMINA A LAS ${U.formatTime(cls.fin).toUpperCase()}` : `EMPIEZA A LAS ${U.formatTime(cls.inicio).toUpperCase()}`;
    append(wrapper, h("p", "class-time-label", timing), h("h2", "", cls.materia), h("p", "class-subject-note", model.mode === "current" ? "Tu clase está en curso." : model.date && !U.sameDay(model.date, now) ? `${U.dateName(model.date)} · ${U.formatTime(cls.inicio)}` : "Ten a mano el salón y llega con tiempo."));
    const details = h("div", "feature-detail-row"); addDetail(details, "clock", `${U.formatTime(cls.inicio)} – ${U.formatTime(cls.fin)}`); addDetail(details, "pin", cls.salon || "Salón por confirmar");
    if (cls.profesor) addDetail(details, "user", cls.profesor);
    append(wrapper, details); append(root, subjectEmblem(cls.materia), wrapper);

    if (model.mode === "current") {
      const start = U.dateAtTime(model.date, cls.inicio).getTime(), end = U.dateAtTime(model.date, cls.fin).getTime();
      progress.style.width = `${Math.max(0, Math.min(100, ((now.getTime() - start) / (end - start)) * 100))}%`;
      context.hidden = false;
      if (model.nextToday) context.textContent = `Después sigue ${model.nextToday.clase.materia} · salón ${model.nextToday.clase.salon}.`;
      else context.textContent = `Te quedan ${U.formatDuration(Math.max(0, Math.ceil((end - now.getTime()) / 60000)))} de clase.`;
      footnote.textContent = `QUEDAN ${U.formatDuration(Math.max(0, Math.ceil((end - now.getTime()) / 60000))).toUpperCase()}`;
    } else if (model.mode === "next-ahead") {
      context.hidden = false;
      const left = model.current ? Math.max(0, Math.ceil((U.dateAtTime(model.currentDate, model.current.fin).getTime() - now.getTime()) / 60000)) : 0;
      context.textContent = `Tu clase actual termina en ${left} min. La siguiente comienza a las ${U.formatTime(cls.inicio)}; salón ${cls.salon}.`;
      const until = Math.max(0, Math.ceil((U.dateAtTime(model.date, cls.inicio).getTime() - now.getTime()) / 60000));
      footnote.textContent = `EMPIEZA EN ${U.formatDuration(until).toUpperCase()}`;
    } else {
      if (model.date && U.sameDay(model.date, now)) {
        const until = Math.max(0, Math.ceil((U.dateAtTime(model.date, cls.inicio).getTime() - now.getTime()) / 60000));
        footnote.textContent = until === 0 ? "COMIENZA AHORA" : `EMPIEZA EN ${U.formatDuration(until).toUpperCase()}`;
      } else {
        footnote.textContent = model.date ? `PRÓXIMA ACTIVIDAD · ${U.dateName(model.date).toLocaleUpperCase("es-MX")}` : "TU AGENDA, A UN VISTAZO";
      }
    }
  }
  function renderStats(stats) {
    const root = document.getElementById("day-stats"); clear(root);
    const values = [
      { value: stats.sessions, label: "clases hoy" },
      { value: stats.subjects, label: "materias" },
      { value: U.formatDuration(stats.minutes), label: "en el campus" }
    ];
    values.forEach((item, i) => {
      if (i) root.appendChild(h("span", "day-stat-divider"));
      const stat = h("div", "day-stat"); append(stat, h("div", "stat-number", item.value), h("div", "stat-caption", item.label)); root.appendChild(stat);
    });
    document.getElementById("day-panel-message").textContent = stats.sessions ? (stats.remaining ? `Quedan ${stats.remaining} ${stats.remaining === 1 ? "clase" : "clases"} para cerrar tu jornada.` : "Todo lo que tocaba hoy ya está hecho.") : "Hoy no tienes clases programadas. Disfruta el espacio.";
  }
  function buildAgendaItem(cls, date, now, mode = "all") {
    const status = stateOf(cls, date, now);
    const item = h("article", `agenda-item ${status === "en-curso" ? "is-current" : ""} ${status === "finalizada" ? "is-done" : ""} ${mode === "ahead" ? "is-ahead" : ""} ${mode === "next" ? "is-next" : ""}`.trim());
    const time = h("div", "agenda-time"); append(time, h("strong", "", U.formatTime(cls.inicio)), h("small", "", U.formatTime(cls.fin)));
    const accent = h("div", `agenda-color ${U.accentFor(cls.materia)}`);
    const main = h("div", "agenda-main"); append(main, h("h3", "", cls.materia));
    const detail = h("p", ""); const room = h("span"); append(room, U.icon("pin"), h("span", "", cls.salon || "Salón por confirmar")); detail.appendChild(room);
    if (cls.profesor) { const teacher = h("span"); append(teacher, U.icon("user"), h("span", "", cls.profesor)); detail.appendChild(teacher); }
    main.appendChild(detail);
    let label = status === "en-curso" ? "EN CURSO" : status === "finalizada" ? "LISTA" : status === "pendiente" ? "PENDIENTE" : "EN AGENDA";
    if (mode === "ahead") label = "PREPÁRATE";
    if (mode === "next") label = "SIGUIENTE";
    append(item, time, accent, main, h("span", "agenda-status", label));
    return item;
  }
  function renderTodayAgenda(classes, now, nextAhead) {
    const root = document.getElementById("today-agenda"); clear(root);
    if (!classes.length) {
      const empty = h("div", "agenda-empty"); append(empty, append(h("span", "empty-icon"), U.icon("leaf")), append(h("div"), h("strong", "", "Tu día está despejado."), h("p", "", "No hay clases programadas para hoy. Revisa tu próxima actividad en la tarjeta principal."))); root.appendChild(empty); return;
    }
    const date = new Date(); date.setHours(0, 0, 0, 0);
    let markedNext = false;
    classes.forEach(cls => {
      let mode = "all";
      if (nextAhead && cls === nextAhead.clase && !markedNext) { mode = "ahead"; markedNext = true; }
      root.appendChild(buildAgendaItem(cls, date, now, mode));
    });
  }
  function renderDayPicker(selected, today, dateMap, chooseDay) {
    const root = document.getElementById("day-picker");
    // Build buttons once. Later selections update their state without moving keyboard focus.
    if (!root.querySelector(".day-button")) {
      U.DAYS.forEach(day => {
        const btn = h("button", "day-button");
        btn.type = "button"; btn.dataset.day = day;
        btn.setAttribute("aria-label", `Mostrar horario del ${day}`);
        append(btn, h("span", "day-abbr", U.SHORT_DAYS[day]), h("span", "day-date"), h("span", "day-indicator"));
        btn.addEventListener("click", () => chooseDay(btn.dataset.day));
        root.appendChild(btn);
      });
    }
    root.querySelectorAll(".day-button").forEach(btn => {
      const day = btn.dataset.day;
      const date = U.dateForDay(day, today);
      btn.className = `day-button ${day === selected ? "is-selected" : ""} ${day === U.dayForDate(today) ? "is-today" : ""} ${(dateMap[day] || []).length ? "has-classes" : ""}`.trim();
      btn.setAttribute("aria-pressed", String(day === selected));
      const dateElement = btn.querySelector(".day-date");
      if (dateElement) dateElement.textContent = String(date.getDate());
    });
  }
  function renderWeek(day, date, classes, now) {
    document.getElementById("week-selected-name").textContent = day;
    const summary = document.getElementById("week-summary"); clear(summary);
    const totalMinutes = classes.reduce((acc, c) => acc + U.mins(c.fin) - U.mins(c.inicio), 0);
    const left = h("span", ""); append(left, h("strong", "", U.plural(classes.length, "actividad", "actividades")), document.createTextNode(" programadas"));
    const right = h("span", "", `Tiempo total · ${U.formatDuration(totalMinutes)}`); append(summary, left, right);
    const root = document.getElementById("week-agenda"); clear(root);
    if (!classes.length) {
      const empty = h("div", "week-empty"); append(empty, append(h("div", "empty-icon"), U.icon("sprout")), h("h3", "", "Un día para tomar aire."), h("p", "", "No tienes clases registradas para este día. Puedes dejarlo libre o agregar una actividad en data/horario.js.")); root.appendChild(empty); return;
    }
    const isToday = U.sameDay(date, now);
    classes.forEach(cls => {
      const status = isToday ? stateOf(cls, date, now) : "programada";
      const row = h("article", `week-class ${status === "en-curso" ? "is-current" : ""} ${status === "finalizada" ? "is-done" : ""}`.trim());
      const time = h("div", "week-class-time"); append(time, document.createTextNode(U.formatTime(cls.inicio)), h("span", "", U.formatTime(cls.fin)));
      const accent = h("span", `week-class-accent ${U.accentFor(cls.materia)}`);
      const copy = h("div", "week-class-copy"); append(copy, h("h3", "", cls.materia));
      const details = [cls.salon || "Salón por confirmar", cls.profesor].filter(Boolean).join(" · "); copy.appendChild(h("p", "", details));
      const statusText = status === "en-curso" ? "EN CURSO" : status === "finalizada" ? "FINALIZADA" : status === "pendiente" ? "PRÓXIMA" : "PROGRAMADA";
      append(row, time, accent, copy, h("span", "week-class-status", statusText)); root.appendChild(row);
    });
  }
  function renderSubjects(subjects, query, filter, favorites = new Set()) {
    const root = document.getElementById("subject-grid"); clear(root);
    const q = U.normalize(query).split(/\s+/).filter(Boolean);
    const filtered = subjects.filter(subject => {
      if (filter === "class" && subject.activity) return false;
      if (filter === "activity" && !subject.activity) return false;
      if (filter === "favorites" && !favorites.has(subject.name)) return false;
      const haystack = U.normalize([subject.name, ...subject.days, ...subject.rooms, ...subject.teachers].join(" "));
      return q.every(term => haystack.includes(term));
    });
    const emptyFilter = filter === "favorites" ? "No tienes favoritas guardadas." : "Prueba otro nombre, profesor, día o salón.";
    document.getElementById("subject-count").textContent = filtered.length === subjects.length && !q.length && filter === "all" ? `${subjects.length} materias y actividades en tu horario` : `${filtered.length} resultado${filtered.length === 1 ? "" : "s"} encontrado${filtered.length === 1 ? "" : "s"}`;
    if (!filtered.length) {
      const empty = h("div", "agenda-empty subject-empty"); append(empty, append(h("span", "empty-icon"), U.icon("search")), append(h("div"), h("strong", "", "No encontramos coincidencias."), h("p", "", emptyFilter))); root.appendChild(empty); return;
    }
    filtered.forEach((subject, index) => {
      const card = h("article", "subject-card");
      const top = h("div", "subject-card-top");
      const favorite = h("button", `favorite-toggle ${favorites.has(subject.name) ? "is-favorite" : ""}`.trim());
      favorite.type = "button"; favorite.dataset.favorite = subject.name; favorite.setAttribute("aria-label", favorites.has(subject.name) ? `Quitar ${subject.name} de favoritas` : `Marcar ${subject.name} como favorita`); favorite.setAttribute("aria-pressed", String(favorites.has(subject.name))); favorite.title = favorites.has(subject.name) ? "Quitar de favoritas" : "Guardar en favoritas"; append(favorite, U.icon("star"));
      append(top, subjectEmblem(subject.name), h("span", "subject-type", subject.activity ? "ACTIVIDAD" : `MATERIA ${String(index + 1).padStart(2, "0")}`), favorite);
      append(card, top, h("h3", "", subject.name));
      const info = h("div", "subject-info");
      const lines = [
        ["calendar", `Días: ${subject.days.join(", ")}`],
        ["pin", `Salón: ${subject.rooms.join(", ") || "Por confirmar"}`],
        ...(subject.teachers.length ? [["user", `Profesor: ${subject.teachers.join(", ")}`]] : [])
      ];
      lines.forEach(([icon, text]) => { const line = h("div", "subject-info-line"); append(line, U.icon(icon), h("span", "", text)); info.appendChild(line); });
      const bottom = h("div", "subject-card-bottom"); append(bottom, h("span", "", `${subject.sessions} ${subject.sessions === 1 ? "sesión semanal" : "sesiones semanales"}`), h("strong", "", U.formatDuration(subject.minutes)));
      append(card, info, bottom); root.appendChild(card);
    });
  }
  window.AppRender = { renderFeature, renderStats, renderTodayAgenda, renderDayPicker, renderWeek, renderSubjects };
})();
