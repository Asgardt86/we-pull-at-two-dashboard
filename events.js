export default function handler(req, res) {

  const now = new Date();
  const year = now.getFullYear();

  function createEvent(name, start, end) {

    const isActive = now >= start && now <= end;
    const diff = start - now;

    let countdown = "";

    if (!isActive) {
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      countdown = `Startet in ${days} Tagen`;
    }

    return {
      name,
      active: isActive,
      countdown,
      start
    };
  }

  const events = [

    createEvent(
      "Dunkelmond-Jahrmarkt",
      new Date(year, now.getMonth() + 1, 1),
      new Date(year, now.getMonth() + 1, 7)
    ),

    createEvent(
      "Mondfest",
      new Date(year, 1, 16),
      new Date(year, 2, 2)
    ),

    createEvent(
      "Noblegarten",
      new Date(year, 3, 1),
      new Date(year, 3, 7)
    ),

    createEvent(
      "Winterhauchfest",
      new Date(year, 11, 16),
      new Date(year, 11, 31)
    )

  ];

  // Nur Events innerhalb 60 Tage oder aktiv
  const filtered = events
    .filter(e => e.active || (e.start - now) < 60 * 24 * 60 * 60 * 1000)
    .sort((a, b) => a.start - b.start);

  res.status(200).json(filtered);
}
