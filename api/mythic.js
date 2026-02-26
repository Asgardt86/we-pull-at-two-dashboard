export default async function handler(req, res) {
  try {
    // Placeholder bis Season startet
    return res.status(200).json({
      empty: true,
      message: "Neue Mythic+ Season startet bald. Hall of Fame wird automatisch aktiviert."
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
