import Anilist from "anilist-node";
const anilist = new Anilist();

// 1. Lebar error card disamakan
const createErrorCard = (message) => {
  return `
    <svg width="495" height="150" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 495 150" style="font-family: 'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif;">
      <rect width="100%" height="100%" fill="#282c34" rx="10" ry="10" />
      <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="#e06c75" font-weight="bold">Oops! An Error Occurred</text>
      <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="#abb2bf">${message}</text>
    </svg>
  `;
};

const createAnimeCardSVG = (entry, x, y) => {
  const cardWidth = 225;
  const cardHeight = 100;
  const posterWidth = 65;
  const title =
    entry.media.title.romaji ||
    entry.media.title.english ||
    entry.media.title.native;
  const score = entry.score > 0 ? `⭐ ${entry.score} / 10` : "";
  const progress = entry.progress > 0 ? `Ep ${entry.progress}` : "";

  return `
    <g transform="translate(${x}, ${y})">
      <rect width="${cardWidth}" height="${cardHeight}" fill="#383c44" rx="8" ry="8"/>
      <image href="${`https://img.anili.st/media/${entry.media.id}`}" x="10" y="10" width="${posterWidth}" height="${
    cardHeight - 20
  }" rx="6" ry="6" />
      <foreignObject x="${posterWidth + 20}" y="10" width="${
    cardWidth - posterWidth - 30
  }" height="${cardHeight - 20}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Segoe UI', Ubuntu, sans-serif; color: #abb2bf; height: 100%; display: flex; flex-direction: column;">
          <strong style="font-size: 14px; line-height: 1.2; word-break: break-word;">${escapeXml(
            title
          )}</strong>
          <div style="flex-grow: 1;"></div>
          <div style="font-size: 12px; display: flex; justify-content: space-between;">
            <span>${score}</span>
            <span>${progress}</span>
          </div>
        </div>
      </foreignObject>
    </g>
  `;
};

const createRowSVG = (title, entries, yOffset) => {
  if (!entries || entries.length === 0) return "";
  const validEntries = entries.filter((e) => e.media && e.media.id).slice(0, 2);
  if (validEntries.length === 0) return "";

  const animeCards = validEntries
    .map((entry, index) => createAnimeCardSVG(entry, 20 + index * 245, 25))
    .join("");

  return `
    <g transform="translate(0, ${yOffset})">
      <text x="20" y="12" font-size="16" fill="#98c379" font-weight="bold">${title}</text>
      ${animeCards}
    </g>
  `;
};

const escapeXml = (unsafe) => {
  return unsafe.replace(
    /[<>&'"]/g,
    (c) =>
      ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[
        c
      ])
  );
};

export default async function handler(req, res) {
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader(
    "Cache-Control",
    "public, max-age=7200, must-revalidate" // Cache selama 2 jam
  );

  try {
    const targetUsername = req.query.username || "kenndeclouv";
    const user = await anilist.user.all(targetUsername);

    if (!user) {
      return res
        .status(404)
        .send(createErrorCard(`User '${targetUsername}' Not Found`));
    }
    const userId = user.id;

    const lists = await anilist.lists.anime(userId);

    const watchingList = lists.find(
      (list) => list.name === "Watching" || list.name === "Current"
    )?.entries;
    const completedList = lists.find(
      (list) => list.name === "Completed"
    )?.entries;
    const planningList = lists.find(
      (list) => list.name === "Planning"
    )?.entries;

    // 2. Kalkulasi tinggi card secara dinamis
    let cardHeight = 55; // Tinggi dasar untuk header
    const rowHeight = 145; // Tinggi satu baris kategori (termasuk padding)
    let yOffset = 50;

    const rows = [
      { title: "Watching", list: watchingList },
      { title: "Completed", list: completedList },
      { title: "Planning", list: planningList },
    ];

    let renderedRows = [];
    for (const row of rows) {
      if (row.list && row.list.length > 0) {
        renderedRows.push(createRowSVG(row.title, row.list, yOffset));
        cardHeight += rowHeight;
        yOffset += rowHeight;
      }
    }
    cardHeight += 15; // Padding bawah

    const cardWidth = 495;
    const svg = `
      <svg width="${cardWidth}" height="${cardHeight}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cardWidth} ${cardHeight}" style="font-family: 'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif;">
        <rect width="100%" height="100%" fill="#282c34" rx="10" ry="10" />
        <text x="20" y="30" font-size="18" fill="#abb2bf" font-weight="bold">${escapeXml(
          targetUsername
        )}'s AniList</text>
        ${renderedRows.join("")}
      </svg>
    `;

    res.status(200).send(svg);
  } catch (error) {
    console.error(error);
    res.status(500).send(createErrorCard("Could not fetch data."));
  }
}
