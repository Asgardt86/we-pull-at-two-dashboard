let cache = { data: null, timestamp: 0 };
const CACHE_TIME = 30 * 60 * 1000;

export default async function handler(req, res) {
  try {

    if (cache.data && Date.now() - cache.timestamp < CACHE_TIME) {
      return res.status(200).json(cache.data);
    }

    const response = await fetch(
      "https://raider.io/api/v1/guilds/profile?region=eu&realm=blackrock&name=We%20Pull%20at%20Two&fields=members,mythic_plus_scores_by_season,mythic_plus_best_runs"
    );

    const data = await response.json();

    if (!data.members) {
      return res.status(200).json({ empty: true });
    }

    const players = data.members
      .map(m => {

        const season = m.character.mythic_plus_scores_by_season?.[0];

        const seasonScore = season?.scores?.all || 0;
        const allTimeScore = m.character.mythic_plus_scores?.all || 0;

        return {
          name: m.character.name,
          class: m.character.class,
          role: m.character.role,
          seasonScore,
          allTimeScore,
          bestRun: m.character.mythic_plus_best_runs?.[0] || null
        };
      })
      .filter(p => p.seasonScore > 0 || p.allTimeScore > 0)
      .sort((a, b) => {
        const aScore = a.seasonScore > 0 ? a.seasonScore : a.allTimeScore;
        const bScore = b.seasonScore > 0 ? b.seasonScore : b.allTimeScore;
        return bScore - aScore;
      })
      .slice(0, 10);

    const result = { players };

    cache = { data: result, timestamp: Date.now() };

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
