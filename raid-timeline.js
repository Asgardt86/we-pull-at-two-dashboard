async function loadRaidTimeline() {
  try {
    const res = await fetch("/api/raid-timeline");
    const data = await res.json();

    const difficulties = [
      { key: "MYTHIC", label: "🟣 Mythic Timeline" },
      { key: "HEROIC", label: "🟠 Heroic Timeline" },
      { key: "NORMAL", label: "🟢 Normal Timeline" }
    ];

    let html = `<h2>Raid Timeline – Midnight</h2>`;
    html += `<div class="timeline-grid">`;

    difficulties.forEach(diff => {
      html += `<div class="timeline-card">`;
      html += `<h3>${diff.label}</h3>`;

      Object.keys(data[diff.key]).forEach(raidName => {
        const raid = data[diff.key][raidName];

        html += `<div style="margin-bottom:15px;">`;
        html += `<div style="font-weight:600; margin-bottom:6px;">${raidName}</div>`;

        const bosses = Object.keys(raid.bosses);

        bosses.forEach((boss, index) => {
          const timestamp = raid.bosses[boss];
          const formatted = timestamp
            ? new Date(timestamp).toLocaleDateString("de-DE")
            : "–";

          const isEndboss = index === bosses.length - 1;

          html += `
            <div class="timeline-boss ${isEndboss ? "timeline-endboss" : ""}">
              <span>${boss}</span>
              <span>${formatted}</span>
            </div>
          `;
        });

        if (raid.daysToClear !== null) {
          html += `
            <div class="timeline-clear">
              ⏱ ${raid.daysToClear} Tage bis Clear
            </div>
          `;
        } else {
          html += `
            <div class="timeline-clear">
              ⏱ Noch nicht vollständig gecleart
            </div>
          `;
        }

        html += `</div>`;
      });

      html += `</div>`;
    });

    html += `</div>`;

    document.getElementById("raid-timeline").innerHTML = html;

  } catch (error) {
    document.getElementById("raid-timeline").innerHTML =
      `<h2>Raid Timeline – Midnight</h2><p>Fehler beim Laden</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadRaidTimeline);
