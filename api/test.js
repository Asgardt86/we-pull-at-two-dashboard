import { Buffer } from "buffer";

export default async function handler(req, res) {
  try {
    const clientId = process.env.BLIZZARD_CLIENT_ID;
    const clientSecret = process.env.BLIZZARD_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({ error: "Missing environment variables" });
    }

    const credentials = Buffer
      .from(`${clientId}:${clientSecret}`)
      .toString("base64");

    // 🔹 Token holen
    const tokenResponse = await fetch("https://eu.battle.net/oauth/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return res.status(500).json({ error: "Token failed", details: tokenData });
    }

    const accessToken = tokenData.access_token;

    // 🔹 Guild Basisdaten abrufen
    const guildResponse = await fetch(
      "https://eu.api.blizzard.com/data/wow/guild/blackrock/we-pull-at-two?namespace=profile-eu&locale=de_DE",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const guildText = await guildResponse.text();

    return res.status(200).json({
      guildStatus: guildResponse.status,
      guildResponse: guildText
    });

  } catch (error) {
    return res.status(500).json({
      error: "Function crashed",
      details: error.message
    });
  }
}
