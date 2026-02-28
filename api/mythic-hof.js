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

    /* ------------------ OAuth Token ------------------ */

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

    /* ------------------ Guild Roster holen ------------------ */

    const rosterResponse = await fetch(
      "https://eu.api.blizzard.com/data/wow/guild/blackrock/we-pull-at-two/roster?namespace=profile-eu&locale=de_DE",
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const rosterData = await rosterResponse.json();

    if (!rosterData.members) {
      return res.status(200).json({ players: [] });
    }

    /* ------------------ Level 80–90 filtern ------------------ */

    const validMembers = rosterData.members.filter(m =>
      m.character.level >= 80 && m.character.level <= 90
    );

    const players = [];

    /* ------------------ Mythic Profile holen ------------------ */

    await Promise.all(validMembers.map(async (member) => {
      try {

        const char = member.character;

        const profileResponse = await fetch(
          `https://eu.api.blizzard.com/profile/wow/character/blackrock/${char.name.toLowerCase()}/mythic-keystone-profile?namespace=profile-eu&locale=de_DE`,
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        );

        if (!profileResponse.ok) return;

        const profileData = await profileResponse.json();

        const score = profileData.current_mythic_rating?.rating || 0;

        if (score > 0) {
          players.push({
            name: char.name,
            classId: char.playable_class.id,
            level: char.level,
            score: Math.round(score)
          });
        }

      } catch {
        return;
      }
    }));

    /* ------------------ Top 10 sortieren ------------------ */

    const sorted = players
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const result = { players: sorted };

    cache = { data: result, timestamp: Date.now() };

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
