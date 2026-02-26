export default async function handler(req, res) {
  try {

    const response = await fetch(
      "https://raider.io/api/v1/guilds/profile?region=eu&realm=blackrock&name=We%20Pull%20at%20Two&fields=mythic_plus_scores_by_season"
    );

    const data = await response.json();

    // Prüfen ob Season-Daten existieren
    if (!data.mythic_plus_scores_by_season || data.mythic_plus_scores_by_season.length === 0) {
      return res.status(200).json({ empty: true });
    }

    // Neueste Season nehmen (erste im Array)
    const season = data.mythic_plus_scores_by_season[0];

    res.status(200).json({
      score: season.scores?.all ?? null,
      world: season.rankings?.world ?? null,
      region: season.rankings?.region ?? null,
      realm: season.rankings?.realm ?? null
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
