/* Modelo de horario: agrupa materias, calcula estados de clase y próxima actividad. */
(() => {
  const U = window.HU;
  const data = window.MI_HORARIO || { horario: {} };
  const schedule = data.horario || {};

  function dayClasses(day) {
    return [...(schedule[day] || [])].sort((a, b) => U.mins(a.inicio) - U.mins(b.inicio));
  }
  function classesForDate(date) { return dayClasses(U.dayForDate(date)); }
  function allSubjects() {
    const map = new Map();
    U.DAYS.forEach(day => dayClasses(day).forEach(cls => {
      if (!map.has(cls.materia)) map.set(cls.materia, { name: cls.materia, sessions: 0, minutes: 0, days: new Set(), rooms: new Set(), teachers: new Set(), activity: U.isActivity(cls.materia) });
      const subject = map.get(cls.materia);
      subject.sessions += 1;
      subject.minutes += U.mins(cls.fin) - U.mins(cls.inicio);
      subject.days.add(day);
      if (cls.salon) subject.rooms.add(cls.salon);
      if (cls.profesor) subject.teachers.add(cls.profesor);
    }));
    return [...map.values()].map(subject => ({
      ...subject,
      days: [...subject.days], rooms: [...subject.rooms], teachers: [...subject.teachers]
    })).sort((a, b) => a.name.localeCompare(b.name, "es-MX"));
  }
  function occurrencesFrom(now, days = 9) {
    const found = [];
    const base = new Date(now); base.setHours(0, 0, 0, 0);
    for (let offset = 0; offset < days; offset++) {
      const date = new Date(base); date.setDate(base.getDate() + offset);
      for (const cls of classesForDate(date)) {
        const start = U.dateAtTime(date, cls.inicio);
        const end = U.dateAtTime(date, cls.fin);
        if (end > now) found.push({ clase: cls, date, start, end });
      }
    }
    return found.sort((a, b) => a.start - b.start);
  }
  function getFeatureModel(now) {
    const today = new Date(now); today.setHours(0, 0, 0, 0);
    const todayClasses = classesForDate(today);
    const current = todayClasses.find(cls => now >= U.dateAtTime(today, cls.inicio) && now < U.dateAtTime(today, cls.fin));
    const occurrences = occurrencesFrom(now);
    const nextOccurrence = occurrences.find(item => item.start > now);
    if (current) {
      const currentEnd = U.dateAtTime(today, current.fin);
      const minsLeft = Math.ceil((currentEnd.getTime() - now.getTime()) / 60000);
      const nextToday = todayClasses.find(cls => U.dateAtTime(today, cls.inicio) > now);
      // Diez minutos antes del final se anticipa el cambio de salón.
      if (minsLeft <= 10 && nextToday) {
        return { mode: "next-ahead", cls: nextToday, date: today, current, currentDate: today, nextToday: null };
      }
      return { mode: "current", cls: current, date: today, current, currentDate: today, nextToday: nextToday ? { clase: nextToday } : null };
    }
    if (nextOccurrence) return { mode: "next", cls: nextOccurrence.clase, date: nextOccurrence.date, current: null, nextToday: null };
    return { mode: "empty", cls: null, date: null, current: null, nextToday: null };
  }
  function calcStats(classes, now, date) {
    const minutes = classes.reduce((total, cls) => total + U.mins(cls.fin) - U.mins(cls.inicio), 0);
    const isToday = U.sameDay(date, now);
    const completed = isToday ? classes.filter(cls => now >= U.dateAtTime(date, cls.fin)).length : 0;
    const remaining = isToday ? classes.filter(cls => now < U.dateAtTime(date, cls.fin)).length : classes.length;
    return { sessions: classes.length, minutes, subjects: new Set(classes.map(cls => cls.materia)).size, completed, remaining };
  }

  window.HorarioModel = { dayClasses, classesForDate, allSubjects, occurrencesFrom, getFeatureModel, calcStats };
})();
