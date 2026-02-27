async function loadMythicHOF() {
  try {

    const res = await fetch("/api/mythic-hof");
    const data = await res.json();

    if (!data.players || data.players.length === 0) {
      document.getElementById("mythic-hof").innerHTML =
        `<h2>Mythic+ Hall of Fame</h2><p>Noch keine Mythic+ Daten</p>`;
      return;
    }

    const CLASS_COLORS = {
      1: "#C79C6E",
      2: "#F58CBA",
      3: "#ABD473",
      4: "#FFF569",
      5: "#FFFFFF",
      6: "#C41F3B",
      7: "#0070DE",
      8: "#69CCF0",
      9: "#9482C9",
      10:"#00FF96",
      11:"#FF7D0A",
      12:"#A330C9",
      13:"#33937F"
    };

    let html = `<h2>Mythic+ Hall of Fame</h2>`;

    data.players.forEach((player, index) => {

      let medal = "";
      if (index === 0) medal = "🥇";
      else if (index === 1) medal = "🥈";
      else if (index === 2) medal = "🥉";
      else medal = `#${index + 1}`;

      const color = CLASS_COLORS[player.classId] || "#ffffff";

      const glow = index === 0
        ? "box-shadow: 0 0 15px rgba(212,175,55,0.5);"
        : "";

      html += `
        <div style="
          margin-bottom:16px;
          padding:12px;
          border-radius:12px;
          background: rgba(255,255,255,0.04);
          ${glow}
        ">
          <div style="font-weight:600; font-size:15px; color:${color};">
            ${medal} ${player.name}
          </div>

          <div style="
            font-size:18px;
            color:var(--wow-gold);
            font-weight:700;
            margin-top:4px;
          ">
            ${player.seasonScore.toFixed(0)}
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
