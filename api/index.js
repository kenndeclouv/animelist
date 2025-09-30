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

// Table row for anime entry
const createAnimeTableRow = (
  entry,
  y,
  rowHeight,
  primaryColor,
  accentColor,
  textColor,
  posterBg
) => {
  const posterWidth = 48;
  const posterHeight = rowHeight - 12;
  const title =
    entry.media.title.romaji ||
    entry.media.title.english ||
    entry.media.title.native;
  const score = entry.score > 0 ? `⭐ ${entry.score} / 10` : "-";
  const progress = entry.progress > 0 ? `Ep ${entry.progress}` : "-";
  const status = entry.status || "-";
  return `
    <g>
      <rect x="0" y="${y}" width="100%" height="${rowHeight}" fill="${posterBg}" opacity="0.12"/>
      <rect x="0" y="${y}" width="8" height="${rowHeight}" fill="${accentColor}" rx="4"/>
      <image href="https://img.anili.st/media/${entry.media.id}" x="16" y="${
    y + 6
  }" width="${posterWidth}" height="${posterHeight}" rx="8" ry="8"/>
      <text x="76" y="${
        y + 26
      }" font-size="16" fill="${primaryColor}" font-weight="bold">${escapeXml(
    title
  )}</text>
      <text x="76" y="${y + 46}" font-size="13" fill="${textColor}">${escapeXml(
    entry.media.format || "-"
  )}</text>
      <text x="320" y="${
        y + rowHeight / 2 + 5
      }" font-size="14" fill="${textColor}" text-anchor="middle">${score}</text>
      <text x="400" y="${
        y + rowHeight / 2 + 5
      }" font-size="14" fill="${textColor}" text-anchor="middle">${progress}</text>
      <text x="480" y="${
        y + rowHeight / 2 + 5
      }" font-size="14" fill="${textColor}" text-anchor="middle">${escapeXml(
    status
  )}</text>
    </g>
  `;
};

// Table section for a list (Watching, Completed, Planning)
const createAnimeTableSection = (title, entries, yStart, options) => {
  const {
    primaryColor,
    accentColor,
    textColor,
    sectionBg,
    posterBg,
    rowHeight,
    width,
    headerFontSize,
    headerHeight,
    maxRows,
  } = options;
  let y = yStart;
  let section = `
    <rect x="0" y="${y}" width="${width}" height="${headerHeight}" fill="${sectionBg}" rx="8"/>
    <text x="20" y="${
      y + headerHeight / 2 + headerFontSize / 2 - 2
    }" font-size="${headerFontSize}" fill="${primaryColor}" font-weight="bold">${escapeXml(
    title
  )}</text>
  `;
  y += headerHeight;

  if (entries.length === 0) {
    section += `<text x="50%" y="${
      y + rowHeight / 2 + 5
    }" text-anchor="middle" font-size="14" fill="${textColor}">No anime in this list.</text>`;
    y += rowHeight;
  } else {
    entries.slice(0, maxRows).forEach((entry) => {
      section += createAnimeTableRow(
        entry,
        y,
        rowHeight,
        primaryColor,
        accentColor,
        textColor,
        posterBg
      );
      y += rowHeight;
    });
  }
  return { section, height: y - yStart };
};

export default async function handler(req, res) {
  // Customization via query
  const bgColor = req.query.bgColor || "#23272e";
  const primaryColor = req.query.primaryColor || "#5fd3bc";
  const accentColor = req.query.accentColor || "#5fd3bc";
  const sectionBg = req.query.sectionBg || "#23272e";
  const posterBg = req.query.posterBg || "#5fd3bc";
  const textColor = req.query.textColor || "#abb2bf";
  const titleText =
    req.query.title ||
    (req.query.username ? `${req.query.username}'s AniList` : "AniList");
  const maxRows = parseInt(req.query.maxRows) || 5;
  const width = parseInt(req.query.width) || 560;
  const rowHeight = parseInt(req.query.rowHeight) || 56;
  const headerHeight = parseInt(req.query.headerHeight) || 38;
  const headerFontSize = parseInt(req.query.headerFontSize) || 18;
  const sectionGap = parseInt(req.query.sectionGap) || 18;
  const titleFontSize = parseInt(req.query.titleFontSize) || 28;
  const titleMargin = parseInt(req.query.titleMargin) || 32;

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

    // Pisahkan list berdasarkan kategori
    const watchingList =
      lists.find((list) => list.name === "Watching" || list.name === "Current")
        ?.entries || [];
    const completedList =
      lists.find((list) => list.name === "Completed")?.entries || [];
    const planningList =
      lists.find((list) => list.name === "Planning")?.entries || [];

    // Table columns: Title | Format | Score | Progress | Status
    // Table header
    const tableHeader = (y) => `
      <g>
        <rect x="0" y="${y}" width="${width}" height="32" fill="${bgColor}" opacity="0.95"/>
        <text x="76" y="${
          y + 22
        }" font-size="15" fill="${primaryColor}" font-weight="bold">Title</text>
        <text x="320" y="${
          y + 22
        }" font-size="15" fill="${primaryColor}" font-weight="bold" text-anchor="middle">Score</text>
        <text x="400" y="${
          y + 22
        }" font-size="15" fill="${primaryColor}" font-weight="bold" text-anchor="middle">Progress</text>
        <text x="480" y="${
          y + 22
        }" font-size="15" fill="${primaryColor}" font-weight="bold" text-anchor="middle">Status</text>
      </g>
    `;

    // Render each section
    let y = titleMargin + titleFontSize + 12;
    let svgSections = "";
    const sectionOptions = {
      primaryColor,
      accentColor,
      textColor,
      sectionBg,
      posterBg,
      rowHeight,
      width,
      headerFontSize,
      headerHeight,
      maxRows,
    };

    // Watching
    svgSections += createAnimeTableSection(
      "Watching",
      watchingList,
      y,
      sectionOptions
    ).section;
    y +=
      headerHeight +
      Math.max(1, Math.min(watchingList.length, maxRows)) * rowHeight +
      sectionGap;

    // Completed
    svgSections += createAnimeTableSection(
      "Completed",
      completedList,
      y,
      sectionOptions
    ).section;
    y +=
      headerHeight +
      Math.max(1, Math.min(completedList.length, maxRows)) * rowHeight +
      sectionGap;

    // Planning
    svgSections += createAnimeTableSection(
      "Planning",
      planningList,
      y,
      sectionOptions
    ).section;
    y +=
      headerHeight +
      Math.max(1, Math.min(planningList.length, maxRows)) * rowHeight;

    // SVG height calculation
    const svgHeight = y + 24;

    // SVG
    const svg = `
      <svg width="${width}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${svgHeight}" style="font-family: 'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif;">
        <defs>
          <linearGradient id="bgGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${bgColor}" />
            <stop offset="100%" stop-color="#181a20" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bgGradient)" rx="18" ry="18" />
        <text x="24" y="${
          titleMargin + titleFontSize
        }" font-size="${titleFontSize}" fill="${primaryColor}" font-weight="bold" style="letter-spacing:1px;">${escapeXml(
      titleText
    )}</text>
        ${tableHeader(titleMargin + titleFontSize + 2)}
        ${svgSections}
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

/*
========================
AniList SVG Table API Documentation
========================

Endpoint: /api/index.js

Description:
  Generate a customizable SVG anime list table for an AniList user, separated by Watching, Completed, and Planning lists. Each list is rendered as a section (row group) in a vertical table layout, with each anime as a row. The design is fully customizable via query parameters.

Query Parameters:
  - username:      (string) AniList username (default: "kenndeclouv")
  - title:         (string) Custom title for the SVG (default: "<username>'s AniList")
  - bgColor:       (string) Background color (default: "#23272e")
  - primaryColor:  (string) Main accent color (default: "#5fd3bc")
  - accentColor:   (string) Color for section accent bars (default: "#5fd3bc")
  - sectionBg:     (string) Section header background color (default: "#23272e")
  - posterBg:      (string) Row background accent color (default: "#5fd3bc")
  - textColor:     (string) Text color (default: "#abb2bf")
  - width:         (number) SVG width in px (default: 560)
  - rowHeight:     (number) Height of each anime row (default: 56)
  - headerHeight:  (number) Height of each section header (default: 38)
  - headerFontSize:(number) Font size for section headers (default: 18)
  - titleFontSize: (number) Font size for main title (default: 28)
  - titleMargin:   (number) Top margin for main title (default: 32)
  - sectionGap:    (number) Gap between sections (default: 18)
  - maxRows:       (number) Max rows per section (default: 5)

Features:
  - Each list (Watching, Completed, Planning) is rendered as a separate table section.
  - Each anime row shows: Poster, Title, Format, Score, Progress, Status.
  - Fully responsive SVG layout, customizable colors, font sizes, and row counts.
  - If a list is empty, a message is shown in that section.
  - If user not found, returns a styled SVG error card.

Example Usage:
  /api/index.js?username=kenndeclouv&primaryColor=%235fd3bc&bgColor=%2323272e&maxRows=3

Customization:
  All colors and sizes can be changed via query parameters for full UI/UX flexibility.

*/
