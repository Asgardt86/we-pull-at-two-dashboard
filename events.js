async function loadEvents() {
  try {
    const res = await fetch("/api/events");
    const data = await res.json();

    let html = `<div style="margin-bottom:25px;">`;

    // Aktive Events
    data.active.forEach(event => {
      html += `
        <div style="
          padding:14px 18px;
          margin-bottom:10px;
          border-radius:12px;
          background:rgba(0,128,0,0.15);
          border:1px solid rgba(0,255,0,0.25);
        ">
          <div style="color:#22c55e; font-weight:600;">
            ${event.name}
          </div>
          <div style="font-size:12px; color:#9ca3af;">
            Aktiv bis ${new Date(event.end).toLocaleDateString("de-DE")}
          </div>
        </div>
      `;
    });

    // Nächste Events
    data.upcoming.forEach(event => {
      html += `
        <div style="
          padding:14px 18px;
          margin-bottom:10px;
          border-radius:12px;
          background:rgba(212,175,55,0.08);
          border:1px solid rgba(212,175,55,0.2);
        ">
          <div style="color:var(--wow-gold); font-weight:600;">
            ${event.name}
          </div>
          <div style="font-size:12px; color:#9ca3af;">
            ${new Date(event.start).toLocaleDateString("de-DE")} – 
            ${new Date(event.end).toLocaleDateString("de-DE")}
          </div>
        </div>
      `;
    });

    html += `</div>`;

    document.getElementById("event-bar").innerHTML = html;

  } catch (error) {
    document.getElementById("event-bar").innerHTML = "";
  }
}

document.addEventListener("DOMContentLoaded", loadEvents);
