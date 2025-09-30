
<div align="center">

# 🎨 AniList SVG Stats Card

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/Platform-Netlify-00C7B7?logo=netlify)](https://www.netlify.com)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen)](https://github.com/kenndeclouv/animelist)

Generate a dynamic, themeable, and self-contained SVG card of your AniList stats, perfect for your GitHub profile README!

<img src="https://kenndeclouv.netlify.app/animelist?username=kenndeclouv&maxRows=3" />

</div>

---

## ✨ Main Features

- **🎨 Highly Customizable:** Change colors, size, title, and row count directly via the URL.
- **🖼️ Poster Images Inlined:** All poster images are embedded as Base64, making the SVG _self-contained_. No more proxy blocking (e.g., GitHub Camo).
- **🚀 Fast & Efficient:** Runs on Netlify Edge Functions with smart caching for maximum performance.
- **📊 Informative Display:** Shows your **Watching**, **Completed**, and **Planning** lists in a clear, easy-to-read table format.
- **✨ Modern Design:** Clean and professional look, ready to enhance your profile.

---

## 🚀 Live Demo & Usage Example

Use the URL `https://kenndeclouv.netlify.app/animelist` and add parameters as needed.

|                                                                                              Preview                                                                                               | Markdown Code to Use                                                                                                                                      |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Default Theme**<br><img src="https://kenndeclouv.netlify.app/animelist?username=kenndeclouv&maxRows=2" width="450px" /> | `![AniList](https://kenndeclouv.netlify.app/animelist?username=kenndeclouv&maxRows=2)` |
| **Dracula**<br><img src="https://kenndeclouv.netlify.app/animelist?username=kenndeclouv&maxRows=2&bgColor=282a36&primaryColor=ff79c6&accentColor=bd93f9&textColor=f8f8f2" width="450px" /> | `![AniList](https://kenndeclouv.netlify.app/animelist?username=kenndeclouv&maxRows=2&bgColor=282a36&primaryColor=ff79c6&accentColor=bd93f9&textColor=f8f8f2)` |
| **Tokyo Night**<br><img src="https://kenndeclouv.netlify.app/animelist?username=kenndeclouv&maxRows=2&bgColor=1a1b26&primaryColor=7aa2f7&accentColor=bb9af7&textColor=c0caf5" width="450px" /> | `![AniList](https://kenndeclouv.netlify.app/animelist?username=kenndeclouv&maxRows=2&bgColor=1a1b26&primaryColor=7aa2f7&accentColor=bb9af7&textColor=c0caf5)` |
| **Nord**<br><img src="https://kenndeclouv.netlify.app/animelist?username=kenndeclouv&maxRows=2&bgColor=2e3440&primaryColor=88c0d0&accentColor=5e81ac&textColor=d8dee9" width="450px" /> | `![AniList](https://kenndeclouv.netlify.app/animelist?username=kenndeclouv&maxRows=2&bgColor=2e3440&primaryColor=88c0d0&accentColor=5e81ac&textColor=d8dee9)` |
| **Gruvbox Dark**<br><img src="https://kenndeclouv.netlify.app/animelist?username=kenndeclouv&maxRows=2&bgColor=282828&primaryColor=fe8019&accentColor=b8bb26&textColor=ebdbb2" width="450px" /> | `![AniList](https://kenndeclouv.netlify.app/animelist?username=kenndeclouv&maxRows=2&bgColor=282828&primaryColor=fe8019&accentColor=b8bb26&textColor=ebdbb2)` |
| **Solarized Light**<br><img src="https://kenndeclouv.netlify.app/animelist?username=kenndeclouv&maxRows=2&bgColor=fdf6e3&primaryColor=268bd2&accentColor=2aa198&textColor=657b83" width="450px" /> | `![AniList](https://kenndeclouv.netlify.app/animelist?username=kenndeclouv&maxRows=2&bgColor=fdf6e3&primaryColor=268bd2&accentColor=2aa198&textColor=657b83)` |
| **Monokai**<br><img src="https://kenndeclouv.netlify.app/animelist?username=kenndeclouv&maxRows=2&bgColor=272822&primaryColor=f92672&accentColor=a6e22e&textColor=f8f8f2" width="450px" /> | `![AniList](https://kenndeclouv.netlify.app/animelist?username=kenndeclouv&maxRows=2&bgColor=272822&primaryColor=f92672&accentColor=a6e22e&textColor=f8f8f2)` |
| **One Dark**<br><img src="https://kenndeclouv.netlify.app/animelist?username=kenndeclouv&maxRows=2&bgColor=282c34&primaryColor=61afef&accentColor=c678dd&textColor=abb2bf" width="450px" /> | `![AniList](https://kenndeclouv.netlify.app/animelist?username=kenndeclouv&maxRows=2&bgColor=282c34&primaryColor=61afef&accentColor=c678dd&textColor=abb2bf)` |
| **Material Oceanic**<br><img src="https://kenndeclouv.netlify.app/animelist?username=kenndeclouv&maxRows=2&bgColor=263238&primaryColor=82aaff&accentColor=21c7a8&textColor=eeffff" width="450px" /> | `![AniList](https://kenndeclouv.netlify.app/animelist?username=kenndeclouv&maxRows=2&bgColor=263238&primaryColor=82aaff&accentColor=21c7a8&textColor=eeffff)` |
| **Compact Light**<br><img src="https://kenndeclouv.netlify.app/animelist?username=kenndeclouv&maxRows=1&bgColor=f4f4f4&primaryColor=2e4058&accentColor=49ACD2&textColor=333333" width="450px" /> | `![AniList](https://kenndeclouv.netlify.app/animelist?username=kenndeclouv&maxRows=1&bgColor=f4f4f4&primaryColor=2e4058&accentColor=49ACD2&textColor=333333)` |

---

## ⚙️ Customization Parameters

All customization is done via _query parameters_. Colors use hex values (without `#`).

| Parameter        | Description                        | Default                |
| :--------------- | :--------------------------------- | :--------------------- |
| `username`       | AniList username.                  | `kenndeclouv`          |
| `layout`         | layout type (list/grid)            | `list`                 |
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
    The server will run at `http://localhost:8888`. You can access the endpoint at `http://localhost:8888/animelist?username=...`

---

## 🚀 Deploy

This project is configured for automatic deployment on Netlify. Just push to the `main` branch of your GitHub repo. Make sure your `netlify.toml` is correct.
