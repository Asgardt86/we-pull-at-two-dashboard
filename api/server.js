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

    // Realm-Daten holen
    const realmResponse = await fetch(
      "https://eu.api.blizzard.com/data/wow/realm/blackrock?namespace=dynamic-eu&locale=de_DE",
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    // WICHTIG: prüfen ob Antwort OK
    if (!realmResponse.ok) {
      return res.status(realmResponse.status).json({
        error: `Blizzard API Fehler: ${realmResponse.status}`
      });
    }

    const realmData = await realmResponse.json();

    // Status sicher auslesen
    const statusType = realmData.status?.type || "UNKNOWN";

    res.status(200).json({
      name: realmData.name || "Blackrock",
      status: statusType
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
