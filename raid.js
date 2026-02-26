let cache = { data: null, timestamp: 0 };
const CACHE_TIME = 30 * 60 * 1000;

// Midnight Season 1 Struktur
const MIDNIGHT_RAIDS = [
  { slug: "the-voidspire", name: "Die Leerenspitze", bosses: 6 },
  { slug: "the-dreamrift", name: "Der Traumriss", bosses: 1 },
  { slug: "march-on-queldanas", name: "Marsch auf Quel'Danas", bosses: 2 }
];

export default async function handler(req, res) {
  try {

    if (cache.data && Date.now() - cache.timestamp < CACHE_TIME) {
      return res.status(200).json(cache.data);
    }

    const response = await fetch(
      "https://raider.io/api/v1/guilds/profile?region=eu&realm=blackrock&name=We%20Pull%20at%20Two&fields=raid_progression"
    );

    const data = await response.json();
    const progression = data.raid_progression || {};

    const raids = MIDNIGHT_RAIDS.map(raid => {
      const raidData = progression[raid.slug];

      return {
        name: raid.name,
        mythic: {
          completed: raidData?.mythic?.bosses_killed || 0,
          total: raid.bosses
        },
        heroic: {
          completed: raidData?.heroic?.bosses_killed || 0,
          total: raid.bosses
        },
        normal: {
          completed: raidData?.normal?.bosses_killed || 0,
          total: raid.bosses
        }
      };
    });

    const result = { raids };

    cache = { data: result, timestamp: Date.now() };

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
