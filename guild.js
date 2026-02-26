async function loadGuild() {
  try {
    const res = await fetch("/api/guild");
    const data = await res.json();

    document.getElementById("guild").innerHTML = `
      <h2>Gildenübersicht</h2>
      <div style="display:flex; align-items:center; gap:20px;">
        
        <div style="
          width:70px;
          height:70px;
          border-radius:50%;
          background: rgba(${data.backgroundColor.r}, ${data.backgroundColor.g}, ${data.backgroundColor.b}, 1);
          display:flex;
          align-items:center;
          justify-content:center;
          box-shadow:
            0 0 15px rgba(0,0,0,0.6),
            inset 0 0 10px rgba(0,0,0,0.5);
        ">
          <img src="${data.emblemUrl}" 
               style="
                 width:52px;
                 height:52px;
                 filter:
                   brightness(1.4)
                   contrast(1.4)
                   drop-shadow(0 0 4px rgba(0,0,0,0.8));
               ">
        </div>

        <div>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Realm:</strong> ${data.realm.name}</p>
          <p><strong>Fraktion:</strong> ${data.faction.name}</p>
          <p><strong>Mitglieder:</strong> ${data.member_count}</p>
          <p><strong>Erfolgspunkte:</strong> ${data.achievement_points}</p>
        </div>
      </div>
    `;
  } catch (err) {
    console.error("Guild Fehler:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadGuild);
