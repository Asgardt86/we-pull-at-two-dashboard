import { Buffer } from "buffer";

const CLASS_COLORS = {
  1: "#C79C6E",
  2: "#F58CBA",
  3: "#ABD473",
  4: "#FFF569",
  5: "#FFFFFF",
  6: "#C41F3B",
  7: "#0070DE",
  8: "#69CCF0",
  9: "#9482C9",
  10:"#00FF96",
  11:"#FF7D0A",
  12:"#A330C9",
  13:"#33937F"
};

function timeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `vor ${minutes} Minuten`;
  if (hours < 24) return `vor ${hours} Stunden`;
  return `vor ${days} Tagen`;
}

async function getCharacterClass(accessToken, name) {
  const response = await fetch(
    `https://eu.api.blizzard.com/profile/wow/character/blackrock/${name.toLowerCase()}?namespace=profile-eu&locale=de_DE`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );

  const data = await response.json();
  return data.character_class?.id;
}

export default async function handler(req, res) {
  try {
    const clientId = process.env.BLIZZARD_CLIENT_ID;
    const clientSecret = process.env.BLIZZARD_CLIENT_SECRET;

    const credentials = Buffer
      .from(`${clientId}:${clientSecret}`)
      .toString("base64");

    const tokenResponse = await fetch("https://oauth.battle.net/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const response = await fetch(
      "https://eu.api.blizzard.com/data/wow/guild/blackrock/we-pull-at-two/activity?namespace=profile-eu&locale=de_DE",
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const data = await response.json();

    const selected = data.activities.slice(0, 15);

    const activities = await Promise.all(
      selected.map(async entry => {

        if (entry.activity?.type === "CHARACTER_ACHIEVEMENT") {

          const name = entry.character_achievement.character.name;
          const achievement = entry.character_achievement.achievement.name;

          const classId = await getCharacterClass(accessToken, name);
          const color = CLASS_COLORS[classId] || "#ffffff";

          return {
            description: `🏆 <span style="color:${color}; font-weight:600;">${name}</span> hat den Erfolg "${achievement}" erhalten`,
            time: timeAgo(entry.timestamp)
          };
        }

        return {
          description: `📜 Aktivität: ${entry.activity?.type}`,
          time: timeAgo(entry.timestamp)
        };
      })
    );

    res.status(200).json({ activities });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
