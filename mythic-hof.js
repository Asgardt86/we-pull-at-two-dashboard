async function loadMythicHOF() {
  try {
    const res = await fetch("/api/mythic-hof");
    const data = await res.json();

    if (data.empty || !data.players) {
      document.getElementById("mythic-hof").innerHTML =
        `<h2>Mythic+ Hall of Fame</h2><p>Keine Daten verfügbar</p>`;
      return;
    }

    let html = `<h2>Mythic+ Hall of Fame</h2>`;

    data.players.forEach((player, index) => {

      let medal = "";
      if (index === 0) medal = "🥇";
      else if (index === 1) medal = "🥈";
      else if (index === 2) medal = "🥉";
      else medal = `#${index + 1}`;

      html += `
        <div style="
          margin-bottom:14px;
          padding:10px;
          border-radius:10px;
          background: rgba(255,255,255,0.03);
        ">
          <div style="font-weight:600;">
            ${medal} ${player.name}
          </div>

          <div style="font-size:14px; color:var(--wow-gold);">
            Season: ${player.seasonScore.toFixed(1)}
          </div>

          <div style="font-size:12px; color:#9ca3af;">
            All-Time: ${player.allTimeScore.toFixed(1)}
          </div>

          ${
            player.bestRun
              ? `<div style="font-size:12px; color:#9ca3af;">
                   Best: +${player.bestRun.mythic_level} ${player.bestRun.dungeon}
                 </div>`
              : ""
          }
        </div>
      `;
    });

    document.getElementById("mythic-hof").innerHTML = html;

  } catch (error) {
    document.getElementById("mythic-hof").innerHTML =
      `<h2>Mythic+ Hall of Fame</h2><p>Fehler beim Laden</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadMythicHOF);
