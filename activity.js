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

      html += `
        <div style="margin-bottom:25px;">
          <div style="
            font-weight:600;
            color:var(--wow-silver);
            margin-bottom:10px;
            font-size:14px;
            border-bottom:1px solid rgba(203,213,225,0.25);
            padding-bottom:6px;
          ">
            Charakter Aktivitäten
          </div>
      `;

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
        <div>
          <div style="
            font-weight:600;
            color:var(--wow-silver);
            margin-bottom:10px;
            font-size:14px;
            border-bottom:1px solid rgba(203,213,225,0.25);
            padding-bottom:6px;
          ">
            Gildenerfolge
          </div>
      `;

      guildAchData.achievements.forEach(a => {

        const date = new Date(a.timestamp);
        const formatted = date.toLocaleDateString("de-DE");

        html += `
          <div style="margin-bottom:8px; font-size:13px;">
            🛡 ${a.name}
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
