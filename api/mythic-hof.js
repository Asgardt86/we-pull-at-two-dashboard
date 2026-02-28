let cache = { data: null, timestamp: 0 };
const CACHE_TIME = 30 * 60 * 1000;

export default async function handler(req, res) {
  try {

    if (cache.data && Date.now() - cache.timestamp < CACHE_TIME) {
      return res.status(200).json(cache.data);
    }

    const response = await fetch(
      "https://raider.io/api/v1/guilds/profile?region=eu&realm=blackrock&name=We%20Pull%20at%20Two&fields=members,mythic_plus_scores_by_season"
    );

    const data = await response.json();

    if (!data.members) {
      return res.status(200).json({
        activeCurrent: false,
        currentSeason: [],
        previousSeason: []
      });
    }

    const currentSeason = [];
    const previousSeason = [];

    data.members.forEach(m => {

      const seasons = m.character.mythic_plus_scores_by_season;
      if (!seasons || seasons.length === 0) return;

      const level = m.character.level;

      const current = seasons[0]?.scores?.all || 0;
      const previous = seasons[1]?.scores?.all || 0;

      if (level === 90 && current > 0) {
        currentSeason.push({
          name: m.character.name,
          classId: m.character.class.id,
          score: current
        });
      }

      if (previous > 0) {
        previousSeason.push({
          name: m.character.name,
          classId: m.character.class.id,
          score: previous
        });
      }

    });

    const result = {
      activeCurrent: currentSeason.length > 0,
      currentSeason: currentSeason
        .sort((a, b) => b.score - a.score)
        .slice(0, 5),

      previousSeason: previousSeason
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
    };

    cache = { data: result, timestamp: Date.now() };

    res.status(200).json(result);

  } catch (error) {
    res.status(200).json({
      activeCurrent: false,
      currentSeason: [],
      previousSeason: []
    });
  }
}
