/* ------------------ WORLD EVENTS (HYBRID SYSTEM) ------------------ */

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

function getDarkmoonEvents() {
  const now = new Date();
  const events = [];

  for (let i = 0; i < 2; i++) {
    const month = now.getMonth() + i;
    const year = now.getFullYear();
    const start = getFirstSunday(year, month);
    const end = addDays(start, 6);

    events.push({
      name: "Dunkelmondjahrmarkt",
      start,
      end
    });
  }

  return events;
}

/* FESTE EVENTS (automatisch berechnet) */
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

/* VARIABLE EVENTS – JÄHRLICH PFLEGEN */
const VARIABLE_EVENTS_2026 = [
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
  const maxFuture = addDays(now, 30);
  const year = now.getFullYear();

  const events = [
    ...getDarkmoonEvents(),
    ...getFixedEvents(year),
    ...VARIABLE_EVENTS_2026
  ];

  let html = `
    <div style="
      display:flex;
      gap:12px;
      overflow-x:auto;
      padding-bottom:10px;
    ">
  `;

  events.forEach(event => {

    if (event.start > maxFuture) return;

    let status = "";
    let color = "#3b82f6";

    if (now >= event.start && now <= event.end) {
      status = "AKTIV";
      color = "#22c55e";
    } else {
      const days = daysBetween(now, event.start);
      status = `Startet in ${days} Tagen`;
      color = "#facc15";
    }

    html += `
      <div style="
        min-width:220px;
        padding:12px 18px;
        border-radius:12px;
        background:rgba(30,41,59,0.8);
        border:1px solid rgba(255,255,255,0.08);
        box-shadow:0 5px 20px rgba(0,0,0,0.4);
      ">
        <div style="font-weight:bold; margin-bottom:6px;">
          ${event.name}
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
