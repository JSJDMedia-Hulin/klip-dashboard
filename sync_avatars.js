// Renders the published Klipfolio dashboard headlessly and prints the rep name -> image URL
// pairs it shows (rendered rows + the klip schema's Image/Name columns) as JSON on stdout.
// Used by sync_avatars.sh. Needs puppeteer-core (from /workspace/klip/sa_test) and Chrome.
const puppeteer = require(process.env.PUPPETEER_PATH || '/workspace/klip/sa_test/node_modules/puppeteer-core');
const URL = 'https://app.klipfolio.com/published/311988880009a924acc50ae82ccca501/new-display-dashboard';
const isImg = (u) => typeof u === 'string' && /^https?:\/\//.test(u) && /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(u) && !/klipfolio\.com\//.test(u.replace(/\/images\/klipfolio\//, '/x/'));
const isName = (s) => typeof s === 'string' && /[A-Za-z]/.test(s) && !/^https?:/.test(s) && s.trim().length > 1 && s.trim().length < 60;
(async () => {
  const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
  try {
    const p = await b.newPage();
    await p.setViewport({ width: 1920, height: 1080 });
    await p.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 });
    await new Promise((r) => setTimeout(r, 15000));
    const dom = await p.evaluate(() => {
      const out = [];
      document.querySelectorAll('img').forEach((i) => {
        const src = i.currentSrc || i.src;
        const tr = i.closest('tr');
        if (!tr) return;
        const txt = (tr.innerText || '').split(/\n|\t/).map((s) => s.trim()).filter((s) => s && !/^[$\d.,%()-]+$/.test(s));
        if (txt.length === 1) out.push([txt[0], src]);
      });
      return out;
    });
    const html = await p.content();
    const pairs = {};
    for (const [n, u] of dom) if (isImg(u)) pairs[n] = u;
    // Schema: in each klip, an "Image" column next to a name column with the same row count.
    const m = /var dashboardSchemaString = "(.*?)";\s*\n/.exec(html);
    if (m) {
      const schema = JSON.parse(JSON.parse('"' + m[1] + '"'));
      const walk = (node) => {
        if (Array.isArray(node)) return node.forEach(walk);
        if (!node || typeof node !== 'object') return;
        const comps = Array.isArray(node.components) ? node.components : [];
        const cols = comps.filter((c) => c && Array.isArray(c.data) && Array.isArray(c.data[0])).map((c) => c.data[0]);
        const imgCols = cols.filter((d) => d.length && d.some(isImg));
        for (const ic of imgCols) {
          const nc = cols.find((d) => d !== ic && d.length === ic.length && d.every((x) => x === '' || isName(x)) && d.some(isName));
          if (nc) ic.forEach((u, i) => { if (isImg(u) && isName(nc[i]) && !(nc[i] in pairs)) pairs[nc[i].trim()] = u; });
        }
        Object.values(node).forEach(walk);
      };
      walk(schema);
    }
    process.stdout.write(JSON.stringify(pairs, null, 1) + '\n');
  } finally {
    await b.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
