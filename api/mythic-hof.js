import { Buffer } from "buffer";

let cache = { data: null, timestamp: 0 };
const CACHE_TIME = 30 * 60 * 1000;

export default async function handler(req, res) {
  try {

    if (cache.data && Date.now() - cache.timestamp < CACHE_TIME) {
      return res.status(200).json(cache.data);
    }

    /* ------------------ Raider.io Guild holen ------------------ */

    const guildRes = await fetch(
      "https://raider.io/api/v1/guilds/profile?region=eu&realm=blackrock&name=We%20Pull%20at%20Two&fields=members"
    );

    const guildData = await guildRes.json();

    if (!guildData.members) {
      return res.status(200).json({ activeCurrent: false, currentSeason: [], previousSeason: [] });
    }

    /* ------------------ Filtern nach deinen Regeln ------------------ */

    const filteredMembers = guildData.members.filter(m =>
      m.rank <= 6 &&
      m.rank !== 3
    );

    /* ------------------ Blizzard Token holen (für Level 90 Check) ------------------ */

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

    /* ------------------ Nur Level 90 ------------------ */

    const level90Members = [];

    for (const member of filteredMembers) {

      try {
        const profileRes = await fetch(
          `https://eu.api.blizzard.com/profile/wow/character/${member.character.realm.toLowerCase()}/${member.character.name.toLowerCase()}?namespace=profile-eu&locale=de_DE`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (!profileRes.ok) continue;

        const profileData = await profileRes.json();

        if (profileData.level === 90) {
          level90Members.push(member.character);
        }

      } catch {
        continue;
      }
    }

    /* ------------------ Raider.io Character Scores holen ------------------ */

    const players = [];

    await Promise.all(level90Members.map(async (char) => {
      try {

        const charRes = await fetch(
          `https://raider.io/api/v1/characters/profile?region=eu&realm=${char.realm.toLowerCase()}&name=${char.name}&fields=mythic_plus_scores_by_season`
        );

        if (!charRes.ok) return;

        const charData = await charRes.json();

        const seasons = charData.mythic_plus_scores_by_season;
        if (!seasons || seasons.length === 0) return;

        seasons.forEach(season => {
          players.push({
            name: char.name,
            season: season.season,
            score: season.scores?.all || 0
          });
        });

      } catch {
        return;
      }
    }));

    if (players.length === 0) {
      return res.status(200).json({ activeCurrent: false, currentSeason: [], previousSeason: [] });
    }

    /* ------------------ Seasons automatisch erkennen ------------------ */

    const seasonMap = {};

    players.forEach(p => {
      if (!seasonMap[p.season]) seasonMap[p.season] = [];
      seasonMap[p.season].push(p);
    });

    const sortedSeasons = Object.keys(seasonMap).sort().reverse();

    const currentSeasonId = sortedSeasons[0];
    const previousSeasonId = sortedSeasons[1];

    const currentSeason = (seasonMap[currentSeasonId] || [])
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const previousSeason = (seasonMap[previousSeasonId] || [])
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const activeCurrent = currentSeason.some(p => p.score > 0);

    const result = {
      activeCurrent,
      currentSeasonId,
      previousSeasonId,
      currentSeason,
      previousSeason
    };

    cache = { data: result, timestamp: Date.now() };

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
