import { Buffer } from "buffer";

export default async function handler(req, res) {
  try {
    const clientId = process.env.BLIZZARD_CLIENT_ID;
    const clientSecret = process.env.BLIZZARD_CLIENT_SECRET;

    const credentials = Buffer
      .from(`${clientId}:${clientSecret}`)
      .toString("base64");

    // OAuth Token
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

    // Realm abrufen
    const realmResponse = await fetch(
      "https://eu.api.blizzard.com/data/wow/realm/blackrock?namespace=dynamic-eu&locale=de_DE",
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const realmData = await realmResponse.json();

    // Connected Realm URL
    const connectedRealmUrl = realmData.connected_realm.href;

    const connectedResponse = await fetch(connectedRealmUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const connectedData = await connectedResponse.json();

    let statusType = "UNKNOWN";

    if (connectedData.status?.type) {
      statusType = connectedData.status.type;
    } else if (connectedData.status?.name) {
      statusType = connectedData.status.name.toUpperCase();
    } else if (connectedData.has_queue !== undefined) {
      // Wenn has_queue existiert, ist Realm online
      statusType = "UP";
    }

    res.status(200).json({
      name: realmData.name,
      status: statusType
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
