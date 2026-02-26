let cache = { data: null, timestamp: 0 };
const CACHE_TIME = 30 * 60 * 1000;

export default async function handler(req, res) {
  try {

    if (cache.data && Date.now() - cache.timestamp < CACHE_TIME) {
      return res.status(200).json(cache.data);
    }

    const response = await fetch(
      "https://raider.io/api/v1/guilds/profile?region=eu&realm=blackrock&name=We%20Pull%20at%20Two&fields=raid_progression"
    );

    const data = await response.json();
    const firstRaid = Object.values(data.raid_progression || {})[0];

    if (!firstRaid || !firstRaid.mythic) {
      const empty = { empty: true };
      cache = { data: empty, timestamp: Date.now() };
      return res.status(200).json(empty);
    }

    const result = {
      world: firstRaid.mythic.world_rank,
      region: firstRaid.mythic.region_rank,
      realm: firstRaid.mythic.realm_rank
    };

    cache = { data: result, timestamp: Date.now() };

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
