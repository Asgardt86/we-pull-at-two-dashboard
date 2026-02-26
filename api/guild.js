import { Buffer } from "buffer";

export default async function handler(req, res) {
  try {
    const clientId = process.env.BLIZZARD_CLIENT_ID;
    const clientSecret = process.env.BLIZZARD_CLIENT_SECRET;

    const credentials = Buffer
      .from(`${clientId}:${clientSecret}`)
      .toString("base64");

    // OAuth Token holen
    const tokenResponse = await fetch("https://oauth.battle.net/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Guild Basisdaten holen
    const guildResponse = await fetch(
      "https://eu.api.blizzard.com/data/wow/guild/blackrock/we-pull-at-two?namespace=profile-eu&locale=de_DE",
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const guildData = await guildResponse.json();

    // Emblem Media holen (weißes Symbol)
    const emblemId = guildData.crest.emblem.id;

    const emblemResponse = await fetch(
      `https://eu.api.blizzard.com/data/wow/media/guild-crest/emblem/${emblemId}?namespace=static-eu`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const emblemData = await emblemResponse.json();
    const emblemUrl = emblemData.assets[0].value;

    // Saubere Daten zurückgeben
    res.status(200).json({
      name: guildData.name,
      realm: guildData.realm,
      faction: guildData.faction,
      member_count: guildData.member_count,
      achievement_points: guildData.achievement_points,

      emblemUrl,

      emblemColor: guildData.crest.emblem.color.rgba,
      borderColor: guildData.crest.border.color.rgba,
      backgroundColor: guildData.crest.background.color.rgba
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
