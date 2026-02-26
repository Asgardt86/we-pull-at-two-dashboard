let cache = { data: null, timestamp: 0 };
const CACHE_TIME = 30 * 60 * 1000;

export default async function handler(req, res) {
  try {

    if (cache.data && Date.now() - cache.timestamp < CACHE_TIME) {
      return res.status(200).json(cache.data);
    }

    // 1️⃣ Guild Roster holen
    const guildResponse = await fetch(
      "https://raider.io/api/v1/guilds/roster?region=eu&realm=blackrock&name=We%20Pull%20at%20Two"
    );

    const guildData = await guildResponse.json();

    if (!guildData.members) {
      return res.status(200).json({ empty: true });
    }

    // Nur Level 80 Charaktere
    const level80 = guildData.members
      .filter(m => m.character.level === 80)
      .slice(0, 25); // Limit für Performance

    // 2️⃣ Charakterdaten einzeln abrufen
    const detailedPlayers = await Promise.all(
      level80.map(async (member) => {

        const charRes = await fetch(
          `https://raider.io/api/v1/characters/profile?region=eu&realm=blackrock&name=${encodeURIComponent(member.character.name)}&fields=mythic_plus_scores_by_season,mythic_plus_best_runs`
        );

        const charData = await charRes.json();

        const season = charData.mythic_plus_scores_by_season?.[0];

        const seasonScore = season?.scores?.all || 0;
        const allTimeScore = charData.mythic_plus_scores?.all || 0;

        return {
          name: member.character.name,
          class: member.character.class,
          role: member.character.role,
          seasonScore,
          allTimeScore,
          bestRun: charData.mythic_plus_best_runs?.[0] || null
        };
      })
    );

    const players = detailedPlayers
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
