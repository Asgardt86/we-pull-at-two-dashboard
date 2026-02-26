import { Buffer } from "buffer";

export default async function handler(req, res) {
  try {
    const clientId = process.env.BLIZZARD_CLIENT_ID;
    const clientSecret = process.env.BLIZZARD_CLIENT_SECRET;

    const credentials = Buffer
      .from(`${clientId}:${clientSecret}`)
      .toString("base64");

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

    // TEST: öffentlicher Charakter
    const response = await fetch(
      "https://eu.api.blizzard.com/profile/wow/character/blackrock/method?namespace=profile-eu&locale=de_DE",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const text = await response.text();

    return res.status(200).json({
      status: response.status,
      data: text
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
