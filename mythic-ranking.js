async function loadMythicRanking() {
  try {
    const res = await fetch("/api/mythic-ranking");
    const data = await res.json();

    let html = `<h2>Mythic+ Guild Ranking</h2>`;

    if (data.empty) {
      html += `<p style="color:#9ca3af;">Noch kein Mythic+ Ranking verfügbar</p>`;
    } else {
      html += `
        <div style="font-size:14px; line-height:1.8;">
          🗝 Guild Score: <strong>${data.score}</strong><br>
          🌍 World Rank: <strong>${data.world ?? "-"}</strong><br>
          🇪🇺 EU Rank: <strong>${data.region ?? "-"}</strong><br>
          🏰 Realm Rank: <strong>${data.realm ?? "-"}</strong>
        </div>
      `;
    }

    document.getElementById("mythic").innerHTML = html;

  } catch (error) {
    console.error("Mythic Ranking Fehler:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadMythicRanking);
