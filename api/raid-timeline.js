import { Buffer } from "buffer";

let cache = { data: null, timestamp: 0 };
const CACHE_TIME = 30 * 60 * 1000; // 30 Minuten

// Midnight Raids & Boss-Struktur
const MIDNIGHT_RAIDS = {
  "Die Leerenspitze": {
    bosses: [
      "Imperator Averzian",
      "Vorasius",
      "Fallen-King Salhadaar",
      "Vaelgor",
      "War Chaplain Senn",
      "Alleria Windläufer"
    ],
    endboss: "Alleria Windläufer"
  },
  "Der Traumriss": {
    bosses: [
      "Chimaerus, der unerwartete Gott"
    ],
    endboss: "Chimaerus, der unerwartete Gott"
  },
  "Marsch auf Quel'Danas": {
    bosses: [
      "Bellerin, Kind von Allar",
      "L'ura"
    ],
    endboss: "L'ura"
  }
};

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("de-DE");
}

function calculateDays(start, end) {
  const diff = end - start;
  return Math.floor(diff / 86400000);
}

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

    // Guild Activity
    const response = await fetch(
      "https://eu.api.blizzard.com/data/wow/guild/blackrock/we-pull-at-two/activity?namespace=profile-eu&locale=de_DE",
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const data = await response.json();

    const difficulties = ["NORMAL", "HEROIC", "MYTHIC"];

    const result = {};

    difficulties.forEach(diff => {
      result[diff] = {};

      Object.keys(MIDNIGHT_RAIDS).forEach(raidName => {
        const raid = MIDNIGHT_RAIDS[raidName];

        result[diff][raidName] = {
          bosses: {},
          daysToClear: null
        };

        raid.bosses.forEach(boss => {
          result[diff][raidName].bosses[boss] = null;
        });
      });
    });

    // Nur Encounter Completed filtern
    const encounters = data.activities.filter(a =>
      a.activity?.type === "ENCOUNTER_COMPLETED"
    );

    encounters.forEach(entry => {
      const mode = entry.encounter_completed?.mode;
      const bossName = entry.encounter_completed?.encounter?.name;
      const timestamp = entry.timestamp;

      if (!mode || !bossName) return;

      Object.keys(MIDNIGHT_RAIDS).forEach(raidName => {
        const raid = MIDNIGHT_RAIDS[raidName];

        raid.bosses.forEach(boss => {
          if (bossName.includes(boss)) {
            if (!result[mode][raidName].bosses[boss]) {
              result[mode][raidName].bosses[boss] = timestamp;
            }
          }
        });
      });
    });

    // Tage bis Clear berechnen
    difficulties.forEach(diff => {
      Object.keys(MIDNIGHT_RAIDS).forEach(raidName => {
        const raid = MIDNIGHT_RAIDS[raidName];
        const bosses = result[diff][raidName].bosses;

        const timestamps = Object.values(bosses).filter(Boolean);

        if (bosses[raid.endboss]) {
          const firstKill = Math.min(...timestamps);
          const endKill = bosses[raid.endboss];
          result[diff][raidName].daysToClear =
            calculateDays(firstKill, endKill);
        }
      });
    });

    cache = { data: result, timestamp: Date.now() };

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
