async function loadRaid() {
  try {
    const res = await fetch("/api/raid");
    const data = await res.json();

    let html = "";

    // 🟢 Aktueller Raid
    html += `<h2>Raid Progress – Aktuell</h2>`;

    data.current.forEach(raid => {

      const allZero =
        raid.mythic.completed === 0 &&
        raid.heroic.completed === 0 &&
        raid.normal.completed === 0;

      if (allZero) {
        html += `
          <div style="margin-bottom:15px;">
            <strong>${raid.name}</strong><br>
            <span style="color:#9ca3af; font-size:13px;">
              Noch kein Progress vorhanden
            </span>
          </div>
        `;
      } else {
        html += `
          <div style="margin-bottom:15px;">
            <strong>${raid.name}</strong>
            <div>Mythic: ${raid.mythic.completed}/${raid.mythic.total}</div>
            <div>Heroic: ${raid.heroic.completed}/${raid.heroic.total}</div>
            <div>Normal: ${raid.normal.completed}/${raid.normal.total}</div>
          </div>
        `;
      }

    });

    // 🔵 Frühere Raids
    if (data.previous.length > 0) {

      html += `<hr style="margin:25px 0; opacity:0.2;">`;
      html += `<h2>Frühere Raid Progress</h2>`;

      data.previous.forEach(raid => {
        html += `
          <div style="margin-bottom:15px;">
            <strong>${raid.name}</strong>
            <div>Mythic: ${raid.mythic.completed}/${raid.mythic.total}</div>
            <div>Heroic: ${raid.heroic.completed}/${raid.heroic.total}</div>
            <div>Normal: ${raid.normal.completed}/${raid.normal.total}</div>
          </div>
        `;
      });

    }

    document.getElementById("raid").innerHTML = html;

  } catch (error) {
    document.getElementById("raid").innerHTML =
      `<h2>Raid Progress</h2><p>Fehler beim Laden</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadRaid);
