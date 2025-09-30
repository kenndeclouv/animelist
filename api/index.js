import Anilist from "anilist-node";
const anilist = new Anilist();

// Helper function untuk membuat SVG error yang informatif
const createErrorCard = (message) => {
  return `
    <svg width="330" height="150" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 150" style="font-family: 'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif;">
      <rect width="100%" height="100%" fill="#282c34" rx="10" ry="10" />
      <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="#e06c75" font-weight="bold">Oops! An Error Occurred</text>
      <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="#abb2bf">${message}</text>
    </svg>
  `;
};

export default async function handler(req, res) {
  // Selalu set header SVG di awal untuk konsistensi
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=7200, stale-while-revalidate=3600"
  );

  try {
    const targetUsername = req.query.username || "kenndeclouv";
    const user = await anilist.user.all(targetUsername);

    // Kalau user null (tidak ditemukan), langsung kirim error
    if (!user) {
      return res
        .status(404)
        .send(createErrorCard(`User '${targetUsername}' Not Found`));
    }

    const userId = user.id;
    const activities = await anilist.user.getRecentActivity(userId, 1, 15);

    const watchingActivities = activities
      .filter(
        (act) =>
          act.media &&
          act.media.type === "ANIME" &&
          act.status &&
          act.status.includes("watched episode")
      )
      .slice(0, 3);

    if (watchingActivities.length === 0) {
      return res.status(200).send(createErrorCard("No recent activity found."));
    }

    const cardWidth = 330;
    const cardHeight = 150;
    const posterWidth = 80;
    const posterHeight = 112;

    const postersSVG = watchingActivities
      .map((activity, index) => {
        const xOffset = 20 + index * (posterWidth + 15);
        const posterUrl = activity.media.coverImage.large;
        return `<image href="${posterUrl}" x="${xOffset}" y="25" width="${posterWidth}" height="${posterHeight}" rx="8" ry="8" />`;
      })
      .join("");

    const svg = `
      <svg width="${cardWidth}" height="${cardHeight}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cardWidth} ${cardHeight}" style="font-family: 'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif;">
        <rect width="100%" height="100%" fill="#282c34" rx="10" ry="10" />
        <text x="20" y="16" font-size="14" fill="#abb2bf" font-weight="bold">Recently Watched on AniList</text>
        ${postersSVG}
      </svg>
    `;

    res.status(200).send(svg);
  } catch (error) {
    console.error(error);
    // INI BAGIAN PENTINGNYA: Kirim SVG error jika ada masalah tak terduga
    res.status(500).send(createErrorCard("Could not fetch data."));
  }
}
