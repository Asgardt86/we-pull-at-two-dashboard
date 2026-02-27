async function loadMythicHOF() {
  try {

    const guildRes = await fetch(
      "https://raider.io/api/v1/guilds/roster?region=eu&realm=blackrock&name=We%20Pull%20at%20Two"
    );

    const guildData = await guildRes.json();

    if (!guildData.members) {
      document.getElementById("mythic-hof").innerHTML =
        `<h2>Mythic+ Hall of Fame</h2><p>Keine Daten verfügbar</p>`;
      return;
    }

    // Nur Level 80
    const level80 = guildData.members
      .filter(m => m.character.level === 80);

    // Scores direkt aus Roster nutzen
    const players = level80
      .map(m => ({
        name: m.character.name,
        class: m.character.class,
        role: m.character.role,
        seasonScore: m.character.mythic_plus_scores_by_season?.[0]?.scores?.all || 0,
        allTimeScore: m.character.mythic_plus_scores?.all || 0
      }))
      .filter(p => p.seasonScore > 0 || p.allTimeScore > 0)
      .sort((a, b) => {
        const aScore = a.seasonScore > 0 ? a.seasonScore : a.allTimeScore;
        const bScore = b.seasonScore > 0 ? b.seasonScore : b.allTimeScore;
        return bScore - aScore;
      })
      .slice(0, 10);

    if (players.length === 0) {
      document.getElementById("mythic-hof").innerHTML =
        `<h2>Mythic+ Hall of Fame</h2><p>Noch keine Mythic+ Daten</p>`;
      return;
    }

    let html = `<h2>Mythic+ Hall of Fame</h2>`;

    players.forEach((player, index) => {

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
