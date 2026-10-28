# New Display Dashboard (standalone, full screen)

Static files only. No build is needed to run it.

- `index.html` is the page. It fills the browser window edge to edge at any size.
- `dash.js` holds the drawing code, bundled from `src/dash.ts` (`esbuild src/dash.ts --bundle --format=iife --outfile=dash.js`).
- `data.json` holds all the numbers. The page re-fetches it every 60 s with a cache-busting `?t=` and redraws when it changes.
  To update the dashboard, replace data.json and nothing else.
  Keys: GAUGE_TARGET, GAUGE_MAX, GAUGE_VALUE, COLLECTED, GOAL, DAILY [[name, amount]...], DAILY_TOTAL,
  KPIS [{title, value, accent?} x3], LAST5 [[name, amount]...], OPPS [name...], TOP [[name, amount]...].
- The live page loads its data from `https://raw.githubusercontent.com/JSJDMedia-Hulin/klip-dashboard/data/data.json` (branch `data`), set in `<meta name="dashboard-data">` in index.html. raw.githubusercontent caches about 5 minutes. Use push_data.sh to publish a new data.json.

Daily Sales shows every row. When the rows can't shrink any further, the whole dashboard scales down to keep them on screen.
The other lists show up to 5 rows, and Top 5 is ranked by amount.
The footer reads "Connected" while data.json loads, and turns amber ("Reconnecting…") if the last fetch failed. In that case the last good values stay on screen.
Windows narrower than 760 px get the stacked phone layout, which scrolls.
