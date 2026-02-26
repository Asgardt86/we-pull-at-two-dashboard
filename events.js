/* ------------------ WORLD EVENTS (HYBRID SYSTEM PRO) ------------------ */

function getFirstSunday(year, month) {
  const date = new Date(year, month, 1);
  while (date.getDay() !== 0) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function daysBetween(date1, date2) {
  const diff = date2 - date1;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(date) {
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit"
  });
}

function getDarkmoonEvents() {
  const now = new Date();
  const events = [];

  for (let i = 0; i < 3; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const start = getFirstSunday(date.getFullYear(), date.getMonth());
    const end = addDays(start, 6);

    events.push({
      name: "Dunkelmondjahrmarkt",
      start,
      end
    });
  }

  return events;
}

function getFixedEvents(year) {
  return [
    {
      name: "Piratentag",
      start: new Date(year, 8, 19),
      end: new Date(year, 8, 19)
    },
    {
      name: "Tag der Toten",
      start: new Date(year, 10, 1),
      end: new Date(year, 10, 3)
    }
  ];
}

/* VARIABLE EVENTS – 2026 */
const VARIABLE_EVENTS = [
  {
    name: "Mondfest",
    start: new Date(2026, 1, 16),
    end: new Date(2026, 2, 2)
  },
  {
    name: "Liebe liegt in der Luft",
    start: new Date(2026, 1, 9),
    end: new Date(2026, 1, 23)
  }
];

function loadEvents() {
  const now = new Date();
  const maxFuture = addDays(now, 60); // 60 Tage
  const year = now.getFullYear();

  let events = [
    ...getDarkmoonEvents(),
    ...getFixedEvents(year),
    ...VARIABLE_EVENTS
  ];

  // Nur aktive oder kommende Events
  events = events.filter(event => {
    const isActive = now >= event.start && now <= event.end;
    const startsSoon = event.start > now && event.start <= maxFuture;
    return isActive || startsSoon;
  });

  // Chronologisch sortieren
  events.sort((a, b) => a.start - b.start);

  let html = `
    <div style="
      display:flex;
      gap:12px;
      overflow-x:auto;
      padding-bottom:10px;
    ">
  `;

  events.forEach(event => {

    const isActive = now >= event.start && now <= event.end;

    let status = "";
    let color = "#3b82f6";

    if (isActive) {
      status = "AKTIV";
      color = "#22c55e";
    } else {
      const days = daysBetween(now, event.start);
      status = `Startet in ${days} Tagen`;
      color = "#facc15";
    }

    html += `
      <div style="
        min-width:240px;
        padding:14px 18px;
        border-radius:12px;
        background:rgba(30,41,59,0.85);
        border:1px solid rgba(255,255,255,0.08);
        box-shadow:0 5px 20px rgba(0,0,0,0.4);
      ">
        <div style="font-weight:bold; margin-bottom:6px;">
          ${event.name}
        </div>
        <div style="font-size:12px; color:#9ca3af; margin-bottom:6px;">
          ${formatDate(event.start)} – ${formatDate(event.end)}
        </div>
        <div style="color:${color}; font-size:13px;">
          ${status}
        </div>
      </div>
    `;
  });

  html += "</div>";

  document.getElementById("event-bar").innerHTML = html;
}

document.addEventListener("DOMContentLoaded", loadEvents);
