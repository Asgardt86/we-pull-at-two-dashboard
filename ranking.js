async function loadRanking() {
  try {
    const res = await fetch("/api/ranking");
    const data = await res.json();

    let html = `<h2>Raid Ranking</h2>`;

    if (data.empty) {
      html += `<p style="color:#9ca3af;">Noch kein Ranking verfügbar</p>`;
    } else {
      html += `
        <div style="font-size:14px; line-height:1.8;">
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

    document.getElementById("ranking").innerHTML = html;

  } catch (err) {
    document.getElementById("ranking").innerHTML =
      `<h2>Raid Ranking</h2><p style="color:#ef4444;">Fehler beim Laden</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadRanking);
