#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

function requirePlaywright(root) {
  const localModule = path.join(root, "playwright", "node_modules", "@playwright", "test");
  try {
    return require(localModule);
  } catch (_) {
    return require("@playwright/test");
  }
}

function parseArgs(argv) {
  const args = { root: process.cwd(), years: "2023,2024,2025,2026" };
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    if (key === "--root") args.root = argv[++i];
    else if (key === "--years") args.years = argv[++i];
  }
  return args;
}

function pageUrl(year) {
  const base = "https://www.topuniversities.com/university-subject-rankings/engineering-technology";
  return Number(year) === 2026 ? base : `${base}/${year}`;
}

function stampNow() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

async function pageFetchJson(page, endpoint) {
  return await page.evaluate(async (url) => {
    const response = await fetch(url, {
      credentials: "include",
      headers: {
        "accept": "application/json, text/plain, */*",
        "x-requested-with": "XMLHttpRequest",
      },
    });
    const text = await response.text();
    return {
      status: response.status,
      contentType: response.headers.get("content-type") || "",
      text,
    };
  }, endpoint);
}

async function fetchYear(page, root, year, retrievedAt) {
  const url = pageUrl(year);
  await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
  const html = await page.content();
  const match = html.match(/"qs_rankings_rest_api"\s*:\s*\{\s*"nid"\s*:\s*"(\d+)"/);
  if (!match) {
    throw new Error(`Could not find QS rankings nid for ${year}`);
  }
  const nid = match[1];
  const baseEndpoint = `/rankings/endpoint?nid=${nid}&items_per_page=30&tab=indicators&region=&countries=&cities=&search=&star=&sort_by=&order_by=&program_type=&scholarship=&fee=&english_score=&academic_score=&mix_student=&loggedincache=&study_level=&subjects=`;
  const first = await pageFetchJson(page, `${baseEndpoint}&page=0`);
  if (first.status !== 200) {
    throw new Error(`QS endpoint returned ${first.status} for ${year} page 0`);
  }
  const firstJson = JSON.parse(first.text);
  const totalPages = Number(firstJson.total_pages || 1);
  const targetDir = path.join(root, "data", "raw", "QS_ET", String(year), stampNow());
  fs.mkdirSync(targetDir, { recursive: true });

  const pageFiles = [];
  for (let pageNo = 0; pageNo < totalPages; pageNo += 1) {
    const payload = pageNo === 0 ? first : await pageFetchJson(page, `${baseEndpoint}&page=${pageNo}`);
    if (payload.status !== 200) {
      throw new Error(`QS endpoint returned ${payload.status} for ${year} page ${pageNo}`);
    }
    JSON.parse(payload.text);
    const fileName = `page_${String(pageNo).padStart(3, "0")}.json`;
    fs.writeFileSync(path.join(targetDir, fileName), payload.text, "utf8");
    pageFiles.push(fileName);
  }

  const manifest = {
    source_id: "QS_ET",
    year: Number(year),
    retrieved_at: retrievedAt,
    page_url: url,
    endpoint_base: `https://www.topuniversities.com${baseEndpoint}`,
    nid,
    total_record: Number(firstJson.total_record || 0),
    total_pages: totalPages,
    items_per_page: Number(firstJson.items_per_page || 30),
    page_files: pageFiles,
  };
  const manifestName = `qs_engineering_technology_${year}.manifest.json`;
  fs.writeFileSync(path.join(targetDir, manifestName), JSON.stringify(manifest, null, 2), "utf8");
  return { year: Number(year), manifest: path.join(targetDir, manifestName), total_record: manifest.total_record };
}

(async () => {
  const args = parseArgs(process.argv);
  const root = path.resolve(args.root);
  const { chromium } = requirePlaywright(root);
  const years = args.years.split(",").map((item) => Number(item.trim())).filter(Boolean);
  const retrievedAt = new Date().toISOString().replace(/\.\d{3}Z$/, "+00:00");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
    locale: "en-US",
  });
  const results = [];
  try {
    for (const year of years) {
      results.push(await fetchYear(page, root, year, retrievedAt));
    }
  } finally {
    await browser.close();
  }
  console.log(JSON.stringify({ status: "ok", results }, null, 2));
})().catch((error) => {
  console.error(error.stack || String(error));
  process.exit(1);
});
