import { Buffer } from "buffer";

let cache = {
  data: null,
  timestamp: 0
};

const CACHE_TIME = 30 * 60 * 1000; // 30 Minuten

export default async function handler(req, res) {
  try {

    // 🔥 Cache prüfen
    if (cache.data && Date.now() - cache.timestamp < CACHE_TIME) {
      return res.status(200).json(cache.data);
    }

    const clientId = process.env.BLIZZARD_CLIENT_ID;
    const clientSecret = process.env.BLIZZARD_CLIENT_SECRET;

    const credentials = Buffer
      .from(`${clientId}:${clientSecret}`)
      .toString("base64");

    const tokenResponse = await fetch("https://oauth.battle.net/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const guildResponse = await fetch(
      "https://eu.api.blizzard.com/data/wow/guild/blackrock/we-pull-at-two?namespace=profile-eu&locale=de_DE",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const guildData = await guildResponse.json();

    const emblemId = guildData.crest.emblem.id;

    const emblemResponse = await fetch(
      `https://eu.api.blizzard.com/data/wow/media/guild-crest/emblem/${emblemId}?namespace=static-eu`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const emblemData = await emblemResponse.json();

    const result = {
      name: guildData.name,
      realm: guildData.realm,
      faction: guildData.faction,
      member_count: guildData.member_count,
      achievement_points: guildData.achievement_points,
      emblemUrl: emblemData.assets[0].value,
      emblemColor: guildData.crest.emblem.color.rgba,
      borderColor: guildData.crest.border.color.rgba,
      backgroundColor: guildData.crest.background.color.rgba
    };

    // 🔥 Cache speichern
    cache = {
      data: result,
      timestamp: Date.now()
    };

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
