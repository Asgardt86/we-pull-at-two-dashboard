function renderBar(label, completed, total, type, isCurrent) {

  const percent = total === 0 ? 0 : (completed / total) * 100;
  const isFull = completed === total && total > 0;

  let color;
  let glow = "none";

  if (isCurrent) {
    // 🟢 Aktuelle Raids
    if (type === "mythic") color = "#7c3aed";
    if (type === "heroic") color = "#ea580c";
    if (type === "normal") color = "#16a34a";
    glow = color;
  } else {
    // 🔵 Frühere Raids
    if (isFull) {
      color = "#d4af37";   // Gold
      glow = "#facc15";
    } else {
      color = "#9ca3af";   // Silber
    }
  }

  return `
    <div style="margin-bottom:12px;">
      <div style="
        display:flex;
        justify-content:space-between;
        font-size:12px;
        margin-bottom:5px;
        opacity:0.85;
      ">
        <span>${label}</span>
        <span>${completed} / ${total}</span>
      </div>
      <div style="
        width:100%;
        height:8px;
        background:rgba(0,0,0,0.6);
        border-radius:6px;
        overflow:hidden;
      ">
        <div style="
          height:100%;
          width:${percent}%;
          background:${color};
          border-radius:6px;
          box-shadow:${glow !== "none" ? `0 0 8px ${glow}` : "none"};
          transition:width 0.6s ease;
        "></div>
      </div>
    </div>
  `;
}

function renderRaidPanel(title, raids, isCurrent) {

  let html = `
    <div style="
      margin-bottom:35px;
    ">
      <div style="
        display:inline-block;
        font-weight:bold;
        font-size:16px;
        margin-bottom:18px;
        border-bottom:2px solid ${isCurrent ? "#d4af37" : "#94a3b8"};
        padding-bottom:4px;
        color:${isCurrent ? "#d4af37" : "#cbd5e1"};
      ">
        ${title}
      </div>
  `;

  raids.forEach(raid => {

    const allZero =
      raid.mythic.completed === 0 &&
      raid.heroic.completed === 0 &&
      raid.normal.completed === 0;

    html += `
      <div style="
        margin-bottom:22px;
      ">
        <div style="
          font-weight:bold;
          margin-bottom:8px;
        ">
          ${raid.name}
        </div>
    `;

    if (allZero) {
      html += `
        <div style="
          font-size:13px;
          color:#9ca3af;
          font-style:italic;
        ">
          Noch kein Progress vorhanden
        </div>
      `;
    } else {
      html += renderBar("Mythic", raid.mythic.completed, raid.mythic.total, "mythic", isCurrent);
      html += renderBar("Heroic", raid.heroic.completed, raid.heroic.total, "heroic", isCurrent);
      html += renderBar("Normal", raid.normal.completed, raid.normal.total, "normal", isCurrent);
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
