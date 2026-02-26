const guildResponse = await fetch(
  "https://eu.api.blizzard.com/data/wow/search/guild?namespace=profile-eu&name.en_US=We%20Pull%20at%20Two",
  {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  }
);

const guildData = await guildResponse.json();

return res.status(200).json(guildData);
