# Portfolio — Addepalli Bharat Sai

A hand-built, single-page portfolio. Static HTML, CSS and vanilla JavaScript — no framework, no
build step, no runtime dependencies. Everything (fonts, portrait, résumé) is self-hosted.

```
portfolio/
├── index.html
├── css/style.css
├── js/main.js
├── assets/
│   ├── favicon.svg
│   ├── resume.pdf          # generated from resume/resume.tex
│   ├── fonts/              # Fraunces, Inter Tight, JetBrains Mono (OFL)
│   └── img/portrait.jpg, og.png
├── resume/
│   ├── resume.tex          # the résumé — single source of truth
│   ├── latexmkrc           # pdflatex config, so CLI and VS Code builds match
│   └── resume.pdf          # build output (git-ignored)
├── .vscode/settings.json   # LaTeX Workshop recipes, build on save, in-tab viewer
└── .github/workflows/pages.yml
```

## Preview locally

```bash
cd portfolio
python3 -m http.server 4173
# open http://localhost:4173
```

A server is needed only so relative paths and fonts behave exactly as they do on Pages.

## Deploy to GitHub Pages

1. Create a public repo named `portfolio` under `abharatsai-dev` (or any name — paths are relative).
2. Push this folder to `main`.
3. Repository **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. The included workflow (`.github/workflows/pages.yml`) publishes the folder — without `.git` or
   build junk — on every push to `main`.

The site will live at `https://abharatsai-dev.github.io/portfolio/`.

### Root URL (optional)

To serve at `https://abharatsai-dev.github.io/`, name the repo `abharatsai-dev.github.io` instead. Then update
`og:url`, `og:image` and the JSON-LD `url` in `index.html` (currently
`https://abharatsai-dev.github.io/portfolio/`). A custom domain only needs a `CNAME` file plus DNS.

## Updating content

- All copy lives in `index.html`; colours, type and layout in `css/style.css`.
- The résumé PDF is built from `resume/resume.tex` — the only copy; there is no second repo.
  pdfLaTeX only (`\pdfgentounicode` is a pdfTeX primitive, XeLaTeX/LuaLaTeX fail):

```bash
cd resume
latexmk                 # reads latexmkrc: pdflatex -synctex=1 -interaction=nonstopmode
cp resume.pdf ../assets/resume.pdf
```

  In VS Code: `Ctrl+Alt+B` builds, `Ctrl+Alt+V` opens the PDF, saving rebuilds automatically.

- Social preview: `assets/img/og.png` (1200×630). Replace it if the headline or URL changes.
- Local time in the header/contact/footer is computed in IST by `js/main.js`; no API involved.

## Notes

- Accessible: skip link, landmark sections, keyboard-operable menu and case studies, focus styles,
  `prefers-reduced-motion` support, and a no-JS fallback (all content stays visible).
- No trackers, no cookies, no external requests. Fonts are licensed under the SIL Open Font License —
  see `assets/fonts/OFL-*.txt`.
- Older public projects remain on `github.com/ABharatSai`; the Archive section links there.
- Portrait: personal photo, not licensed for reuse.
