let cache = { data: null, timestamp: 0 };
const CACHE_TIME = 30 * 60 * 1000;

export default async function handler(req, res) {
  try {

    if (cache.data && Date.now() - cache.timestamp < CACHE_TIME) {
      return res.status(200).json(cache.data);
    }

    const response = await fetch(
      "https://raider.io/api/v1/guilds/profile?region=eu&realm=blackrock&name=We%20Pull%20at%20Two&fields=mythic_plus_scores_by_season"
    );

    const data = await response.json();

    if (!data.mythic_plus_scores_by_season || data.mythic_plus_scores_by_season.length === 0) {
      const empty = { empty: true };
      cache = { data: empty, timestamp: Date.now() };
      return res.status(200).json(empty);
    }

    const season = data.mythic_plus_scores_by_season[0];

    const result = {
      score: season.scores?.all ?? null,
      world: season.rankings?.world ?? null,
      region: season.rankings?.region ?? null,
      realm: season.rankings?.realm ?? null
    };

    cache = { data: result, timestamp: Date.now() };

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
