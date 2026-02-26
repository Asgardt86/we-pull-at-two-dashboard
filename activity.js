/* ------------------ GUILD ACTIVITY FEED ------------------ */

async function loadActivity() {
  try {
    const res = await fetch("/api/activity");
    const data = await res.json();

    let html = `<h2>Gilden Aktivität</h2>`;

    data.activities.forEach(item => {
      html += `
        <div style="
          padding:10px 0;
          border-bottom:1px solid rgba(255,255,255,0.06);
          font-size:13px;
        ">
          <div>${item.description}</div>
          <div style="color:#9ca3af; font-size:11px;">
            ${item.time}
          </div>
        </div>
      `;
    });

    document.getElementById("activity").innerHTML = html;

  } catch (error) {
    console.error("Activity Fehler:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadActivity);
