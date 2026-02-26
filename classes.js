/* ------------------ CLASS DISTRIBUTION WOW STYLE ------------------ */

function renderClassRow(classData, total) {
  const percent = (classData.count / total) * 100;

  const iconUrl = `https://render.worldofwarcraft.com/eu/icons/56/class_${classData.icon}.jpg`;

  return `
    <div style="margin-bottom:14px;">
      <div style="display:flex; align-items:center; justify-content:space-between; font-size:14px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="${iconUrl}" 
               style="width:24px; height:24px; border-radius:4px;">
          <span style="color:${classData.color}; font-weight:600;">
            ${classData.name}
          </span>
        </div>
        <span>${classData.count}</span>
      </div>
      <div style="
        width:100%;
        height:8px;
        background:rgba(255,255,255,0.08);
        border-radius:6px;
        overflow:hidden;
        margin-top:4px;
      ">
        <div style="
          width:${percent}%;
          height:100%;
          background:${classData.color};
        "></div>
      </div>
    </div>
  `;
}

async function loadClasses() {
  try {
    const res = await fetch("/api/classes");
    const data = await res.json();

    const sorted = data.classes.sort((a, b) => b.count - a.count);

    let html = `<h2>Klassenverteilung (Level 80)</h2>`;

    sorted.forEach(classData => {
      html += renderClassRow(classData, data.total);
    });

    document.getElementById("classes").innerHTML = html;

  } catch (error) {
    console.error("Klassen Fehler:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadClasses);
