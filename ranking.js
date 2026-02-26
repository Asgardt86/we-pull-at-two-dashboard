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
          🌍 World Rank: <strong>${data.world}</strong><br>
          🇪🇺 EU Rank: <strong>${data.region}</strong><br>
          🏰 Realm Rank: <strong>${data.realm}</strong>
        </div>
      `;
    }

    document.getElementById("ranking").innerHTML = html;

  } catch (error) {
    console.error("Ranking Fehler:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadRanking);
