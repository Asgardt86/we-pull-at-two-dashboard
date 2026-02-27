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

    // OAuth Token
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

    // 1️⃣ Guild Roster holen
    const rosterResponse = await fetch(
      "https://eu.api.blizzard.com/data/wow/guild/blackrock/we-pull-at-two/roster?namespace=profile-eu&locale=de_DE",
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const rosterData = await rosterResponse.json();

    if (!rosterData.members) {
      return res.status(200).json({ empty: true });
    }

    // Nur Level 80
    const level80 = rosterData.members
      .filter(m => m.character.level === 80)
      .slice(0, 15); // Performance Limit

    const players = [];

    for (const member of level80) {

      try {

        const profileResponse = await fetch(
          `https://eu.api.blizzard.com/profile/wow/character/blackrock/${member.character.name.toLowerCase()}/mythic-keystone-profile?namespace=profile-eu&locale=de_DE`,
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        );

        if (!profileResponse.ok) continue;

        const profileData = await profileResponse.json();

        const seasonScore = profileData.current_mythic_rating?.rating || 0;
        const totalScore = profileData.season_best_runs
          ? profileData.season_best_runs.reduce((sum, run) => sum + run.mythic_level, 0)
          : 0;

        if (seasonScore === 0 && totalScore === 0) continue;

        players.push({
          name: member.character.name,
          classId: member.character.playable_class.id,
          seasonScore,
          totalScore
        });

      } catch {
        continue;
      }
    }

    const sorted = players
      .sort((a, b) => b.seasonScore - a.seasonScore)
      .slice(0, 10);

    const result = { players: sorted };

    cache = { data: result, timestamp: Date.now() };

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
