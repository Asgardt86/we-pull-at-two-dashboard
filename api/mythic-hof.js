let cache = { data: null, timestamp: 0 };
const CACHE_TIME = 30 * 60 * 1000;

export default async function handler(req, res) {
  try {

    if (cache.data && Date.now() - cache.timestamp < CACHE_TIME) {
      return res.status(200).json(cache.data);
    }

    /* ------------------ Guild Members holen ------------------ */

    const guildRes = await fetch(
      "https://raider.io/api/v1/guilds/profile?region=eu&realm=blackrock&name=We%20Pull%20at%20Two&fields=members"
    );

    const guildData = await guildRes.json();

    if (!guildData.members) {
      return res.status(200).json({
        activeCurrent: false,
        currentSeason: [],
        previousSeason: []
      });
    }

    /* ------------------ Filtern nach deinen Regeln ------------------ */

    const validMembers = guildData.members.filter(m =>
      m.rank <= 6 &&
      m.rank !== 3
    );

    /* ------------------ Character Scores holen ------------------ */

    const players = [];

    await Promise.all(validMembers.map(async (member) => {
      try {

        const char = member.character;

        const charRes = await fetch(
          `https://raider.io/api/v1/characters/profile?region=${char.region}&realm=${char.realm}&name=${encodeURIComponent(char.name)}&fields=mythic_plus_scores_by_season`
        );

        if (!charRes.ok) return;

        const charData = await charRes.json();

        if (!charData.mythic_plus_scores_by_season) return;

        charData.mythic_plus_scores_by_season.forEach(season => {
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
      return res.status(200).json({
        activeCurrent: false,
        currentSeason: [],
        previousSeason: []
      });
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
