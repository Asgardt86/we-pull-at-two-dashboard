const guildResponse = await fetch(
  "https://eu.api.blizzard.com/data/wow/realm/index?namespace=dynamic-eu&locale=de_DE",
  {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  }
);

const data = await guildResponse.json();
return res.status(200).json(data);
