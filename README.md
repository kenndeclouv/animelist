## AniList SVG Table API — `netlify/functions/api.js`

Generate a customizable SVG table for an AniList user, showing Watching, Completed, and Planning lists with inlined poster images. The output is a cached SVG ideal for GitHub READMEs and personal sites.

### Live Endpoint

- Base path (via Netlify redirects in `netlify.toml`): `/api`
- Example: `/api?username=kenndeclouv`
- The function also responds on `/api/index.js` due to the redirect rule.

### What it renders

- Sections: Watching, Completed, Planning
- Each row: Poster, Title, Format, Score, Progress, Status
- Posters from AniList CDN are embedded as base64 in the SVG

---

## Requirements

- Node.js 18+ (native `fetch`)
- Netlify account and Netlify CLI (for local dev and deploy)

Install dependencies:

```bash
npm install
```

---

## Local Development

Run with Netlify Dev:

```bash
npx netlify-cli dev
```

Open in your browser:

```
http://localhost:8888/api?username=kenndeclouv
```

Notes:

- Redirects in `netlify.toml` map `/api/*` to `/.netlify/functions/api/:splat`.
- You can also call: `http://localhost:8888/.netlify/functions/api?username=...`.

---

## Deploy

Deploy to Netlify from the repo root:

```bash
npx netlify-cli deploy --prod
```

Ensure `netlify.toml` contains:

```toml
[build]
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
```

---

## Usage and Query Parameters

Send a GET request to `/api` with any of the parameters below. Colors accept hex values (URL-encode `#` as `%23`). Numeric values are pixels.

- `username` (string): AniList username. Default: `kenndeclouv`
- `title` (string): Custom title. Default: `<username>'s AniList`
- `bgColor` (string): Background color. Default: `#23272e`
- `primaryColor` (string): Main accent color. Default: `#49ACD2`
- `accentColor` (string): Section accent bar color. Default: `#49ACD2`
- `sectionBg` (string): Section header background. Default: `#23272e`
- `posterBg` (string): Row accent background. Default: `#49ACD2`
- `textColor` (string): Text color. Default: `#abb2bf`
- `width` (number): SVG width. Default: `560`
- `rowHeight` (number): Row height. Default: `56`
- `headerHeight` (number): Section header height. Default: `38`
- `headerFontSize` (number): Section header font size. Default: `18`
- `titleFontSize` (number): Main title font size. Default: `28`
- `titleMargin` (number): Top margin for title. Default: `32`
- `sectionGap` (number): Gap between sections. Default: `18`
- `maxRows` (number): Max rows per section. Default: `5`

### Examples

Basic:

```
/api?username=kenndeclouv
```

Limit rows and customize colors:

```
/api?username=kenndeclouv&maxRows=3&primaryColor=%2349ACD2&bgColor=%2323272e
```

Change sizes:

```
/api?username=kenndeclouv&titleFontSize=30&headerFontSize=16&rowHeight=60&width=640
```

---

## Embedding in GitHub README

Use a Markdown image linking to your deployed URL:

```markdown
![AniList](https://<your-site>.netlify.app/api?username=kenndeclouv&maxRows=5)
```

Tip:

- Caching is enabled for 2 hours. If updates are delayed, add a cache buster like `&t=1699999999`.

---

## Responses

- `200 OK` with `Content-Type: image/svg+xml`: SVG table rendered successfully
- `404 Not Found`: Username not found (styled SVG error card)
- `500 Internal Server Error`: Unexpected error (styled SVG error card)

Headers:

- `Cache-Control: public, max-age=7200, must-revalidate`

---

## Implementation Notes

- Source: `netlify/functions/api.js`
- Uses `anilist-node` to fetch user lists.
- Renders up to `maxRows` items for each of Watching, Completed, Planning.
- Posters are fetched from `https://img.anili.st/media/<mediaId>` and inlined as base64.
- If a poster fails to load, the row still renders without it.

---

## Troubleshooting

- Blank image in README

  - Verify the endpoint URL loads directly in a browser
  - Ensure the function is deployed and publicly accessible
  - Add `&t=<timestamp>` to bypass caches

- User not found

  - Confirm the `username` exists on AniList

- Missing posters

  - Some titles may lack accessible CDN images; rows still render without posters

- Local dev routing
  - If `/api` does not route, use `/.netlify/functions/api` directly

---

## License

MIT
