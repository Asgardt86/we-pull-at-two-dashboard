import { Buffer } from "buffer";

let cache = { data: null, timestamp: 0 };
const CACHE_TIME = 5 * 60 * 1000; // 5 Minuten Cache

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

export default async function handler(req, res) {
  try {

    // Cache Check
    if (cache.data && Date.now() - cache.timestamp < CACHE_TIME) {
      return res.status(200).json(cache.data);
    }

    const clientId = process.env.BLIZZARD_CLIENT_ID;
    const clientSecret = process.env.BLIZZARD_CLIENT_SECRET;

    const credentials = Buffer
      .from(`${clientId}:${clientSecret}`)
      .toString("base64");

    // OAuth Token holen
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

    // Roster holen (für Klassenfarben)
    const rosterResponse = await fetch(
      "https://eu.api.blizzard.com/data/wow/guild/blackrock/we-pull-at-two/roster?namespace=profile-eu&locale=de_DE",
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const rosterData = await rosterResponse.json();

    const classMap = {};
    if (rosterData.members) {
      rosterData.members.forEach(member => {
        classMap[member.character.name] =
          CLASS_COLORS[member.character.playable_class.id] || "#ffffff";
      });
    }

    // Activity laden
    const activityResponse = await fetch(
      "https://eu.api.blizzard.com/data/wow/guild/blackrock/we-pull-at-two/activity?namespace=profile-eu&locale=de_DE",
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const activityData = await activityResponse.json();

    if (!activityData.activities) {
      return res.status(200).json({ activities: [] });
    }

    // Erst 30 laden, dann filtern
    const relevant = activityData.activities.slice(0, 30).map(entry => {

      const type = entry.activity?.type;

      // Character Achievement
      if (type === "CHARACTER_ACHIEVEMENT" && entry.character_achievement) {

        const name = entry.character_achievement.character.name;
        const achievement = entry.character_achievement.achievement.name;
        const color = classMap[name] || "#ffffff";

        return {
          description: `🏆 <span style="color:${color}; font-weight:600;">${name}</span> hat den Erfolg "${achievement}" erhalten`,
          time: timeAgo(entry.timestamp)
        };
      }

      // Level Up
      if (type === "PLAYER_LEVEL_UP" && entry.player_level_up) {

        const name = entry.player_level_up.character.name;
        const level = entry.player_level_up.level;
        const color = classMap[name] || "#ffffff";

        return {
          description: `⭐ <span style="color:${color}; font-weight:600;">${name}</span> hat Level ${level} erreicht`,
          time: timeAgo(entry.timestamp)
        };
      }

      return null;

    }).filter(Boolean).slice(0, 15); // Max 15 anzeigen

    const result = { activities: relevant };

    cache = { data: result, timestamp: Date.now() };

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
