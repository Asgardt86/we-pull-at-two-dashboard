/* ------------------ CLASS DISTRIBUTION ------------------ */

function renderClassBar(name, count, total) {
  const percent = (count / total) * 100;

  return `
    <div style="margin-bottom:10px;">
      <div style="display:flex; justify-content:space-between; font-size:13px;">
        <span>${name}</span>
        <span>${count}</span>
      </div>
      <div style="
        width:100%;
        height:8px;
        background:rgba(255,255,255,0.08);
        border-radius:6px;
        overflow:hidden;
      ">
        <div style="
          width:${percent}%;
          height:100%;
          background:linear-gradient(90deg,#60a5fa,#2563eb);
        "></div>
      </div>
    </div>
  `;
}

async function loadClasses() {
  try {
    const res = await fetch("/api/classes");
    const data = await res.json();

    const entries = Object.entries(data.classes);

    // Sortieren nach Anzahl
    entries.sort((a, b) => b[1] - a[1]);

    let html = `<h2>Klassenverteilung</h2>`;

    entries.forEach(([className, count]) => {
      html += renderClassBar(className, count, data.total);
    });

    document.getElementById("classes").innerHTML = html;

  } catch (error) {
    console.error("Klassen Fehler:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadClasses);
