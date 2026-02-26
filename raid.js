async function loadRaid() {
  try {
    const res = await fetch("/api/raid");
    const data = await res.json();

    let html = `<h2>Raid Progress – Midnight Season 1</h2>`;

    if (!data.raids || data.raids.length === 0) {
      html += `<p style="color:#9ca3af;">Noch kein Raid-Progress verfügbar</p>`;
    } else {
      data.raids.forEach(raid => {

        const renderBar = (label, completed, total) => {
          const percent = total === 0 ? 0 : (completed / total) * 100;

          return `
            <div style="margin-bottom:10px;">
              <div style="display:flex; justify-content:space-between; font-size:13px;">
                <span>${label}</span>
                <span>${completed} / ${total}</span>
              </div>
              <div style="width:100%; height:8px; background:rgba(255,255,255,0.08); border-radius:6px;">
                <div style="width:${percent}%; height:100%; background:#22c55e;"></div>
              </div>
            </div>
          `;
        };

        html += `
          <div style="margin-top:15px; font-weight:bold;">${raid.name}</div>
          ${renderBar("Mythic", raid.mythic.completed, raid.mythic.total)}
          ${renderBar("Heroic", raid.heroic.completed, raid.heroic.total)}
          ${renderBar("Normal", raid.normal.completed, raid.normal.total)}
        `;
      });
    }

    document.getElementById("raid").innerHTML = html;

  } catch (err) {
    console.error("Raid Fehler:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadRaid);
