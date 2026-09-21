# Huynh Nhat Linh Portfolio

Static portfolio inspired by the Figma Community template "Portfolio - Tomasz Gajda".

## Open locally

You can open `index.html` directly in a browser.

If you prefer a local server:

```bash
python3 -m http.server 4174 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4174/`.

## Publish publicly

This portfolio is a static site, so the simplest production path is GitHub Pages.

### Recommended: GitHub Pages

1. Create a public GitHub repository.
   - Use `lamelihuynh.github.io` if you want the site at `https://lamelihuynh.github.io/`.
   - Use `portfolio-lamelihuynh` if you want the site at `https://lamelihuynh.github.io/portfolio-lamelihuynh/`.
2. Push this folder to that repository.
3. On GitHub, open the repository settings.
4. Go to `Pages`.
5. Under `Build and deployment`, choose `Deploy from a branch`.
6. Select branch `main` and folder `/ (root)`.
7. Save, then wait a few minutes for the public URL.

Example first push:

```bash
git init
git add .
git commit -m "Launch portfolio"
git branch -M main
git remote add origin https://github.com/lamelihuynh/portfolio-lamelihuynh.git
git push -u origin main
```

### Update after publishing

After changing content:

```bash
node build-daily-posts.mjs
git add .
git commit -m "Update portfolio content"
git push
```

GitHub Pages will redeploy after the push.

### Production checklist

- Replace `mailto:your.email@example.com` in `index.html`.
- Replace the disabled LinkedIn link with your real profile.
- Add demo, App Store, or video links when a project is public.
- Keep `.nojekyll` in the root so GitHub Pages serves static assets directly.

## Add a daily note

1. Create a Markdown file in `daily/`, for example `2026-06-29-swiftui-layout.md`.
2. Add frontmatter at the top:

```md
---
title: "What I learned about SwiftUI layout"
date: "2026-06-29"
summary: "A short summary shown on the portfolio page."
tags: ["SwiftUI", "iOS", "Learning"]
---

Write your note here.
```

3. Rebuild the data file:

```bash
node build-daily-posts.mjs
```

The site reads from `data/daily-posts.js` when opened directly and `data/daily-posts.json` as a fallback, so you do not need to edit `index.html` for each post.

## Update before sharing

- Replace `mailto:your.email@example.com` in `index.html` with your real email.
- Replace the disabled LinkedIn link with your profile URL.
- Add screenshots or App Store links when your mobile apps are published.
