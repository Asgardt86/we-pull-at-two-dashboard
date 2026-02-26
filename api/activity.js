import { Buffer } from "buffer";

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

function buildDescription(entry) {
  const type = entry.activity?.type;

  if (type === "CHARACTER_ACHIEVEMENT" && entry.character_achievement) {
    const name = entry.character_achievement.character.name;
    const achievement = entry.character_achievement.achievement.name;

    return `🏆 ${name} hat den Erfolg "${achievement}" erhalten`;
  }

  if (type === "ENCOUNTER" && entry.encounter_completed) {
    const name = entry.encounter_completed.character?.name || "Unbekannt";
    const boss = entry.encounter_completed.encounter?.name || "Boss";

    return `⚔️ ${name} hat ${boss} besiegt`;
  }

  return `📜 Aktivität: ${type}`;
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

    const activities = data.activities.slice(0, 10).map(entry => ({
      description: buildDescription(entry),
      time: timeAgo(entry.timestamp)
    }));

    res.status(200).json({ activities });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
