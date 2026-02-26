export default async function handler(req, res) {
  const clientId = process.env.BLIZZARD_CLIENT_ID;
  const clientSecret = process.env.BLIZZARD_CLIENT_SECRET;

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
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

    // 2️⃣ Guild Encounter Progress abrufen (KORREKTER ENDPOINT)
    const guildResponse = await fetch(
      "https://eu.api.blizzard.com/data/wow/guild/blackrock/we-pull-at-two/encounters?namespace=profile-eu&locale=de_DE",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const text = await guildResponse.text();

    res.status(200).json({
      status: guildResponse.status,
      rawResponse: text
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
