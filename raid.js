function renderBar(label, completed, total, color) {
  const percent = total === 0 ? 0 : (completed / total) * 100;

  return `
    <div style="margin-bottom:10px;">
      <div style="
        display:flex;
        justify-content:space-between;
        font-size:13px;
        margin-bottom:4px;
        opacity:0.9;
      ">
        <span>${label}</span>
        <span>${completed} / ${total}</span>
      </div>
      <div style="
        width:100%;
        height:8px;
        background:rgba(255,255,255,0.08);
        border-radius:6px;
        overflow:hidden;
      ">
        <div style="
          height:100%;
          width:${percent}%;
          background:${color};
          border-radius:6px;
          transition:width 0.6s ease;
        "></div>
      </div>
    </div>
  `;
}

async function loadRaid() {
  try {
    const res = await fetch("/api/raid");
    const data = await res.json();

    let html = "";

    // 🟢 Aktuelle Raids
    html += `<h2>Raid Progress – Aktuell</h2>`;

    data.current.forEach(raid => {

      const allZero =
        raid.mythic.completed === 0 &&
        raid.heroic.completed === 0 &&
        raid.normal.completed === 0;

      html += `<div style="margin-bottom:25px;">`;
      html += `<div style="font-weight:bold; margin-bottom:8px;">${raid.name}</div>`;

      if (allZero) {
        html += `
          <div style="color:#9ca3af; font-size:13px;">
            Noch kein Progress vorhanden
          </div>
        `;
      } else {
        html += renderBar("Mythic", raid.mythic.completed, raid.mythic.total, "#a855f7");
        html += renderBar("Heroic", raid.heroic.completed, raid.heroic.total, "#f97316");
        html += renderBar("Normal", raid.normal.completed, raid.normal.total, "#22c55e");
      }

      html += `</div>`;
    });

    // 🔵 Frühere Raids
    if (data.previous.length > 0) {

      html += `<hr style="margin:25px 0; opacity:0.2;">`;
      html += `<h2>Frühere Raid Progress</h2>`;

      data.previous.forEach(raid => {

        html += `<div style="margin-bottom:25px;">`;
        html += `<div style="font-weight:bold; margin-bottom:8px;">${raid.name}</div>`;

        html += renderBar("Mythic", raid.mythic.completed, raid.mythic.total, "#a855f7");
        html += renderBar("Heroic", raid.heroic.completed, raid.heroic.total, "#f97316");
        html += renderBar("Normal", raid.normal.completed, raid.normal.total, "#22c55e");

        html += `</div>`;
      });
    }

    document.getElementById("raid").innerHTML = html;

  } catch (error) {
    document.getElementById("raid").innerHTML =
      `<h2>Raid Progress</h2><p>Fehler beim Laden</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadRaid);
