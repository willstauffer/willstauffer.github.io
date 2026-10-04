# Will Stauffer's website

Environmental data science and AI portfolio, with an interactive project globe, figures, reports, and fieldwork.

## Edit and build

Source lives in `portfolio/`. Edit project content in `portfolio/projects.json`, layout and biography in `portfolio/project-globe.fragment.html`, styles in `portfolio/atlas.css`, and interactions in `portfolio/globe-app.js`.

Build with Python 3, without installing dependencies:

```sh
python3 build_site.py
python3 -m http.server 8864 --bind 127.0.0.1
```

Open http://127.0.0.1:8864. Commit generated `index.html` and `assets/` together with source changes.

## Hosting

GitHub Pages serves the root of `master`. Pushing to that branch publishes the update. `CNAME` retains www.willstauffer.com. `.nojekyll` serves the static build directly.

All five figures displayed on the previous site are retained at full resolution and appear in the Selected figures gallery. Existing `assets/img/` paths are preserved. Project source credits and the original figure audit are documented in `portfolio/README.md`.

The previous site remains in Git history at `20b6a46`.
