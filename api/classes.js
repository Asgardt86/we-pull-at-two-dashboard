import { Buffer } from "buffer";

let cache = { data: null, timestamp: 0 };
const CACHE_TIME = 30 * 60 * 1000; // 30 Minuten

const CLASS_MAP = {
  1: { name: "Krieger", icon: "warrior", color: "#C79C6E" },
  2: { name: "Paladin", icon: "paladin", color: "#F58CBA" },
  3: { name: "Jäger", icon: "hunter", color: "#ABD473" },
  4: { name: "Schurke", icon: "rogue", color: "#FFF569" },
  5: { name: "Priester", icon: "priest", color: "#FFFFFF" },
  6: { name: "Todesritter", icon: "deathknight", color: "#C41F3B" },
  7: { name: "Schamane", icon: "shaman", color: "#0070DE" },
  8: { name: "Magier", icon: "mage", color: "#69CCF0" },
  9: { name: "Hexenmeister", icon: "warlock", color: "#9482C9" },
  10:{ name: "Mönch", icon: "monk", color: "#00FF96" },
  11:{ name: "Druide", icon: "druid", color: "#FF7D0A" },
  12:{ name: "Dämonenjäger", icon: "demonhunter", color: "#A330C9" },
  13:{ name: "Rufer", icon: "evoker", color: "#33937F" }
};

export default async function handler(req, res) {
  try {

    // 🔥 Cache prüfen
    if (cache.data && Date.now() - cache.timestamp < CACHE_TIME) {
      return res.status(200).json(cache.data);
    }

    const clientId = process.env.BLIZZARD_CLIENT_ID;
    const clientSecret = process.env.BLIZZARD_CLIENT_SECRET;

    const credentials = Buffer
      .from(`${clientId}:${clientSecret}`)
      .toString("base64");

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

    const rosterResponse = await fetch(
      "https://eu.api.blizzard.com/data/wow/guild/blackrock/we-pull-at-two/roster?namespace=profile-eu&locale=de_DE",
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const rosterData = await rosterResponse.json();

    const classCount = {};
    let totalLevel90 = 0;

    rosterData.members.forEach(member => {
      if (member.character.level !== 90) return;

      const classId = member.character.playable_class.id;
      const classInfo = CLASS_MAP[classId];

      if (!classInfo) return;

      if (!classCount[classId]) {
        classCount[classId] = {
          name: classInfo.name,
          icon: classInfo.icon,
          color: classInfo.color,
          count: 0
        };
      }

      classCount[classId].count++;
      totalLevel90++;
    });

    const result = {
      total: totalLevel90,
      classes: Object.values(classCount)
    };

    // 🔥 Cache speichern
    cache = { data: result, timestamp: Date.now() };

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
