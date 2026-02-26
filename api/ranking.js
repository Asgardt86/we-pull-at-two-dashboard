export default async function handler(req, res) {
  try {

    const response = await fetch(
      "https://raider.io/api/v1/guilds/profile?region=eu&realm=blackrock&name=We%20Pull%20at%20Two&fields=raid_progression"
    );

    const data = await response.json();

    // Midnight Raid Name anpassen falls nötig
    const raid = data.raid_progression["midnight-season-1"];

    if (!raid || !raid.mythic) {
      return res.status(200).json({ empty: true });
    }

    res.status(200).json({
      world: raid.mythic.world_rank,
      region: raid.mythic.region_rank,
      realm: raid.mythic.realm_rank
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
