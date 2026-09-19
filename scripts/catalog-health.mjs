import fs from "node:fs/promises";

const database = await fs.readFile("database.js", "utf8");

/*
  Parse only top-level software objects.
  database.js contains nested needs/integrations objects, so a simple
  id -> pricingUrl regex can accidentally stop at nested braces.
*/
const lines = database.split(/\r?\n/);
const items = [];
let block = null;

for (const line of lines) {
  if (/^\s{4}\{\s*$/.test(line)) {
    block = [];
    continue;
  }

  if (block) {
    block.push(line);

    if (/^\s{4}\},?\s*$/.test(line)) {
      const text = block.join("\n");
      const id = text.match(/\bid:\s*"([^"]+)"/)?.[1];
      const name = text.match(/\bname:\s*"([^"]+)"/)?.[1];
      const pricingUrl = text.match(/\bpricingUrl:\s*"([^"]+)"/)?.[1];

      if (id && name && pricingUrl) {
        items.push({ id, name, url: pricingUrl });
      }

      block = null;
    }
  }
}

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
