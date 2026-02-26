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

async function loadEvents() {
  const res = await fetch("/api/events");
  const events = await res.json();

  const container = document.getElementById("event-bar");

  if (!events || events.length === 0) {
    container.innerHTML = "";
    return;
  }

  // Aktives Event zuerst
  const active = events.find(e => e.active);
  const upcoming = events.filter(e => !e.active).slice(0, 2);

  let html = `
    <div style="
      display:grid;
      grid-template-columns: ${active ? "2fr 1fr 1fr" : "1fr 1fr 1fr"};
      gap:20px;
    ">
  `;

  function renderEvent(event, large = false) {
    const image = EVENT_IMAGES[event.name] || 
      "https://wow.zamimg.com/uploads/screenshots/normal/928382-world-of-warcraft-shadowlands.jpg";

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
            ${event.active ? "Aktiv" : event.countdown}
          </div>

        </div>
      </div>
    `;
  }

  if (active) {
    html += renderEvent(active, true);
  }

  upcoming.forEach(e => {
    html += renderEvent(e, false);
  });

  html += `</div>`;

  container.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", loadEvents);
