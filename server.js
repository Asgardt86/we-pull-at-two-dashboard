/* ------------------ SERVER STATUS FRONTEND ------------------ */

async function loadServerStatus() {
  try {
    const res = await fetch("/api/server");
    const data = await res.json();

    const isOnline = data.status === "UP";

    const html = `
      <div style="
        margin-bottom:20px;
        padding:14px 20px;
        border-radius:14px;
        background:rgba(30,41,59,0.7);
        border:1px solid rgba(255,255,255,0.08);
        box-shadow:0 5px 20px rgba(0,0,0,0.4);
        text-align:center;
        font-size:15px;
      ">
        🌍 Realm Status – ${data.name}: 
        <strong style="color:${isOnline ? "#22c55e" : "#ef4444"};">
          ${isOnline ? "Online" : "Offline"}
        </strong>
      </div>
    `;

    document.getElementById("server-status").innerHTML = html;

  } catch (error) {
    console.error("Server Status Fehler:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadServerStatus);
