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
      start
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
      gap:20px;
      flex-wrap:wrap;
    ">
  `;

  filtered.forEach(event => {

    const icon = EVENT_ICONS[event.name];

    html += `
      <div style="
        display:flex;
        align-items:center;
        gap:14px;
        background:rgba(15,23,42,0.8);
        border:1px solid ${event.active ? "#d4af37" : "rgba(255,255,255,0.08)"};
        border-radius:14px;
        padding:14px 18px;
        min-width:260px;
        flex:1;
        box-shadow:${event.active ? "0 0 12px rgba(212,175,55,0.4)" : "0 5px 15px rgba(0,0,0,0.5)"};
      ">

        <img src="${icon}" style="
          width:${event.active ? "64px" : "48px"};
          height:${event.active ? "64px" : "48px"};
          border-radius:8px;
          box-shadow:0 0 8px rgba(0,0,0,0.7);
        ">

        <div>
          <div style="
            font-weight:bold;
            font-size:${event.active ? "16px" : "14px"};
            color:${event.active ? "#d4af37" : "#e5e7eb"};
            margin-bottom:4px;
          ">
            ${event.name}
          </div>

          <div style="
            font-size:12px;
            color:#9ca3af;
          ">
            ${event.countdown}
          </div>
        </div>

      </div>
    `;
  });

  html += `</div>`;

  container.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", loadEvents);
