import { Buffer } from "buffer";

export default async function handler(req, res) {
  try {
    const clientId = process.env.BLIZZARD_CLIENT_ID;
    const clientSecret = process.env.BLIZZARD_CLIENT_SECRET;

    const credentials = Buffer
      .from(`${clientId}:${clientSecret}`)
      .toString("base64");

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

    // RICHTIGER STATUS ENDPOINT
    const statusResponse = await fetch(
      "https://eu.api.blizzard.com/data/wow/realm/blackrock/status?namespace=dynamic-eu&locale=de_DE",
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const statusData = await statusResponse.json();

    res.status(200).json({
      name: "Blackrock",
      status: statusData.status.type
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
