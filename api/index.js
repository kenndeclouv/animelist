// api/index.js
import Anilist from "anilist-node";
const anilist = new Anilist();

export default async function handler(req, res) {
  try {
    // Ganti 'NekomataOkaayu' dengan username target
    const username = "kenndeclouv";
    const user = await anilist.user.all(username);
    const userId = user.id;

    // Ambil 5 aktivitas terakhir (nonton, baca, dll)
    const activities = await anilist.user.getRecentActivity(userId, 1, 5);

    // Kirim datanya sebagai JSON untuk tes
    res.status(200).json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching data" });
  }
}
