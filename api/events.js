import { Buffer } from "buffer";

let cache = { data: null, timestamp: 0 };
const CACHE_TIME = 30 * 60 * 1000; // 30 Minuten

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

    // Blizzard Calendar API
    const response = await fetch(
      "https://eu.api.blizzard.com/data/wow/calendar/index?namespace=dynamic-eu&locale=de_DE",
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const data = await response.json();

    if (!data.events) {
      return res.status(200).json({ active: [], upcoming: [] });
    }

    const now = Date.now();

    const active = [];
    const upcoming = [];

    data.events.forEach(event => {

      const start = new Date(event.start_time).getTime();
      const end = new Date(event.end_time).getTime();

      const formatted = {
        name: event.name,
        start: event.start_time,
        end: event.end_time
      };

      if (start <= now && end >= now) {
        active.push(formatted);
      }

      if (start > now) {
        upcoming.push(formatted);
      }

    });

    upcoming.sort((a, b) =>
      new Date(a.start) - new Date(b.start)
    );

    const result = {
      active,
      upcoming: upcoming.slice(0, 3) // nur nächste 3
    };

    cache = { data: result, timestamp: Date.now() };

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
