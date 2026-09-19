import fs from "node:fs/promises";

const database = await fs.readFile("database.js", "utf8");
const items = [];
const re = /id:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"[\s\S]*?pricingUrl:\s*"([^"]+)"/g;
let m;
while ((m = re.exec(database))) items.push({ id: m[1], name: m[2], url: m[3] });

const checked = [];
for (const tool of items) {
  const started = Date.now();
  let status = 0;
  let finalUrl = tool.url;
  let ok = false;
  let error = "";
  try {
    let res = await fetch(tool.url, { method: "HEAD", redirect: "follow" });
    if (res.status === 405 || res.status === 403) {
      res = await fetch(tool.url, { method: "GET", redirect: "follow" });
    }
    status = res.status;
    finalUrl = res.url || tool.url;
    ok = res.ok;
  } catch (e) {
    error = String(e?.message || e);
  }
  checked.push({
    id: tool.id,
    name: tool.name,
    url: tool.url,
    finalUrl,
    status,
    healthy: ok,
    responseMs: Date.now() - started,
    error
  });
}

const healthy = checked.filter(x => x.healthy).length;
const failed = checked.length - healthy;
const output = {
  version: 2,
  generatedAt: new Date().toISOString(),
  source: "PROJECT-X automatic catalog health monitor",
  note: "Pricing/catalog links are checked automatically. A change is flagged for review; the engine ranking is never changed by this monitor.",
  totals: { tools: checked.length, healthy, changed: checked.filter(x => x.finalUrl !== x.url).length, failed },
  items: checked
};
await fs.writeFile("catalog-health.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output.totals));
