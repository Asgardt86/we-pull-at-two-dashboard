import { Buffer } from "buffer";

export default async function handler(req, res) {
  try {
    const clientId = process.env.BLIZZARD_CLIENT_ID;
    const clientSecret = process.env.BLIZZARD_CLIENT_SECRET;

    const credentials = Buffer
      .from(`${clientId}:${clientSecret}`)
      .toString("base64");

    // 1️⃣ Token holen
    const tokenResponse = await fetch("https://eu.battle.net/oauth/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2️⃣ Realm Index abrufen
    const realmResponse = await fetch(
      "https://eu.api.blizzard.com/data/wow/realm/index?namespace=dynamic-eu&locale=de_DE",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const realmData = await realmResponse.json();

    return res.status(200).json(realmData);

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
