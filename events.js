const EVENT_IMAGES = {
  "Dunkelmond-Jahrmarkt":
    "https://wow.zamimg.com/uploads/screenshots/normal/944695-darkmoon-faire.jpg",
  "Mondfest":
    "https://wow.zamimg.com/uploads/screenshots/normal/908610-lunar-festival.jpg",
  "Noblegarten":
    "https://wow.zamimg.com/uploads/screenshots/normal/1000885-noblegarden.jpg",
  "Winterhauchfest":
    "https://wow.zamimg.com/uploads/screenshots/normal/820353-feast-of-winter-veil.jpg"
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

  const active = filtered.find(e => e.active);
  const others = filtered.filter(e => !e.active);

  let html = `
    <div style="
      display:grid;
      grid-template-columns:${active ? "2fr 1fr 1fr" : "1fr 1fr 1fr"};
      gap:20px;
    ">
  `;

  function renderEvent(event, large = false) {
    const image = EVENT_IMAGES[event.name];

    return `
      <div style="
        position:relative;
        border-radius:16px;
        overflow:hidden;
        height:${large ? "180px" : "140px"};
        background-image:url('${image}');
        background-size:cover;
        background-position:center;
        box-shadow:0 10px 30px rgba(0,0,0,0.6);
      ">

        <div style="
          position:absolute;
          inset:0;
          background:linear-gradient(
            to top,
            rgba(0,0,0,0.85),
            rgba(0,0,0,0.4)
          );
          display:flex;
          flex-direction:column;
          justify-content:flex-end;
          padding:18px;
        ">

          <div style="
            font-weight:bold;
            font-size:${large ? "18px" : "14px"};
            color:#d4af37;
            margin-bottom:6px;
          ">
            ${event.name}
          </div>

          <div style="
            font-size:12px;
            color:#e5e7eb;
          ">
            ${event.countdown}
          </div>

        </div>
      </div>
    `;
  }

  if (active) {
    html += renderEvent(active, true);
  }

  others.slice(0, active ? 2 : 3).forEach(e => {
    html += renderEvent(e, false);
  });

  html += `</div>`;

  container.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", loadEvents);
