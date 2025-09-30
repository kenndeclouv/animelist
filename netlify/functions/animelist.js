/**
 * @file AniList SVG Table API Netlify Function
 * @copyright Copyright (c) 2025 kenndeclouv
 * @license MIT
 *
 * This file implements a Netlify serverless function that generates a customizable SVG table
 * for an AniList user, showing their Watching, Completed, and Planning anime lists with inlined poster images.
 * The SVG is suitable for embedding in GitHub READMEs and personal sites.
 *
 * Now supports layout type: "list" (default, row/table) and "grid".
 */

import Anilist from "anilist-node";
const anilist = new Anilist();

/**
 * Escapes special XML characters in a string to ensure valid SVG/XML output.
 * @param {string} unsafe - The string to escape.
 * @returns {string} The escaped string.
 */
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

/**
 * Normalizes color input so user can use # or not, and doesn't need to encode # as %23.
 * Accepts: "#49ACD2", "49ACD2", "rgb(0,0,0)", "red", etc.
 * If hex and missing #, adds it.
 * @param {string} color
 * @returns {string}
 */
const normalizeColor = (color) => {
  if (!color) return color;
  // If already starts with # or is not a hex color, return as is
  if (
    color.startsWith("#") ||
    color.startsWith("rgb") ||
    color.startsWith("hsl") ||
    color.startsWith("var(") ||
    /^[a-zA-Z]+$/.test(color)
  ) {
    return color;
  }
  // If it's a 3 or 6 digit hex without #, add #
  if (/^[0-9a-fA-F]{6}$/.test(color) || /^[0-9a-fA-F]{3}$/.test(color)) {
    return "#" + color;
  }
  // If it's %23xxxxxx, replace with #
  if (color.startsWith("%23")) {
    return "#" + color.slice(3);
  }
  return color;
};

/**
 * Fetches an image from a URL and encodes it as a base64 data URI.
 * @async
 * @param {string} url - The image URL.
 * @returns {Promise<string>} The base64-encoded data URI of the image, or an empty string on failure.
 */
const getBase64Image = async (url) => {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "github-kenndeclouv-animelist-widget/1.0",
      },
    });
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    // Ensure the image format is correct (AniList posters are often jpeg)
    const contentType = response.headers.get("content-type") || "image/jpeg";
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error("Failed to fetch and encode image:", error);
    return "";
  }
};

/**
 * Creates an SVG error card with a customizable message and colors.
 * @param {string} message - The error message to display.
 * @param {string} [bgColor="#282c34"] - The background color of the card.
 * @param {string} [primaryColor="#e06c75"] - The primary accent color.
 * @returns {string} SVG markup for the error card.
 */
const createErrorCard = (
  message,
  bgColor = "#282c34",
  primaryColor = "#e06c75"
) => {
  bgColor = normalizeColor(bgColor);
  primaryColor = normalizeColor(primaryColor);
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

/**
 * Creates an SVG table row for an anime entry, including the poster image and details.
 * @param {object} entry - The anime list entry object from AniList.
 * @param {string} base64Image - The base64-encoded poster image data URI.
 * @param {number} y - The y-coordinate for the row.
 * @param {number} rowHeight - The height of the row.
 * @param {string} primaryColor - The primary accent color.
 * @param {string} accentColor - The accent bar color.
 * @param {string} textColor - The text color.
 * @param {string} posterBg - The background color for the poster area.
 * @returns {string} SVG markup for the table row.
 */
const createAnimeTableRow = (
  entry,
  base64Image,
  y,
  rowHeight,
  primaryColor,
  accentColor,
  textColor,
  posterBg
) => {
  primaryColor = normalizeColor(primaryColor);
  accentColor = normalizeColor(accentColor);
  textColor = normalizeColor(textColor);
  posterBg = normalizeColor(posterBg);

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
      <image href="${base64Image}" x="16" y="${
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

/**
 * Creates an SVG grid card for an anime entry.
 * @param {object} entry - The anime list entry object from AniList.
 * @param {string} base64Image - The base64-encoded poster image data URI.
 * @param {number} x - The x-coordinate for the card.
 * @param {number} y - The y-coordinate for the card.
 * @param {number} cardWidth - The width of the card.
 * @param {number} cardHeight - The height of the card.
 * @param {string} primaryColor - The primary accent color.
 * @param {string} accentColor - The accent bar color.
 * @param {string} textColor - The text color.
 * @param {string} posterBg - The background color for the poster area.
 * @returns {string} SVG markup for the grid card.
 */
/**
 * Creates a neater, more robust SVG grid card for an anime entry.
 * It handles long titles by splitting them into two lines.
 * @returns {string} SVG markup for the grid card.
 */
const createAnimeGridCard = (
  entry,
  base64Image,
  x,
  y,
  cardWidth,
  cardHeight,
  primaryColor,
  accentColor,
  textColor,
  posterBg
) => {
  primaryColor = normalizeColor(primaryColor);
  accentColor = normalizeColor(accentColor);
  textColor = normalizeColor(textColor);
  posterBg = normalizeColor(posterBg);

  const title =
    entry.media.title.romaji ||
    entry.media.title.english ||
    entry.media.title.native;
  const score = entry.score > 0 ? `⭐ ${entry.score}` : "";
  const progress = entry.progress > 0 ? `Ep ${entry.progress}` : "";

  // Poster takes up the top part of the card
  const posterHeight = cardHeight * 0.65;
  const cardPadding = 12;

  // Logic to split long titles into two lines
  const maxCharsPerLine = 20;
  let titleLine1 = title;
  let titleLine2 = "";
  if (title.length > maxCharsPerLine) {
    let breakPoint = title.lastIndexOf(" ", maxCharsPerLine);
    if (breakPoint === -1) breakPoint = maxCharsPerLine;
    titleLine1 = title.substring(0, breakPoint);
    titleLine2 = title.substring(breakPoint + 1);
    if (titleLine2.length > maxCharsPerLine) {
      titleLine2 = titleLine2.substring(0, maxCharsPerLine - 3) + "...";
    }
  }

  const textYStart = y + posterHeight + 20;

  return `
    <g>
      <rect x="${x}" y="${y}" width="${cardWidth}" height="${cardHeight}" fill="${posterBg}" opacity="0.10" rx="12"/>
      <image href="${base64Image}" x="${x + cardPadding}" y="${
    y + cardPadding
  }" width="${
    cardWidth - cardPadding * 2
  }" height="${posterHeight}" rx="8" ry="8" style="object-fit: cover;"/>
      
      <text x="${
        x + cardWidth / 2
      }" y="${textYStart}" font-size="14" fill="${primaryColor}" font-weight="bold" text-anchor="middle">
        <tspan>${escapeXml(titleLine1)}</tspan>
        ${
          titleLine2
            ? `<tspan x="${x + cardWidth / 2}" dy="1.2em">${escapeXml(
                titleLine2
              )}</tspan>`
            : ""
        }
      </text>
      
      <text x="${x + cardPadding}" y="${
    y + cardHeight - cardPadding
  }" font-size="12" fill="${accentColor}" font-weight="bold" dominant-baseline="middle">${score}</text>
      <text x="${x + cardWidth - cardPadding}" y="${
    y + cardHeight - cardPadding
  }" font-size="12" fill="${textColor}" text-anchor="end" dominant-baseline="middle">${progress}</text>
    </g>
  `;
};

/**
 * Netlify handler function for the AniList SVG Table API.
 *
 * Query Parameters:
 * - username (string): AniList username. Default: "kenndeclouv"
 * - title (string): Custom title. Default: "<username>'s AniList"
 * - bgColor (string): Background color. Default: "#23272e"
 * - primaryColor (string): Main accent color. Default: "#49ACD2"
 * - accentColor (string): Section accent bar color. Default: "#49ACD2"
 * - sectionBg (string): Section header background. Default: "#23272e"
 * - posterBg (string): Row accent background. Default: "#49ACD2"
 * - textColor (string): Text color. Default: "#abb2bf"
 * - width (number): SVG width. Default: 560
 * - rowHeight (number): Row height. Default: 56
 * - headerHeight (number): Section header height. Default: 38
 * - headerFontSize (number): Section header font size. Default: 18
 * - titleFontSize (number): Main title font size. Default: 28
 * - titleMargin (number): Top margin for title. Default: 32
 * - maxRows (number): Maximum rows per section. Default: 5
 * - sectionGap (number): Gap between sections. Default: 18
 * - layout (string): "list" (default, row/table) or "grid"
 * - gridColumns (number): Number of columns in grid layout (default: 3)
 * - gridCardHeight (number): Card height in grid layout (default: 210)
 * - gridCardWidth (number): Card width in grid layout (default: 140)
 *
 * @param {object} event - Netlify event object, containing queryStringParameters.
 * @param {object} context - Netlify context object.
 * @returns {Promise<Response>} SVG image as a Response object.
 */
export const handler = async (event, context) => {
  const query = event.queryStringParameters || {};

  // --- FIX: Hardcoded a padding value for better spacing ---
  const svgPadding = 24;

  const bgColor = normalizeColor(query.bgColor || "#23272e");
  const primaryColor = normalizeColor(query.primaryColor || "#49ACD2");
  const accentColor = normalizeColor(query.accentColor || "#49ACD2");
  const sectionBg = normalizeColor(query.sectionBg || "#23272e");
  const posterBg = normalizeColor(query.posterBg || "#49ACD2");
  const textColor = normalizeColor(query.textColor || "#abb2bf");
  const titleText =
    query.title ||
    (query.username
      ? `${query.username}'s Animelist`
      : "kenndeclouv's Animelist");
  const maxRows = parseInt(query.maxRows) || 5;
  const width = parseInt(query.width) || 560; // This is now the total SVG width
  const rowHeight = parseInt(query.rowHeight) || 56;
  const headerHeight = parseInt(query.headerHeight) || 38;
  const headerFontSize = parseInt(query.headerFontSize) || 18;
  const sectionGap = parseInt(query.sectionGap) || 18;
  const titleFontSize = parseInt(query.titleFontSize) || 28;
  const titleMargin = parseInt(query.titleMargin) || 32;

  const layout = (query.layout || "list").toLowerCase();

  // --- FIX: Simplified Grid Layout Logic to a fixed 2-column layout ---
  const gridColumns = 2; // Hardcoded to 2 columns as requested
  const gridCardHeight = parseInt(query.gridCardHeight) || 240; // Increased height for better look
  const gridGap = 18;
  // Calculate card width based on total width, padding, and gap to make it fit perfectly
  const gridCardWidth =
    (width - svgPadding * 2 - gridGap * (gridColumns - 1)) / gridColumns;

  const headers = {
    "Content-Type": "image/svg+xml",
    "Cache-Control": "public, max-age=7200, must-revalidate",
  };

  try {
    const targetUsername = query.username || "kenndeclouv";
    const user = await anilist.user.all(targetUsername);

    if (!user) {
      const errorBody = createErrorCard(
        `User '${targetUsername}' Not Found`,
        bgColor,
        primaryColor
      );
      return { statusCode: 404, headers, body: errorBody };
    }
    const userId = user.id;

    const lists = await anilist.lists.anime(userId);

    const watchingList =
      lists.find((list) => list.name === "Watching" || list.name === "Current")
        ?.entries || [];
    const completedList =
      lists.find((list) => list.name === "Completed")?.entries || [];
    const planningList =
      lists.find((list) => list.name === "Planning")?.entries || [];

    const allEntries = [
      ...watchingList.slice(0, maxRows),
      ...completedList.slice(0, maxRows),
      ...planningList.slice(0, maxRows),
    ];
    const imagePromises = allEntries.map((entry) => {
      const imageUrl = `https://img.anili.st/media/${entry.media.id}`;
      return getBase64Image(imageUrl);
    });
    const base64Images = await Promise.all(imagePromises);
    const imageMap = {};
    allEntries.forEach((entry, idx) => {
      imageMap[entry.media.id] = base64Images[idx];
    });

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

    const renderSectionList = (title, entries, yStart) => {
      let section = "";
      let currentY = yStart;
      section += `<rect x="0" y="${currentY}" width="${width}" height="${headerHeight}" fill="${sectionBg}" rx="8"/>`;
      section += `<text x="20" y="${
        currentY + headerHeight / 2 + headerFontSize / 2 - 2
      }" font-size="${headerFontSize}" fill="${primaryColor}" font-weight="bold">${escapeXml(
        title
      )}</text>`;
      currentY += headerHeight;

      if (entries.length === 0) {
        section += `<text x="50%" y="${
          currentY + rowHeight / 2 + 5
        }" text-anchor="middle" font-size="14" fill="${textColor}">No anime in this list.</text>`;
        currentY += rowHeight;
      } else {
        entries.slice(0, maxRows).forEach((entry) => {
          const base64Image = imageMap[entry.media.id] || "";
          section += createAnimeTableRow(
            entry,
            base64Image,
            currentY,
            rowHeight,
            primaryColor,
            accentColor,
            textColor,
            posterBg
          );
          currentY += rowHeight;
        });
      }
      return { section, height: currentY - yStart };
    };
    
    // --- FIX: Adjusted the grid rendering logic for padding and fixed columns ---
    /**
     * Renders a section of the SVG as a grid for a given list category (grid layout).
     * @returns {{section: string, height: number}} SVG markup and height for the section.
     */
    const renderSectionGrid = (title, entries, yStart) => {
      let section = "";
      let currentY = yStart;
      
      // Use padding for the section header as well
      section += `<rect x="${svgPadding}" y="${currentY}" width="${width - svgPadding * 2}" height="${headerHeight}" fill="${sectionBg}" rx="8"/>`;
      section += `<text x="${svgPadding + 16}" y="${
        currentY + headerHeight / 2 + headerFontSize / 2 - 2
      }" font-size="${headerFontSize}" fill="${primaryColor}" font-weight="bold">${escapeXml(
        title
      )}</text>`;
      currentY += headerHeight + gridGap; // Add gap after header

      if (entries.length === 0) {
        section += `<text x="50%" y="${
          currentY + gridCardHeight / 2
        }" text-anchor="middle" font-size="14" fill="${textColor}">No anime in this list.</text>`;
        currentY += gridCardHeight;
      } else {
        const n = Math.min(entries.length, maxRows);
        const cols = gridColumns;
        const rows = Math.ceil(n / cols);
        let cardIndex = 0;
        
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            if (cardIndex >= n) break;
            const entry = entries[cardIndex];
            const base64Image = imageMap[entry.media.id] || "";
            // Calculate X position with padding
            const x = svgPadding + col * (gridCardWidth + gridGap);
            const y = currentY + row * (gridCardHeight + gridGap);
            section += createAnimeGridCard(
              entry,
              base64Image,
              x,
              y,
              gridCardWidth,
              gridCardHeight,
              primaryColor,
              accentColor,
              textColor,
              posterBg
            );
            cardIndex++;
          }
        }
        currentY += rows * gridCardHeight + (rows > 0 ? (rows - 1) * gridGap : 0);
      }
      return { section, height: currentY - yStart };
    };

    // --- MAIN RENDER LOGIC ---
    let y = titleMargin;
    let svgSections = "";

    if (layout === "grid") {
      const svgWidth = width; // Use the fixed width

      // Main Title
      svgSections += `<text x="${svgPadding}" y="${y}" font-size="${titleFontSize}" fill="${primaryColor}" font-weight="bold" style="letter-spacing:1px;">${escapeXml(titleText)}</text>`;
      y += titleFontSize + sectionGap;

      // Watching
      const watchingResult = renderSectionGrid("Watching", watchingList, y);
      svgSections += watchingResult.section;
      y += watchingResult.height + sectionGap;

      // Completed
      const completedResult = renderSectionGrid("Completed", completedList, y);
      svgSections += completedResult.section;
      y += completedResult.height + sectionGap;

      // Planning
      const planningResult = renderSectionGrid("Planning", planningList, y);
      svgSections += planningResult.section;
      y += planningResult.height;

      const svgHeight = y + svgPadding;

      const svg = `
        <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" style="font-family: 'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif;">
            <rect width="100%" height="100%" fill="${bgColor}" rx="18" ry="18" />
            ${svgSections}
        </svg>
      `;
      return { statusCode: 200, headers, body: svg };

    } else {
      // Default: list/row/table layout
      const mainTitleY = y + titleFontSize;

      // Main title and table header
      svgSections += `<text x="24" y="${mainTitleY}" font-size="${titleFontSize}" fill="${primaryColor}" font-weight="bold" style="letter-spacing:1px;">${escapeXml(titleText)}</text>`;
      svgSections += tableHeader(mainTitleY + 2);
      y = mainTitleY + 12;

      // Watching
      const watchingResult = renderSectionList("Watching", watchingList, y);
      svgSections += watchingResult.section;
      y += watchingResult.height + sectionGap;

      // Completed
      const completedResult = renderSectionList("Completed", completedList, y);
      svgSections += completedResult.section;
      y += completedResult.height + sectionGap;

      // Planning
      const planningResult = renderSectionList("Planning", planningList, y);
      svgSections += planningResult.section;
      y += planningResult.height;

      const svgHeight = y + 24;

      const svg = `
        <svg width="${width}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${svgHeight}" style="font-family: 'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif;">
            <rect width="100%" height="100%" fill="${bgColor}" rx="18" ry="18" />
            ${svgSections}
        </svg>
      `;
      return { statusCode: 200, headers, body: svg };
    }
  } catch (error) {
    console.error(error);
    const errorBody = createErrorCard(
      "Could not fetch data.",
      "#23272e",
      "#e06c75"
    );
    return { statusCode: 500, headers, body: errorBody };
  }
};
