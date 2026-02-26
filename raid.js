function renderBar(label, completed, total, color, glow) {
  const percent = total === 0 ? 0 : (completed / total) * 100;

  return `
    <div style="margin-bottom:14px;">
      <div style="
        display:flex;
        justify-content:space-between;
        font-size:13px;
        margin-bottom:6px;
        letter-spacing:0.5px;
        text-transform:uppercase;
        opacity:0.85;
      ">
        <span>${label}</span>
        <span>${completed} / ${total}</span>
      </div>
      <div style="
        width:100%;
        height:10px;
        background:rgba(0,0,0,0.6);
        border:1px solid rgba(255,215,0,0.15);
        border-radius:8px;
        overflow:hidden;
        box-shadow: inset 0 0 6px rgba(0,0,0,0.8);
      ">
        <div style="
          height:100%;
          width:${percent}%;
          background:linear-gradient(90deg, ${color}, ${glow});
          border-radius:8px;
          box-shadow:0 0 10px ${glow};
          transition:width 0.8s ease;
        "></div>
      </div>
    </div>
  `;
}

function renderRaidPanel(title, raids) {
  let html = `
    <div style="
      background:rgba(10,15,25,0.6);
      border:1px solid rgba(255,215,0,0.15);
      border-radius:14px;
      padding:20px;
      margin-bottom:30px;
      box-shadow:
        0 0 20px rgba(0,0,0,0.6),
        inset 0 0 20px rgba(255,215,0,0.03);
    ">
      <h2 style="
        margin-top:0;
        margin-bottom:20px;
        font-size:18px;
        letter-spacing:1px;
        text-transform:uppercase;
        color:#d4af37;
      ">
        ${title}
      </h2>
  `;

  raids.forEach(raid => {

    const allZero =
      raid.mythic.completed === 0 &&
      raid.heroic.completed === 0 &&
      raid.normal.completed === 0;

    html += `
      <div style="
        margin-bottom:28px;
        padding-bottom:18px;
        border-bottom:1px solid rgba(255,255,255,0.05);
      ">
        <div style="
          font-weight:bold;
          font-size:15px;
          margin-bottom:10px;
          color:#f3f4f6;
          letter-spacing:0.5px;
        ">
          ${raid.name}
        </div>
    `;

    if (allZero) {
      html += `
        <div style="
          color:#9ca3af;
          font-size:13px;
          font-style:italic;
        ">
          Noch kein Progress vorhanden
        </div>
      `;
    } else {
      html += renderBar("Mythic", raid.mythic.completed, raid.mythic.total, "#7c3aed", "#c084fc");
      html += renderBar("Heroic", raid.heroic.completed, raid.heroic.total, "#ea580c", "#fb923c");
      html += renderBar("Normal", raid.normal.completed, raid.normal.total, "#16a34a", "#4ade80");
    }

    html += `</div>`;
  });

  html += `</div>`;
  return html;
}

async function loadRaid() {
  try {
    const res = await fetch("/api/raid");
    const data = await res.json();

    let html = "";

    html += renderRaidPanel("Raid Progress – Aktuell", data.current);

    if (data.previous.length > 0) {
      html += renderRaidPanel("Frühere Raid Progress", data.previous);
    }

    document.getElementById("raid").innerHTML = html;

  } catch (error) {
    document.getElementById("raid").innerHTML =
      `<h2>Raid Progress</h2><p>Fehler beim Laden</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadRaid);
