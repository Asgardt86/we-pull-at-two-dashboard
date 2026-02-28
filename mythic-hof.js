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

    let html = `<h2>Mythic+ Hall of Fame -Lvl90-</h2>`;

    data.players.forEach((player, index) => {

      const color = CLASS_COLORS[player.classId] || "#ffffff";
      const isRankOne = index === 0;
      const rankClass = isRankOne ? "rank-1" : "";

      let rankDisplay;
      if (isRankOne) {
        rankDisplay = `<span class="crown">👑</span>`;
      } else if (index === 1) {
        rankDisplay = "🥈";
      } else if (index === 2) {
        rankDisplay = "🥉";
      } else {
        rankDisplay = `#${index + 1}`;
      }

      html += `
        <div class="mplus-card ${rankClass}">
          <div style="font-weight:600; font-size:15px; color:${color}; display:flex; align-items:center;">
            ${rankDisplay} ${player.name}
          </div>

          <div 
            class="score-value"
            data-player="${player.name}"
            data-score="${player.score}"
            style="color:var(--wow-gold);"
          >
            ${player.score}
          </div>
        </div>
      `;
    });

    document.getElementById("mythic-hof").innerHTML = html;

    animateScoreChanges();

  } catch (error) {
    document.getElementById("mythic-hof").innerHTML =
      `<h2>Mythic+ Hall of Fame</h2><p>Fehler beim Laden</p>`;
  }
}


/* Score Animation */

function animateScoreChanges() {

  const scores = document.querySelectorAll(".score-value");

  scores.forEach(el => {

    const player = el.dataset.player;
    const newScore = el.dataset.score;

    const storageKey = "mplus-score-" + player;
    const oldScore = localStorage.getItem(storageKey);

    if (oldScore && oldScore !== newScore) {
      el.classList.add("score-update");

      setTimeout(() => {
        el.classList.remove("score-update");
      }, 900);
    }

    localStorage.setItem(storageKey, newScore);
  });
}

document.addEventListener("DOMContentLoaded", loadMythicHOF);
