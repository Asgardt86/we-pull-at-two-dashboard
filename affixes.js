function getResetCountdown() {
  const now = new Date();

  const reset = new Date();
  reset.setUTCHours(6, 0, 0, 0); // 08:00 CET = 06:00 UTC

  const day = reset.getUTCDay();
  const diff = (3 - day + 7) % 7; // Mittwoch = 3

  reset.setUTCDate(reset.getUTCDate() + diff);

  if (reset < now) {
    reset.setUTCDate(reset.getUTCDate() + 7);
  }

  const diffMs = reset - now;

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);

  return `${days} Tage ${hours} Std`;
}

async function loadAffixes() {
  try {
    const res = await fetch("/api/affixes");
    const data = await res.json();

    let html = `<h2>Mythic+ Affixe</h2>`;

    if (!data.active) {
      html += `<p style="color:#9ca3af;">${data.message}</p>`;
      document.getElementById("affixes").innerHTML = html;
      return;
    }

    html += `<div style="display:flex; flex-wrap:wrap; gap:15px;">`;

    data.affixes.forEach(affix => {
      html += `
        <div style="
          width:80px;
          text-align:center;
          cursor:default;
        " title="${affix.description}">
          <img src="https://render.worldofwarcraft.com/eu/icons/56/${affix.icon}.jpg"
               style="width:56px; height:56px; border-radius:8px;">
          <div style="font-size:12px; margin-top:6px;">
            ${affix.name}
          </div>
        </div>
      `;
    });

    html += `</div>`;

    html += `
      <div style="margin-top:15px; font-size:12px; color:#9ca3af;">
        Reset in ${getResetCountdown()}
      </div>
    `;

    document.getElementById("affixes").innerHTML = html;

  } catch (error) {
    document.getElementById("affixes").innerHTML =
      `<h2>Mythic+ Affixe</h2><p>Fehler beim Laden</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadAffixes);
