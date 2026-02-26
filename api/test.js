const response = await fetch(
  "https://eu.api.blizzard.com/data/wow/guild/blackrock/we-pull-at-two/encounters?namespace=profile-eu&locale=de_DE",
  {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  }
);

const data = await response.json();

return res.status(200).json(data);
