import { Buffer } from "buffer";

let cache = { data: null, timestamp: 0 };
const CACHE_TIME = 30 * 60 * 1000;

export default async function handler(req, res) {
  try {

    if (cache.data && Date.now() - cache.timestamp < CACHE_TIME) {
      return res.status(200).json(cache.data);
    }

    const clientId = process.env.BLIZZARD_CLIENT_ID;
    const clientSecret = process.env.BLIZZARD_CLIENT_SECRET;

    const credentials = Buffer
      .from(`${clientId}:${clientSecret}`)
      .toString("base64");

    // OAuth
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

    // Holiday Index laden
    const indexResponse = await fetch(
      "https://eu.api.blizzard.com/data/wow/holiday/index?namespace=dynamic-eu&locale=de_DE",
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const indexData = await indexResponse.json();

    const now = Date.now();
    const active = [];

    // Für jede Holiday Details laden
    for (const holiday of indexData.holidays) {

      const detailResponse = await fetch(
        `https://eu.api.blizzard.com/data/wow/holiday/${holiday.id}?namespace=dynamic-eu&locale=de_DE`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      const detail = await detailResponse.json();

      if (!detail.instances) continue;

      detail.instances.forEach(instance => {
        const start = new Date(instance.start_time).getTime();
        const end = new Date(instance.end_time).getTime();

        if (start <= now && end >= now) {
          active.push({
            name: detail.name,
            start: instance.start_time,
            end: instance.end_time
          });
        }
      });
    }

    const result = { active };

    cache = { data: result, timestamp: Date.now() };

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
