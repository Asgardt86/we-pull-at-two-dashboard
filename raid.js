function renderBar(label, completed, total, color, glow, muted = false) {
  const percent = total === 0 ? 0 : (completed / total) * 100;

  return `
    <div style="margin-bottom:14px;">
      <div style="
        display:flex;
        justify-content:space-between;
        font-size:12px;
        margin-bottom:6px;
        letter-spacing:0.5px;
        text-transform:uppercase;
        opacity:${muted ? "0.6" : "0.85"};
      ">
        <span>${label}</span>
        <span>${completed} / ${total}</span>
      </div>
      <div style="
        width:100%;
        height:8px;
        background:rgba(0,0,0,0.6);
        border:1px solid ${muted ? "rgba(192,192,192,0.2)" : "rgba(255,215,0,0.15)"};
        border-radius:8px;
        overflow:hidden;
      ">
        <div style="
          height:100%;
          width:${percent}%;
          background:${muted ? "#9ca3af" : `linear-gradient(90deg, ${color}, ${glow})`};
          border-radius:8px;
          box-shadow:${muted ? "none" : `0 0 10px ${glow}`};
          transition:width 0.8s ease;
        "></div>
      </div>
    </div>
  `;
}

function renderRaidPanel(title, raids, isCurrent = true) {
  let html = `
    <div style="
      background:rgba(10,15,25,0.6);
      border:1px solid ${isCurrent ? "rgba(255,215,0,0.15)" : "rgba(180,180,180,0.15)"};
      border-radius:14px;
      padding:20px;
      margin-bottom:30px;
    ">
      <h2 style="
        margin-top:0;
        margin-bottom:20px;
        font-size:17px;
        letter-spacing:1px;
        text-transform:uppercase;
        color:${isCurrent ? "#d4af37" : "#cbd5e1"};
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
        margin-bottom:22px;
        padding-bottom:16px;
        border-bottom:1px solid rgba(255,255,255,0.05);
      ">
        <div style="
          font-weight:bold;
          font-size:14px;
          margin-bottom:10px;
          color:${isCurrent ? "#f3f4f6" : "#d1d5db"};
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
      html += renderBar("Mythic", raid.mythic.completed, raid.mythic.total, "#7c3aed", "#c084fc", !isCurrent);
      html += renderBar("Heroic", raid.heroic.completed, raid.heroic.total, "#ea580c", "#fb923c", !isCurrent);
      html += renderBar("Normal", raid.normal.completed, raid.normal.total, "#16a34a", "#4ade80", !isCurrent);
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

    html += renderRaidPanel("Raid Progress – Aktuell", data.current, true);

    if (data.previous.length > 0) {
      html += renderRaidPanel("Frühere Raid Progress", data.previous, false);
    }

    document.getElementById("raid").innerHTML = html;

  } catch (error) {
    document.getElementById("raid").innerHTML =
      `<h2>Raid Progress</h2><p>Fehler beim Laden</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadRaid);
