import Anilist from "anilist-node";
const anilist = new Anilist();

export default async function handler(req, res) {
  try {
    // Kamu bisa ganti username ini dengan query parameter nanti, tapi untuk sekarang kita pakai ini
    const username = req.query.username || "kenndeclouv";
    const user = await anilist.user.all(username);
    const userId = user.id;

    const activities = await anilist.user.getRecentActivity(userId, 1, 15); // Ambil 15 aktivitas terakhir buat jaga-jaga

    // 1. FILTER DATA: Ambil 3 aktivitas nonton anime terbaru
    const watchingActivities = activities
      .filter(
        (act) =>
          act.media &&
          act.media.type === "ANIME" &&
          act.status &&
          act.status.includes("watched episode")
      )
      .slice(0, 3);

    // Kalau nggak ada aktivitas nonton, kirim pesan error
    if (watchingActivities.length === 0) {
      return res.status(200).send("No recent anime watching activity found.");
    }

    // 2. SIAPKAN KANVAS SVG: Tentukan ukuran dan style dasar
    const cardWidth = 330; // Lebar card
    const cardHeight = 150; // Tinggi card
    const posterWidth = 80; // Lebar poster
    const posterHeight = 112; // Tinggi poster

    // 3. RAKIT POSTER: Loop data dan buat elemen <image> untuk tiap poster
    const postersSVG = watchingActivities
      .map((activity, index) => {
        // Kalkulasi posisi X untuk tiap poster biar berjajar rapi
        const xOffset = 20 + index * (posterWidth + 15);
        const posterUrl = activity.media.coverImage.large;

        return `
        <image 
          href="${posterUrl}" 
          x="${xOffset}" 
          y="25" 
          width="${posterWidth}" 
          height="${posterHeight}"
          rx="8" ry="8"
          style="border-radius: 8px;"
        />
      `;
      })
      .join(""); // Gabungkan semua string <image> jadi satu

    // 4. GABUNGKAN SEMUA JADI SATU SVG UTUH
    const svg = `
      <svg 
        width="${cardWidth}" 
        height="${cardHeight}" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 ${cardWidth} ${cardHeight}"
        style="font-family: 'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif;"
      >
        <rect width="100%" height="100%" fill="#282c34" rx="10" ry="10" />
        <text x="20" y="16" font-size="14" fill="#abb2bf" font-weight="bold">Recently Watched on AniList</text>
        ${postersSVG}
      </svg>
    `;

    // 5. KIRIM SEBAGAI GAMBAR: Set header dan kirim SVG-nya
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=7200, stale-while-revalidate=3600"
    );
    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(svg);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Oops! Something went wrong." });
  }
}
