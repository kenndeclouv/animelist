import Anilist from "anilist-node";
const anilist = new Anilist();

const createErrorCard = (message) => {
  return `
      <svg width="330" height="150" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 150" style="font-family: 'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif;">
        <rect width="100%" height="100%" fill="#282c34" rx="10" ry="10" />
        <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="#e06c75" font-weight="bold">Oops! An Error Occurred</text>
        <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="#abb2bf">${message}</text>
      </svg>
    `;
};
// --- HELPER FUNCTION BARU ---
// Fungsi ini tugasnya membuat satu baris kategori (misal: "Watching") lengkap dengan posternya
const createRowSVG = (title, entries, yOffset) => {
  if (!entries || entries.length === 0) return "";

  const posterWidth = 80;
  const posterHeight = 112;

  // --- INI DIA PERBAIKANNYA ---
  // 1. Filter dulu untuk memastikan setiap entri punya data gambar yang lengkap
  const validEntries = entries
    .filter(
      (entry) =>
        entry.media && entry.media.coverImage && entry.media.coverImage.large
    )
    .slice(0, 4); // Ambil 4 entri pertama YANG VALID

  // 2. Baru lakukan .map() pada data yang sudah pasti aman
  const posters = validEntries
    .map((entry, index) => {
      const xOffset = 20 + index * (posterWidth + 15);
      // Sekarang baris ini dijamin aman karena sudah kita filter
      const imageUrl = entry.media.coverImage.large;
      return `<image href="${imageUrl}" x="${xOffset}" y="${
        yOffset + 20
      }" width="${posterWidth}" height="${posterHeight}" rx="8" ry="8" />`;
    })
    .join("");

  // Kalau setelah difilter ternyata tidak ada entri yang valid, jangan render apa-apa
  if (posters.length === 0) return "";

  return `
      <text x="20" y="${
        yOffset + 12
      }" font-size="14" fill="#98c379" font-weight="bold">${title}</text>
      ${posters}
    `;
};

export default async function handler(req, res) {
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=86400, stale-while-revalidate=43200"
  ); // Cache 1 hari

  try {
    const targetUsername = req.query.username || "kenndeclouv";
    const user = await anilist.user.all(targetUsername);

    if (!user) {
      return res
        .status(404)
        .send(createErrorCard(`User '${targetUsername}' Not Found`));
    }
    const userId = user.id;

    // --- PERUBAHAN BESAR: Mengambil data LIST, bukan lagi activity ---
    const lists = await anilist.lists.anime(userId);
    console.log("--- DEBUGGING: Isi dari variabel 'lists' ---", lists);
    // Cari list yang spesifik: Watching, Planning, dan Completed
    const watchingList = lists.find(
      (list) => list.name === "Watching" || list.name === "Current"
    )?.entries; // Mencari Watching ATAU Current
    const planningList = lists.find(
      (list) => list.name === "Planning"
    )?.entries;
    const completedList = lists.find(
      (list) => list.name === "Completed"
    )?.entries;

    // --- DESAIN SVG BARU YANG LEBIH BESAR ---
    const cardWidth = 450;
    const cardHeight = 480;

    const svg = `
      <svg width="${cardWidth}" height="${cardHeight}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cardWidth} ${cardHeight}" style="font-family: 'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif;">
        <rect width="100%" height="100%" fill="#282c34" rx="10" ry="10" />
        <text x="20" y="25" font-size="18" fill="#abb2bf" font-weight="bold">${targetUsername}'s AniList Stats</text>
        
        ${createRowSVG("Watching", watchingList, 50)}
        ${createRowSVG("Planning", planningList, 200)}
        ${createRowSVG("Completed", completedList, 350)}
      </svg>
    `;

    res.status(200).send(svg);
  } catch (error) {
    console.error(error);
    res.status(500).send(createErrorCard("Could not fetch data."));
  }
}
