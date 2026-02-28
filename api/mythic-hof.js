import { Buffer } from "buffer";

let cache = { data: null, timestamp: 0 };
const CACHE_TIME = 30 * 60 * 1000; // 30 Minuten

export default async function handler(req, res) {
  try {

    // Cache nutzen
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

    // Gilden-Roster abrufen
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

    const players = [];

    // Alle Mitglieder durchgehen
    for (const member of rosterData.members) {

      const level = member.character.level;

      // 🔥 Nur Level 90
      if (level !== 90) continue;

      try {

        const profileResponse = await fetch(
          `https://eu.api.blizzard.com/profile/wow/character/${member.character.realm.slug}/${member.character.name.toLowerCase()}/mythic-keystone-profile?namespace=profile-eu&locale=de_DE`,
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        );

        if (!profileResponse.ok) continue;

        const profileData = await profileResponse.json();

        const score =
          profileData.current_mythic_rating?.rating || 0;

        // Nur Spieler mit Score anzeigen
        if (score <= 0) continue;

        players.push({
          name: member.character.name,
          classId: member.character.playable_class.id,
          level: level,
          score: Math.round(score)
        });

      } catch {
        continue;
      }
    }

    // 🔥 Sortieren & Top 10
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
