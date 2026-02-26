async function loadActivity() {
  try {
    const [activityRes, guildAchRes] = await Promise.all([
      fetch("/api/activity"),
      fetch("/api/guild-achievements")
    ]);

    const activityData = await activityRes.json();
    const guildAchData = await guildAchRes.json();

    let html = `<h2>Gilden Aktivität</h2>`;

    /* ------------------ Charakter Aktivität ------------------ */

    if (activityData.activities && activityData.activities.length > 0) {

      html += `<div style="margin-bottom:20px;">`;

      activityData.activities.slice(0,5).forEach(entry => {
        html += `
          <div style="margin-bottom:8px; font-size:13px;">
            ${entry.description}
            <div style="color:#9ca3af; font-size:11px;">
              ${entry.time}
            </div>
          </div>
        `;
      });

      html += `</div>`;
    }

    /* ------------------ Gildenerfolge ------------------ */

    if (guildAchData.achievements && guildAchData.achievements.length > 0) {

      html += `
        <div style="
          border-top:1px solid rgba(212,175,55,0.25);
          padding-top:15px;
        ">
          <div style="
            font-weight:600;
            color:#d4af37;
            margin-bottom:10px;
            font-size:14px;
          ">
            🛡 Letzte Gildenerfolge
          </div>
      `;

      guildAchData.achievements.forEach(a => {

        const date = new Date(a.timestamp);
        const formatted = date.toLocaleDateString("de-DE");

        html += `
          <div style="margin-bottom:6px; font-size:13px;">
            ${a.name}
            <div style="color:#9ca3af; font-size:11px;">
              ${formatted}
            </div>
          </div>
        `;
      });

      html += `</div>`;
    }

    document.getElementById("activity").innerHTML = html;

  } catch (error) {
    document.getElementById("activity").innerHTML =
      `<h2>Gilden Aktivität</h2><p>Fehler beim Laden</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadActivity);
