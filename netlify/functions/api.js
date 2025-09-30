/**
 * @file AniList SVG Table API Netlify Function
 * @copyright Copyright (c) 2025 kenndeclouv
 * @license MIT
 *
 * This file implements a Netlify serverless function that generates a customizable SVG table
 * for an AniList user, showing their Watching, Completed, and Planning anime lists with inlined poster images.
 * The SVG is suitable for embedding in GitHub READMEs and personal sites.
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
 * Fetches an image from a URL and encodes it as a base64 data URI.
 * @async
 * @param {string} url - The image URL.
 * @returns {Promise<string>} The base64-encoded data URI of the image, or an empty string on failure.
 */
const getBase64Image = async (url) => {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "GitHub-AniList-SVG-Widget/1.0",
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
 *
 * @param {object} event - Netlify event object, containing queryStringParameters.
 * @param {object} context - Netlify context object.
 * @returns {Promise<Response>} SVG image as a Response object.
 */
export const handler = async (event, context) => {
  const query = event.queryStringParameters || {};

  // Customization via query
  const bgColor = query.bgColor || "#23272e";
  const primaryColor = query.primaryColor || "#49ACD2";
  const accentColor = query.accentColor || "#49ACD2";
  const sectionBg = query.sectionBg || "#23272e";
  const posterBg = query.posterBg || "#49ACD2";
  const textColor = query.textColor || "#abb2bf";
  const titleText =
    query.title || (query.username ? `${query.username}'s AniList` : "AniList");
  const maxRows = parseInt(query.maxRows) || 5;
  const width = parseInt(query.width) || 560;
  const rowHeight = parseInt(query.rowHeight) || 56;
  const headerHeight = parseInt(query.headerHeight) || 38;
  const headerFontSize = parseInt(query.headerFontSize) || 18;
  const sectionGap = parseInt(query.sectionGap) || 18;
  const titleFontSize = parseInt(query.titleFontSize) || 28;
  const titleMargin = parseInt(query.titleMargin) || 32;

  const headers = {
    "Content-Type": "image/svg+xml",
    "Cache-Control": "public, max-age=7200, must-revalidate",
  };

  try {
    const targetUsername = query.username || "kenndeclouv";
    const user = await anilist.user.all(targetUsername);

    if (!user) {
      // Return Response object for 'User Not Found' error
      const errorBody = createErrorCard(
        `User '${targetUsername}' Not Found`,
        bgColor,
        primaryColor
      );
      return {
        statusCode: 404,
        headers,
        body: errorBody,
      };
    }
    const userId = user.id;

    // Fetch anime lists for the user
    const lists = await anilist.lists.anime(userId);

    // Separate lists by category
    const watchingList =
      lists.find((list) => list.name === "Watching" || list.name === "Current")
        ?.entries || [];
    const completedList =
      lists.find((list) => list.name === "Completed")?.entries || [];
    const planningList =
      lists.find((list) => list.name === "Planning")?.entries || [];

    // Fetch and encode all poster images for all entries in all lists
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
    // Map media.id to base64 image
    const imageMap = {};
    allEntries.forEach((entry, idx) => {
      imageMap[entry.media.id] = base64Images[idx];
    });

    /**
     * Generates the SVG table header row.
     * @param {number} y - The y-coordinate for the header.
     * @returns {string} SVG markup for the table header.
     */
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

    /**
     * Renders a section of the SVG table for a given list category.
     * @param {string} title - The section title.
     * @param {Array<object>} entries - The anime entries for the section.
     * @param {number} yStart - The starting y-coordinate for the section.
     * @returns {{section: string, height: number}} SVG markup and height for the section.
     */
    const renderSection = (title, entries, yStart) => {
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

    // Render each section
    let y = titleMargin + titleFontSize + 12;
    let svgSections = "";
    // Watching
    const watchingResult = renderSection("Watching", watchingList, y);
    svgSections += watchingResult.section;
    y += watchingResult.height + sectionGap;

    // Completed
    const completedResult = renderSection("Completed", completedList, y);
    svgSections += completedResult.section;
    y += completedResult.height + sectionGap;

    // Planning
    const planningResult = renderSection("Planning", planningList, y);
    svgSections += planningResult.section;
    y += planningResult.height;

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

    // Return Response object for successfully generated SVG
    return {
      statusCode: 200,
      headers,
      body: svg,
    };
  } catch (error) {
    console.error(error);
    // Return Response object for unexpected errors
    const errorBody = createErrorCard(
      "Could not fetch data.",
      "#23272e",
      "#e06c75"
    );
    return {
      statusCode: 500,
      headers,
      body: errorBody,
    };
  }
};
