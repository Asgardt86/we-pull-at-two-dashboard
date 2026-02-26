async function loadMythicRanking() {
  try {
    const res = await fetch("/api/mythic-ranking");
    const data = await res.json();

    let html = `<h2>Mythic+ Ranking</h2>`;

    if (data.empty) {
      html += `
        <p style="color:#9ca3af;">
          Noch kein Mythic+ Ranking verfügbar
        </p>
      `;
    } else {
      html += `
        <div style="font-size:14px; line-height:1.8;">
          🗝 Guild Score:
          <span style="color:var(--wow-gold); font-weight:600;">
            ${data.score ?? "-"}
          </span><br>

          🌍 World Rank:
          <span style="color:var(--wow-gold); font-weight:600;">
            ${data.world ?? "-"}
          </span><br>

          🇪🇺 EU Rank:
          <span style="color:var(--wow-gold); font-weight:600;">
            ${data.region ?? "-"}
          </span><br>

          🏰 Realm Rank:
          <span style="color:var(--wow-gold); font-weight:600;">
            ${data.realm ?? "-"}
          </span>
        </div>
      `;
    }

    document.getElementById("mythic").innerHTML = html;

  } catch (err) {
    document.getElementById("mythic").innerHTML =
      `<h2>Mythic+ Ranking</h2><p style="color:#ef4444;">Fehler beim Laden</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadMythicRanking);
