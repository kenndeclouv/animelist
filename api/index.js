import Anilist from "anilist-node";
const anilist = new Anilist();

// Helper to escape XML
const escapeXml = (unsafe) => {
  return unsafe
    ? unsafe.replace(
        /[<>&'"]/g,
        (c) =>
          ({
            "<": "&lt;",
            ">": "&gt;",
            "&": "&amp;",
            "'": "&apos;",
            '"': "&quot;",
          }[c])
      )
    : "";
};

// Error card with customizable colors
const createErrorCard = (
  message,
  bgColor = "#282c34",
  primaryColor = "#e06c75"
) => {
  return `
    <svg width="700" height="150" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 150" style="font-family: 'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif;">
      <rect width="100%" height="100%" fill="${bgColor}" rx="16" ry="16" />
      <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="${primaryColor}" font-weight="bold">Oops! An Error Occurred</text>
      <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="#abb2bf">${escapeXml(
        message
      )}</text>
    </svg>
  `;
};

// Create a single anime card for the row
const createAnimeCardSVG = (entry, x, y, primaryColor) => {
  const cardWidth = 170;
  const cardHeight = 110;
  const posterWidth = 60;
  const title =
    entry.media.title.romaji ||
    entry.media.title.english ||
    entry.media.title.native;
  const score = entry.score > 0 ? `⭐ ${entry.score} / 10` : "";
  const progress = entry.progress > 0 ? `Ep ${entry.progress}` : "";

  // Use a nice drop shadow and a colored accent bar
  return `
    <g transform="translate(${x}, ${y})">
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.18"/>
      </filter>
      <rect width="${cardWidth}" height="${cardHeight}" fill="#23272e" rx="12" ry="12" filter="url(#shadow)" />
      <rect x="0" y="0" width="6" height="${cardHeight}" fill="${primaryColor}" rx="3" />
      <image href="https://img.anili.st/media/${
        entry.media.id
      }" x="14" y="14" width="${posterWidth}" height="${
    cardHeight - 28
  }" rx="8" ry="8" />
      <foreignObject x="${posterWidth + 28}" y="14" width="${
    cardWidth - posterWidth - 38
  }" height="${cardHeight - 28}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Segoe UI', Ubuntu, sans-serif; color: #abb2bf; height: 100%; display: flex; flex-direction: column;">
          <strong style="font-size: 15px; line-height: 1.2; word-break: break-word; color: ${primaryColor};">${escapeXml(
    title
  )}</strong>
          <div style="flex-grow: 1;"></div>
          <div style="font-size: 13px; display: flex; justify-content: space-between;">
            <span>${score}</span>
            <span>${progress}</span>
          </div>
        </div>
      </foreignObject>
    </g>
  `;
};

export default async function handler(req, res) {
  // Customization via query
  const bgColor = req.query.bgColor || "#23272e";
  const primaryColor = req.query.primaryColor || "#5fd3bc";
  const titleText =
    req.query.title ||
    (req.query.username ? `${req.query.username}'s AniList` : "AniList");

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=7200, must-revalidate");

  try {
    const targetUsername = req.query.username || "kenndeclouv";
    const user = await anilist.user.all(targetUsername);

    if (!user) {
      return res
        .status(404)
        .send(
          createErrorCard(
            `User '${targetUsername}' Not Found`,
            bgColor,
            primaryColor
          )
        );
    }
    const userId = user.id;

    const lists = await anilist.lists.anime(userId);

    // Merge all entries from Watching/Current, Completed, Planning
    const watchingList =
      lists.find((list) => list.name === "Watching" || list.name === "Current")
        ?.entries || [];
    const completedList =
      lists.find((list) => list.name === "Completed")?.entries || [];
    const planningList =
      lists.find((list) => list.name === "Planning")?.entries || [];

    // Combine and filter for valid entries, max 6 for row
    const allEntries = [
      ...watchingList,
      ...completedList,
      ...planningList,
    ].filter((e) => e.media && e.media.id);

    const maxCards = 6;
    const entriesToShow = allEntries.slice(0, maxCards);

    // Card layout
    const cardWidth = 170;
    const cardHeight = 110;
    const cardGap = 18;
    const totalWidth =
      entriesToShow.length > 0
        ? 40 +
          entriesToShow.length * cardWidth +
          (entriesToShow.length - 1) * cardGap
        : 700;
    const svgHeight = 180;

    // SVG header
    const headerHeight = 48;

    // Render anime cards in a single row
    const cardsSVG = entriesToShow
      .map((entry, idx) =>
        createAnimeCardSVG(
          entry,
          20 + idx * (cardWidth + cardGap),
          headerHeight,
          primaryColor
        )
      )
      .join("");

    // If no entries, show a message
    const emptyMessage =
      entriesToShow.length === 0
        ? `<text x="${totalWidth / 2}" y="${
            svgHeight / 2 + 20
          }" text-anchor="middle" font-size="18" fill="#abb2bf">No anime found in lists.</text>`
        : "";

    // SVG
    const svg = `
      <svg width="${totalWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${svgHeight}" style="font-family: 'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif;">
        <defs>
          <linearGradient id="bgGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${bgColor}" />
            <stop offset="100%" stop-color="#181a20" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bgGradient)" rx="18" ry="18" />
        <text x="28" y="36" font-size="24" fill="${primaryColor}" font-weight="bold" style="letter-spacing:1px;">${escapeXml(
      titleText
    )}</text>
        ${cardsSVG}
        ${emptyMessage}
      </svg>
    `;

    res.status(200).send(svg);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send(createErrorCard("Could not fetch data.", "#23272e", "#e06c75"));
  }
}
