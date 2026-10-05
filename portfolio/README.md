# Will Stauffer / Project atlas

An environmental data science and AI portfolio with a rotatable globe, synchronized project index, and original figures. Earlier fieldwork and films remain available through their project cards. The opening project is current AI-assisted climate modeling at Entelligent.

## Edit

- `projects.json`: project text, dates, locations, coordinates, links, films, and media references. Longitude comes before latitude. Use `null` coordinates when a location is not established.
- `project-globe.fragment.html`: page structure and biography.
- `atlas.css`: appearance and responsive layouts.
- `globe-app.js`: map projection, gestures, camera transitions, project selection, figures, videos, and the AI workflow/result tabs.
- `build_globe.py`: combines local dependencies, geography, project data, and thumbnails into the final page. Copies original figures into `assets/`.

## Build and preview

Requires Python 3. No package installation or build-time network access is needed.

```sh
python3 build_globe.py
python3 -m http.server 8863 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:8863/project-globe.html`. Keep `dist/assets` beside the page: it contains the scripts, image previews, and full-size figures. Film playback uses YouTube and Vimeo and requires an internet connection.

To choose another destination:

```sh
python3 build_globe.py --output-dir /path/to/output
```

## Content provenance

Project descriptions draw on Will's October 2026 base resume, existing personal website, and descriptions given in this conversation. The AI workflow is Will's own account of directing parallel agents, checking tradeoffs, running tests, and comparing outputs visually.

The financial projection benchmark is 14.6 seconds before and 2.2 seconds after, on the same workload. It is a function-level benchmark from July 16, 2026 (commit e146de09a), recorded in the prior resume codebase evidence audit. Output parity was tested against the original. This does not represent a whole-pipeline speedup or a measurement of AI productivity.

The climate backtest is earlier work covering 2017–2022. UN figures come from the original website and the UNJSPF 2021 TCFD reporting work. Other visuals include Climate Interactive / MIT Sloan's EnROADS interface and the rivers.fyi forecast interface. Original images and compressed thumbnails are included.

Company/client headquarters are labeled as such. Unlocated projects remain accessible in the index without inventing a map pin. The globe uses actual Natural Earth land geometry and US state geometry with D3 7.9.0 and TopoJSON 3.1.0.

## Status

This source package contains no hosting credentials. Building creates local files. Publishing is a separate Git push to the existing website repository.

## October 3 web research additions

- The Laos project is now **Lines on a map**, with publication links and two photographs credited to Will Stauffer-Norris. National Geographic's [first article](https://www.nationalgeographic.com/adventure/article/from-china-to-laos-by-bike-exploring-the-course-of-southeast-asias-future-high-speed-rail-15) dates the six-week expedition to spring 2015. The [Nam Ou article](https://www.nationalgeographic.com/adventure/article/biking-along-a-soon-to-be-dammed-river-in-laos), published June 9, 2016, credits Will's photographs and additional writing. The downloaded photographs are included as JPG originals and WebP previews.
- **Dulong River expedition**: [GoKunming's interview with Will](https://www.gokunming.com/en/blog/item/4017/video-and-interview-first-descent-of-chinas-remote-dulong-river), published October 16, 2017, describes his participation in the 2015 expedition and the film he made. It links to a Tencent player; the portfolio currently links to the film/interview page. No claim about a first descent or first release date is added. The regional pin uses the [Dulong River geographic listing](https://elevation.maplogs.com/poi/dulong_river_gongshan_derung_and_nu_autonomous_county_nujiang_lisu_autonomous_prefecture_china.482190.html), rounded to four decimals.
- **Fire, wood, and a wilderness river**: the University of Idaho's [2010 station annual report](https://objects.lib.uidaho.edu/taylorarchive/b3-TWRS_PositionReports-076.pdf) names Will and his research on fire intensity and large woody debris distribution in the Big Creek watershed (PDF pages 6 and 10). The pin is the research station, using [University of Idaho Library coordinates](https://harvester.lib.uidaho.edu/collection/items/lumber2524.html). No research findings or funding attribution are inferred.
- The Colorado expedition description now identifies its State of the Rockies connection, documented in [Zak Podmore's NRS story](https://community.nrs.com/duct-tape/2012/10/01/the-end-of-a-river-a-source-to-sea-journey-down-the-colorado-river/).

The current AI project remains the opening selection. There are 19 projects in the index.

## October 4 positioning

Data science and AI lead the header, introduction, biography, and search description. Scientific projects come before the earlier fieldwork and films in the index. All film links, players, credits, and map pins are retained. The career invitation specifically covers data science and AI consulting or a full-time role.

## October 4 Entelligent publications

- Current AI work includes an interactive chart from Entelligent's [European Industrial Company Transition Disclosure Report](https://www.entelligent.com/wp-content/uploads/2025/06/Entelligent-Case-Study-European-Industrial-Co-Transition-Disclosure-Report-20250617-1.pdf), published June 17, 2025. Figure 10 on PDF page 14 supplies net income adjustments (USD millions): NDC = 15, 129, 343; Net Zero 2050 = 36, 290, 542, for 2025, 2030, 2045 respectively. The chart uses the table column years, even though the prose below the source table refers to 2035. The source report models Scope 1 and 2 carbon costs; its Scope 3 figures are reference data. Values are scenario projections, not realized earnings. This publication predates Will's October 2025 return to Entelligent and is credited as company context, with no personal authorship claim.
- The Paris project includes Figure 6, cropped with its source credit retained, from [Energy-Climate Transition Risk for Equities](https://www.entelligent.com/wp-content/uploads/2021/04/Energy-Climate-Transition-Risk-for-Equities.pdf), March 15, 2021, by Elliot Cohen. It compares energy prices and company returns and is credited to Entelligent's Data Science Team. The original report is linked from the Paris and backtesting cards. No individual authorship is inferred for Will.
- The backtesting card also links to Entelligent's [January 2023 FactSet launch announcement](https://www.entelligent.com/news-and-perspective/entelligents-t-risk-goes-live-on-factset-to-support-institutional-investors-worldwide/).

Published company figures are labeled on the visible card and in the enlargement caption. The build size guard now permits up to 2 MB to accommodate the added graph; the current page remains approximately 1 MB.

## Original website figure audit

All five figures displayed on the previous website are included both in their project cards and in the Selected figures gallery: divestment, scenarios, enroads, backtest, and rivers_fyi. Each original PNG is byte-identical to the website repository version. The release also preserves all previous assets/img URLs, including the portrait, favicon, and two unused legacy graphics.

## Publication security

The standalone page uses a Content Security Policy with hashes for its three bundled scripts, local/data images, and only YouTube and Vimeo frames. Browser data requests, plugins, forms, and base URL overrides are blocked. Inline styles remain allowed for D3 layout. The build escapes JSON for HTML script embedding and validates HTTPS project links and video IDs. External links use noopener/noreferrer. No credentials or analytics are included.

## Loading and interaction performance

The website loads three deferred scripts with content-hashed filenames and integrity checks. Image previews load lazily from separate WebP files; original figures remain unchanged. The optional inline artifact remains self-contained. Keep previously deployed hashed assets available so cached HTML continues to work. Drag and pinch rendering is coalesced to animation frames, marker movement uses transforms, and unchanged map labels and resize notifications skip unnecessary work. SVG paths use one decimal place, within 0.05 CSS pixels per coordinate.

## Bay Area work

Plenty and Oru Kayak were added at Will’s request. Both use a shared San Francisco regional anchor for Bay Area work, not an office or filming address. Plenty’s agtech storytelling role was already established in the portfolio biography. Will confirmed that Oru Kayak was the $1M+ Kickstarter campaign on his résumé: he created the film and helped with marketing. Exact project dates remain unspecified. Company links provide background; they do not establish personal authorship of every company output.
