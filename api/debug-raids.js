export default async function handler(req, res) {
  const response = await fetch(
    "https://raider.io/api/v1/guilds/profile?region=eu&realm=blackrock&name=We%20Pull%20at%20Two&fields=raid_progression"
  );

  const data = await response.json();
  res.status(200).json(data.raid_progression);
}
