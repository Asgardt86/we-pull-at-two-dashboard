import { Buffer } from "buffer";

const CLASS_MAP = {
  1: "Krieger",
  2: "Paladin",
  3: "Jäger",
  4: "Schurke",
  5: "Priester",
  6: "Todesritter",
  7: "Schamane",
  8: "Magier",
  9: "Hexenmeister",
  10: "Mönch",
  11: "Druide",
  12: "Dämonenjäger",
  13: "Rufer"
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

    const rosterResponse = await fetch(
      "https://eu.api.blizzard.com/data/wow/guild/blackrock/we-pull-at-two/roster?namespace=profile-eu&locale=de_DE",
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const rosterData = await rosterResponse.json();

    const classCount = {};
    const totalMembers = rosterData.members.length;

    rosterData.members.forEach(member => {
      const classId = member.character.playable_class.id;
      const className = CLASS_MAP[classId] || "Unbekannt";

      if (!classCount[className]) {
        classCount[className] = 0;
      }

      classCount[className]++;
    });

    res.status(200).json({
      total: totalMembers,
      classes: classCount
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
