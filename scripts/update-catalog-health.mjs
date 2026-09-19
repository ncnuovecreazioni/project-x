import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const DATABASE_FILE = path.join(ROOT, "database.js");
const OUTPUT_FILE = path.join(ROOT, "catalog-health.json");

function parseDatabase(source) {
  const start = source.indexOf("const SOFTWARE_DATABASE = [");
  if (start < 0) throw new Error("SOFTWARE_DATABASE non trovato");

  const open = source.indexOf("[", start);
  let depth = 0;
  let inString = false;
  let quote = "";
  let escaped = false;
  let objectStart = -1;
  const objects = [];

  for (let i = open; i < source.length; i++) {
    const ch = source[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === quote) {
        inString = false;
        quote = "";
      }
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
      inString = true;
      quote = ch;
      continue;
    }

    if (ch === "[") {
      depth++;
      continue;
    }

    if (ch === "]") {
      depth--;
      if (depth === 0) break;
      continue;
    }

    if (ch === "{") {
      if (depth === 1) objectStart = i;
      depth++;
      continue;
    }

    if (ch === "}") {
      depth--;
      if (depth === 1 && objectStart >= 0) {
        objects.push(source.slice(objectStart, i + 1));
        objectStart = -1;
      }
    }
  }

  return objects.map((block) => {
    const id = block.match(/(?:^|\n)\s*id:\s*["']([^"']+)["']/)?.[1] || "";
    const name = block.match(/(?:^|\n)\s*name:\s*["']([^"']+)["']/)?.[1] || id;
    const pricingUrl = block.match(/(?:^|\n)\s*pricingUrl:\s*["']([^"']+)["']/)?.[1] || "";
    const description = block.match(/(?:^|\n)\s*description:\s*["']([^"']+)["']/)?.[1] || "";
    return { id, name, pricingUrl, description };
  }).filter((item) => item.id && /^https:\/\//i.test(item.pricingUrl));
}

async function fetchOne(item) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(item.pricingUrl, {
      redirect: "follow",
      headers: {
        "User-Agent": "PROJECT-X-Catalog-Monitor/1.0",
        "Accept": "text/html,application/xhtml+xml"
      },
      signal: controller.signal
    });

    const body = await response.text();
    const normalized = body
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 500000);

    return {
      id: item.id,
      name: item.name,
      pricingUrl: item.pricingUrl,
      status: response.status,
      ok: response.ok,
      finalUrl: response.url,
      contentHash: crypto.createHash("sha256").update(normalized).digest("hex"),
      contentLength: normalized.length,
      etag: response.headers.get("etag") || "",
      lastModified: response.headers.get("last-modified") || ""
    };
  } catch (error) {
    return {
      id: item.id,
      name: item.name,
      pricingUrl: item.pricingUrl,
      status: 0,
      ok: false,
      finalUrl: "",
      contentHash: "",
      contentLength: 0,
      etag: "",
      lastModified: "",
      error: error?.name === "AbortError" ? "timeout" : "fetch_failed"
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function mapLimit(items, limit) {
  const results = new Array(items.length);
  let next = 0;

  async function worker() {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      results[index] = await fetchOne(items[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

const database = fs.readFileSync(DATABASE_FILE, "utf8");
const tools = parseDatabase(database);
const checks = await mapLimit(tools, 5);

const previous = fs.existsSync(OUTPUT_FILE)
  ? JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf8"))
  : null;

const previousMap = new Map((previous?.items || []).map((item) => [item.id, item]));
const items = checks.map((item) => {
  const old = previousMap.get(item.id);
  const changed =
    !!old &&
    (old.contentHash !== item.contentHash ||
      old.status !== item.status ||
      old.finalUrl !== item.finalUrl);

  return {
    ...item,
    changedSincePreviousCheck: changed,
    lastDetectedChange: changed ? new Date().toISOString() : (old?.lastDetectedChange || "")
  };
});

const comparable = JSON.stringify(items.map(({ id, name, pricingUrl, status, ok, finalUrl, contentHash, contentLength, etag, lastModified, changedSincePreviousCheck, lastDetectedChange }) =>
  ({ id, name, pricingUrl, status, ok, finalUrl, contentHash, contentLength, etag, lastModified, changedSincePreviousCheck, lastDetectedChange })
));

const previousComparable = JSON.stringify((previous?.items || []).map(({ id, name, pricingUrl, status, ok, finalUrl, contentHash, contentLength, etag, lastModified, changedSincePreviousCheck, lastDetectedChange }) =>
  ({ id, name, pricingUrl, status, ok, finalUrl, contentHash, contentLength, etag, lastModified, changedSincePreviousCheck, lastDetectedChange })
));

if (previous && comparable === previousComparable) {
  console.log("PROJECT-X catalog: nessun cambiamento rilevato.");
  process.exit(0);
}

const payload = {
  version: 1,
  generatedAt: new Date().toISOString(),
  source: "database.js pricingUrl health monitor",
  note: "Controllo automatico dei link e delle variazioni dei contenuti; non modifica automaticamente ranking, prezzi o commissioni.",
  totals: {
    tools: items.length,
    healthy: items.filter((x) => x.ok).length,
    changed: items.filter((x) => x.changedSincePreviousCheck).length,
    failed: items.filter((x) => !x.ok).length
  },
  items
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(payload, null, 2) + "\n");
console.log(JSON.stringify(payload.totals));
