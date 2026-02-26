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

function loadEvents() {

  const now = new Date();
  const year = now.getFullYear();

  function createEvent(name, start, end) {
    const isActive = now >= start && now <= end;
    const diff = start - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return {
      name,
      active: isActive,
      countdown: isActive ? "Aktiv" : `Startet in ${days} Tagen`,
      start,
      end
    };
  }

  const events = [

    createEvent(
      "Dunkelmond-Jahrmarkt",
      new Date(year, now.getMonth() + 1, 1),
      new Date(year, now.getMonth() + 1, 7)
    ),

    createEvent(
      "Mondfest",
      new Date(year, 1, 16),
      new Date(year, 2, 2)
    ),

    createEvent(
      "Noblegarten",
      new Date(year, 3, 1),
      new Date(year, 3, 7)
    ),

    createEvent(
      "Winterhauchfest",
      new Date(year, 11, 16),
      new Date(year, 11, 31)
    )

  ];

  const filtered = events
    .filter(e => e.active || (e.start - now) < 60 * 24 * 60 * 60 * 1000)
    .sort((a, b) => a.start - b.start)
    .slice(0, 3);

  const container = document.getElementById("event-bar");

  if (filtered.length === 0) {
    container.innerHTML = "";
    return;
  }

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
        border:1px solid ${event.active ? "#16a34a" : "rgba(255,255,255,0.08)"};
        border-radius:12px;
        padding:12px 16px;
        min-width:220px;
        max-width:320px;
        flex:1;
        box-shadow:${event.active ? "0 0 12px rgba(34,197,94,0.4)" : "0 5px 15px rgba(0,0,0,0.5)"};
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
            color:${event.active ? "#16a34a" : "#d4af37"};
            margin-bottom:3px;
          ">
            ${event.name}
          </div>

          <div style="
            font-size:${event.active ? "14px" : "13px"};
            color:${event.active ? "#22c55e" : "#cbd5e1"};
            font-weight:${event.active ? "bold" : "normal"};
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

document.addEventListener("DOMContentLoaded", loadEvents);
