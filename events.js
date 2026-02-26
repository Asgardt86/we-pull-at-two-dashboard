const EVENT_ICONS = {
  "Dunkelmond-Jahrmarkt":
    "https://wow.zamimg.com/images/wow/icons/large/inv_misc_ticket_darkmoon_01.jpg",
  "Mondfest":
    "https://wow.zamimg.com/images/wow/icons/large/inv_misc_elvencoins.jpg",
  "Noblegarten":
    "https://wow.zamimg.com/images/wow/icons/large/inv_egg_03.jpg",
  "Winterhauchfest":
    "https://wow.zamimg.com/images/wow/icons/large/inv_holiday_christmas_present_01.jpg"
};

function formatDate(date) {
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit"
  });
}

// 🔥 1. Sonntag im Monat berechnen
function getFirstSunday(year, month) {
  const date = new Date(year, month, 1);
  while (date.getDay() !== 0) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

function getDarkmoonDates(now) {
  const year = now.getFullYear();
  const month = now.getMonth();

  const start = getFirstSunday(year, month);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  if (now > end) {
    const nextMonth = new Date(year, month + 1, 1);
    const nextStart = getFirstSunday(nextMonth.getFullYear(), nextMonth.getMonth());
    const nextEnd = new Date(nextStart);
    nextEnd.setDate(nextStart.getDate() + 6);
    return { start: nextStart, end: nextEnd };
  }

  return { start, end };
}

function getLiveCountdown(targetDate) {
  const now = new Date();
  const diff = targetDate - now;

  if (diff <= 0) return "Aktiv";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  return `${days}T ${hours}h ${minutes}m`;
}

function loadEvents() {

  const now = new Date();
  const year = now.getFullYear();

  const darkmoon = getDarkmoonDates(now);

  const events = [

    {
      name: "Dunkelmond-Jahrmarkt",
      start: darkmoon.start,
      end: darkmoon.end
    },

    {
      name: "Mondfest",
      start: new Date(year, 1, 16),
      end: new Date(year, 2, 2)
    },

    {
      name: "Noblegarten",
      start: new Date(year, 3, 1),
      end: new Date(year, 3, 7)
    },

    {
      name: "Winterhauchfest",
      start: new Date(year, 11, 16),
      end: new Date(year, 11, 31)
    }

  ];

  const processed = events.map(e => {
    const isActive = now >= e.start && now <= e.end;

    return {
      ...e,
      active: isActive,
      countdown: isActive ? "Aktiv" : getLiveCountdown(e.start)
    };
  });

  const filtered = processed
    .filter(e => e.active || (e.start - now) < 60 * 24 * 60 * 60 * 1000)
    .sort((a, b) => a.start - b.start)
    .slice(0, 3);

  const container = document.getElementById("event-bar");

  let html = `
    <div style="
      display:flex;
      gap:16px;
      justify-content:center;
      flex-wrap:wrap;
      max-width:1000px;
      margin:0 auto;
    ">
  `;

  filtered.forEach(event => {

    const icon = EVENT_ICONS[event.name];
    const dateText = `${formatDate(event.start)} – ${formatDate(event.end)}`;

    html += `
      <div style="
        display:flex;
        align-items:center;
        gap:12px;
        background:rgba(15,23,42,0.85);
        border:1px solid ${event.active ? "#22c55e" : "rgba(255,255,255,0.08)"};
        border-radius:12px;
        padding:12px 16px;
        min-width:220px;
        max-width:320px;
        flex:1;
        box-shadow:${event.active ? "0 0 18px rgba(34,197,94,0.5)" : "0 5px 15px rgba(0,0,0,0.5)"};
        animation:${event.active ? "pulse 2.5s infinite" : "none"};
      ">

        <img src="${icon}" style="
          width:${event.active ? "58px" : "46px"};
          height:${event.active ? "58px" : "46px"};
          border-radius:6px;
          box-shadow:0 0 6px rgba(0,0,0,0.7);
        ">

        <div>
          <div style="
            font-weight:bold;
            font-size:${event.active ? "16px" : "14px"};
            color:${event.active ? "#22c55e" : "#d4af37"};
            margin-bottom:3px;
          ">
            ${event.name}
          </div>

          <div style="
            font-size:14px;
            color:${event.active ? "#22c55e" : "#cbd5e1"};
            font-weight:bold;
            margin-bottom:3px;
          ">
            ${event.countdown}
          </div>

          <div style="
            font-size:12px;
            color:#9ca3af;
            opacity:0.85;
          ">
            ${dateText}
          </div>
        </div>

      </div>
    `;
  });

  html += `</div>`;

  container.innerHTML = html;
}

// 🔥 Pulse Animation
const style = document.createElement("style");
style.innerHTML = `
@keyframes pulse {
  0% { box-shadow: 0 0 10px rgba(34,197,94,0.3); }
  50% { box-shadow: 0 0 22px rgba(34,197,94,0.6); }
  100% { box-shadow: 0 0 10px rgba(34,197,94,0.3); }
}
`;
document.head.appendChild(style);

loadEvents();
setInterval(loadEvents, 60000);
