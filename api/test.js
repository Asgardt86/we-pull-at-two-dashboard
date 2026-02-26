// 2️⃣ Guild Basisdaten abrufen
const guildResponse = await fetch(
  "https://eu.api.blizzard.com/data/wow/guild/blackrock/we-pull-at-two?namespace=profile-eu&locale=de_DE",
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
