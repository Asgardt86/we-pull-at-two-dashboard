let cache = { data: null, timestamp: 0 };
const CACHE_TIME = 30 * 60 * 1000;

export default async function handler(req, res) {
  try {

    if (cache.data && Date.now() - cache.timestamp < CACHE_TIME) {
      return res.status(200).json(cache.data);
    }

    const guildResponse = await fetch(
      "https://raider.io/api/v1/guilds/roster?region=eu&realm=blackrock&name=We%20Pull%20at%20Two"
    );

    const guildData = await guildResponse.json();

    if (!guildData.members) {
      return res.status(200).json({ empty: true });
    }

    // Nur Level 80 + nur Top 15 nach Rank
    const candidates = guildData.members
      .filter(m => m.character.level === 80)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 15);

    const detailedPlayers = [];

    for (const member of candidates) {

      try {
        const charRes = await fetch(
          `https://raider.io/api/v1/characters/profile?region=eu&realm=blackrock&name=${encodeURIComponent(member.character.name)}&fields=mythic_plus_scores_by_season,mythic_plus_best_runs`
        );

        const text = await charRes.text();

        // Falls Raider.io HTML zurückgibt → skippen
        if (text.startsWith("<!DOCTYPE")) continue;

        const charData = JSON.parse(text);

        const season = charData.mythic_plus_scores_by_season?.[0];

        const seasonScore = season?.scores?.all || 0;
        const allTimeScore = charData.mythic_plus_scores?.all || 0;

        if (seasonScore === 0 && allTimeScore === 0) continue;

        detailedPlayers.push({
          name: member.character.name,
          class: member.character.class,
          role: member.character.role,
          seasonScore,
          allTimeScore,
          bestRun: charData.mythic_plus_best_runs?.[0] || null
        });

      } catch {
        continue;
      }
    }

    const players = detailedPlayers
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
