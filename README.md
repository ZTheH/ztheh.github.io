# Zakariyae Bouhout — Portfolio

Static portfolio built with [Astro](https://astro.build). Dark "network blueprint" design, no backend, no tracking, no database.

**Why Astro:** the content is informational, so a static site is fastest, cheapest and safest. Astro ships plain HTML with almost no JavaScript, gives real SEO, and keeps content in simple data files.

## Run locally

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # production build into dist/
npm run preview  # serve the production build
```

## Where to edit things

| What | File |
| --- | --- |
| Name, intro, email, GitHub/LinkedIn, contact text | `src/data/profile.ts` |
| Skill groups and levels | `src/data/skills.ts` |
| Projects (add one = add an object) | `src/data/projects.ts` |
| Education, certifications, experience | `src/data/experience.ts` |
| Lab write-ups | `src/content/labs/*.md` (copy `_template.md`) |
| Colours, fonts, spacing tokens | top of `src/styles/global.css` |
| CV (PDF + Word, ATS-friendly) | `src/data/cv.ts`, then `npm run cv` (also runs on `dev`/`build`). Outputs `public/Zakariyae_Bouhout_CV.pdf` and `.docx` and the "Download CV" buttons appear automatically |
| Social preview image | `npm run og` regenerates `public/og.png` |

Search the code for `TODO(confirm)` to find every detail that still needs your verification.

## Adding a lab write-up

1. Copy `src/content/labs/_template.md` to `src/content/labs/my-lab.md`.
2. Fill in the frontmatter, set `draft: false`, write the sections.
3. Rebuild. It appears in the Labs section and at `/labs/my-lab`.

Code blocks are syntax highlighted automatically. Only publish real lab work, on systems you own or are authorised to test.

## Deploy (GitHub Pages)

This repo is `ZTheH.github.io`, so it is served at `https://ztheh.github.io`. The workflow in `.github/workflows/deploy.yml` builds and deploys on every push to `main`.
Once: GitHub → repo **Settings → Pages → Source: GitHub Actions**.

### Custom domain later

1. Buy a domain, add it under **Settings → Pages → Custom domain**.
2. Add the DNS records GitHub lists (A records or a CNAME).
3. Change `site` in `astro.config.mjs` to your domain, and commit.
