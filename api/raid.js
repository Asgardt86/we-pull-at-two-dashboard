import { Buffer } from "buffer";

const RAIDS = {
  "Der Leerenturm": 6,
  "Der Traumriss": 1,
  "Marsch auf Quel'Danas": 2
};

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

    const response = await fetch(
      "https://eu.api.blizzard.com/data/wow/guild/blackrock/we-pull-at-two/encounters?namespace=profile-eu&locale=de_DE",
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    // Wenn noch kein Boss gekillt wurde
    if (response.status === 404) {
      return res.status(200).json({
        empty: true,
        raids: Object.entries(RAIDS).map(([name, total]) => ({
          name,
          mythic: { completed: 0, total },
          heroic: { completed: 0, total },
          normal: { completed: 0, total }
        }))
      });
    }

    const data = await response.json();

    const raidResults = Object.entries(RAIDS).map(([raidName, total]) => {
      let mythic = 0;
      let heroic = 0;
      let normal = 0;

      data.expansions?.forEach(exp => {
        exp.instances?.forEach(instance => {
          if (instance.name === raidName) {
            instance.modes?.forEach(mode => {
              if (mode.difficulty.type === "MYTHIC") {
                mythic = mode.progress.completed_count;
              }
              if (mode.difficulty.type === "HEROIC") {
                heroic = mode.progress.completed_count;
              }
              if (mode.difficulty.type === "NORMAL") {
                normal = mode.progress.completed_count;
              }
            });
          }
        });
      });

      return {
        name: raidName,
        mythic: { completed: mythic, total },
        heroic: { completed: heroic, total },
        normal: { completed: normal, total }
      };
    });

    res.status(200).json({ raids: raidResults });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
