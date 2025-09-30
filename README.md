

# 🎨 AniList SVG Stats Card

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/Platform-Netlify-00C7B7?logo=netlify)](https://www.netlify.com)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen)](https://github.com/KennDeClouv/AniList-SVG-Table)

Generate a dynamic, themeable, and self-contained SVG card of your AniList stats, perfect for your GitHub profile README!

<br>

<img src="https://kennanimelist.netlify.app/api?username=kenndeclouv&maxRows=3&bgColor=%23282c34&primaryColor=%2361afef&accentColor=%23c678dd&textColor=%23abb2bf" />

---

## ✨ Main Features

- **🎨 Highly Customizable:** Change colors, size, title, and row count directly via the URL.
- **🖼️ Poster Images Inlined:** All poster images are embedded as Base64, making the SVG _self-contained_. No more proxy blocking (e.g., GitHub Camo).
- **🚀 Fast & Efficient:** Runs on Netlify Edge Functions with smart caching for maximum performance.
- **📊 Informative Display:** Shows your **Watching**, **Completed**, and **Planning** lists in a clear, easy-to-read table format.
- **✨ Modern Design:** Clean and professional look, ready to enhance your profile.

---

## 🚀 Live Demo & Usage Example

Use the URL `https://kennanimelist.netlify.app/api` and add parameters as needed.

|                                                                                              Preview                                                                                               | Markdown Code to Use                                                                                                                                      |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                                       **Default Theme**<br><img src="https://kennanimelist.netlify.app/api?username=kenndeclouv&maxRows=2" width="450px" />                                        | `![AniList](https://kennanimelist.netlify.app/api?username=kenndeclouv&maxRows=2)`                                                                        |
|    **Dracula Theme**<br><img src="https://kennanimelist.netlify.app/api?username=kenndeclouv&maxRows=2&bgColor=282a36&primaryColor=ff79c6&accentColor=bd93f9&textColor=f8f8f2" width="450px" />    | `![AniList](https://kennanimelist.netlify.app/api?username=kenndeclouv&maxRows=2&bgColor=282a36&primaryColor=ff79c6&accentColor=bd93f9&textColor=f8f8f2)` |
| **Compact Light Theme**<br><img src="https://kennanimelist.netlify.app/api?username=kenndeclouv&maxRows=1&bgColor=f4f4f4&primaryColor=2e4058&accentColor=49ACD2&textColor=333333" width="450px" /> | `![AniList](https://kennanimelist.netlify.app/api?username=kenndeclouv&maxRows=1&bgColor=f4f4f4&primaryColor=2e4058&accentColor=49ACD2&textColor=333333)` |

---

## ⚙️ Customization Parameters

All customization is done via _query parameters_. Colors use hex values (without `#`).

| Parameter        | Description                        | Default                |
| :--------------- | :--------------------------------- | :--------------------- |
| `username`       | AniList username.                  | `kenndeclouv`          |
| `title`          | Custom card title.                 | `<username>'s AniList` |
| `maxRows`        | Max anime per category.            | `5`                    |
| `width`          | Total SVG card width (in px).      | `560`                  |
| `bgColor`        | Main background color.             | `23272e`               |
| `primaryColor`   | Primary accent color (title, etc). | `49ACD2`               |
| `accentColor`    | Left bar accent color.             | `49ACD2`               |
| `textColor`      | Secondary text color.              | `abb2bf`               |
| `sectionBg`      | Category header background.        | `23272e`               |
| `posterBg`       | Row background accent color.       | `49ACD2`               |
| `rowHeight`      | Anime row height (in px).          | `56`                   |
| `headerHeight`   | Category header height (in px).    | `38`                   |
| `headerFontSize` | Category header font size.         | `18`                   |
| `titleFontSize`  | Main title font size.              | `28`                   |
| `titleMargin`    | Top margin for main title.         | `32`                   |
| `sectionGap`     | Gap between categories (in px).    | `18`                   |

---

## 🛠️ Local Development

**Requirements:**

- Node.js v18+
- Netlify CLI

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Run local server:**
    ```bash
    netlify dev
    ```
    The server will run at `http://localhost:8888`. You can access the endpoint at `http://localhost:8888/api?username=...`

---

## 🚀 Deploy

This project is configured for automatic deployment on Netlify. Just push to the `main` branch of your GitHub repo. Make sure your `netlify.toml` is correct.
