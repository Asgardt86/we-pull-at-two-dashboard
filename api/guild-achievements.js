import { Buffer } from "buffer";

let cache = { data: null, timestamp: 0 };
const CACHE_TIME = 30 * 60 * 1000;

export default async function handler(req, res) {
  try {

    if (cache.data && Date.now() - cache.timestamp < CACHE_TIME) {
      return res.status(200).json(cache.data);
    }

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

    const guildResponse = await fetch(
      "https://eu.api.blizzard.com/data/wow/guild/blackrock/we-pull-at-two/achievements?namespace=profile-eu&locale=de_DE",
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const guildData = await guildResponse.json();

    if (!guildData.achievements) {
      return res.status(200).json({ achievements: [] });
    }

    const latest = guildData.achievements
      .filter(a => a.completed_timestamp)
      .sort((a, b) => b.completed_timestamp - a.completed_timestamp)
      .slice(0, 5);

    const achievements = [];

    for (const entry of latest) {

      const detailResponse = await fetch(
        `https://eu.api.blizzard.com/data/wow/achievement/${entry.achievement.id}?namespace=static-eu&locale=de_DE`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      if (!detailResponse.ok) continue;

      const detailData = await detailResponse.json();

      achievements.push({
        name: detailData.name, // jetzt wirklich deutsch
        timestamp: entry.completed_timestamp
      });
    }

    const result = { achievements };

    cache = { data: result, timestamp: Date.now() };

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
