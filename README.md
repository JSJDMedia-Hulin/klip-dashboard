# New Display Dashboard (standalone, full screen)

Static files only. No build is needed to run it.

- `index.html` is the page. It fills the browser window edge to edge at any size.
- `dash.js` holds the drawing code, bundled from `src/dash.ts` (`esbuild src/dash.ts --bundle --format=iife --target=es2015 --outfile=dash.js`).
- `data.json` holds all the numbers. The page re-fetches it every 60 s with a cache-busting `?t=` and redraws when it changes.
  To update the dashboard, replace data.json and nothing else.
  Keys: GAUGE_TARGET, GAUGE_MAX, GAUGE_VALUE, COLLECTED, GOAL, DAILY [[name, amount]...], DAILY_TOTAL,
  KPIS [{title, value, accent?} x3], LAST5 [[name, amount]...], OPPS [name...], TOP [[name, amount]...].
- The live page loads its data from `https://raw.githubusercontent.com/JSJDMedia-Hulin/klip-dashboard/data/data.json` (branch `data`), set in `<meta name="dashboard-data">` in index.html. raw.githubusercontent caches about 5 minutes. Use push_data.sh to publish a new data.json.

Daily Sales shows every row. When the rows can't shrink any further, the whole dashboard scales down to keep them on screen.
The other lists show up to 5 rows, and Top 5 is ranked by amount.
The footer reads "Connected" while data.json loads, and turns amber ("Reconnecting…") if the last fetch failed. In that case the last good values stay on screen.
Windows narrower than 760 px get the stacked phone layout, which scrolls.
Wide layout is used whenever width >= height (or width >= 760 px), so TV sticks that report 960x540 or 640x360 CSS px still get the dashboard layout.
Lite mode (signage sticks / low-power devices): device pixel ratio capped at 1, about 24 fps, no shadow glows, 12 background particles instead of 70.
It turns on automatically when the user agent contains Android/AFT/CrKey/TV, or hardwareConcurrency <= 4, or deviceMemory <= 2. `?lite=1` forces it on, `?lite=0` forces the full look.
If the browser has no 2D canvas, the page shows a plain text message instead of staying blank.
