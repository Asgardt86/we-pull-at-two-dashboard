let cache = { data: null, timestamp: 0 };
const CACHE_TIME = 30 * 60 * 1000;

export default async function handler(req, res) {
  try {

    if (cache.data && Date.now() - cache.timestamp < CACHE_TIME) {
      return res.status(200).json(cache.data);
    }

    const response = await fetch(
      "https://raider.io/api/v1/guilds/profile?region=eu&realm=blackrock&name=We%20Pull%20at%20Two&fields=members"
    );

    const data = await response.json();

    if (!data.members) {
      return res.status(200).json({ empty: true });
    }

    const players = data.members
      .filter(m => m.character.mythic_plus_scores_by_season)
      .map(m => {
        const season = m.character.mythic_plus_scores_by_season[0];

        return {
          name: m.character.name,
          class: m.character.class,
          role: m.character.role,
          seasonScore: season?.scores?.all || 0,
          allTimeScore: m.character.mythic_plus_scores?.all || 0,
          bestRun: m.character.mythic_plus_best_runs?.[0] || null
        };
      })
      .sort((a, b) => b.seasonScore - a.seasonScore)
      .slice(0, 10);

    const result = { players };

    cache = { data: result, timestamp: Date.now() };

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
