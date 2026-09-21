import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const postsDir = path.join(rootDir, "daily");
const outputDir = path.join(rootDir, "data");
const outputFile = path.join(outputDir, "daily-posts.json");
const outputScriptFile = path.join(outputDir, "daily-posts.js");

function parseFrontmatter(source, fileName) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) {
    throw new Error(`${fileName} is missing YAML-style frontmatter.`);
  }

  const metadata = {};

  for (const line of match[1].split("\n")) {
    if (!line.trim()) {
      continue;
    }

    const separator = line.indexOf(":");
    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    metadata[key] = parseValue(rawValue);
  }

  return { body: match[2].trim(), metadata };
}

function parseValue(value) {
  if (value.startsWith("[") && value.endsWith("]")) {
    return value
      .slice(1, -1)
      .split(",")
      .map((item) => cleanValue(item))
      .filter(Boolean);
  }

  return cleanValue(value);
}

function cleanValue(value) {
  return value.trim().replace(/^["']|["']$/g, "");
}

function estimateReadingMinutes(body) {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

function createSlug(fileName, title) {
  return fileName
    .replace(/\.md$/i, "")
    .replace(/^\d{4}-\d{2}-\d{2}-?/, "")
    || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const files = (await readdir(postsDir)).filter((file) => file.endsWith(".md")).sort();
const posts = [];

for (const file of files) {
  const source = await readFile(path.join(postsDir, file), "utf8");
  const { body, metadata } = parseFrontmatter(source, file);

  if (!metadata.title || !metadata.date || !metadata.summary) {
    throw new Error(`${file} needs title, date, and summary fields.`);
  }

  posts.push({
    slug: metadata.slug || createSlug(file, metadata.title),
    title: metadata.title,
    date: metadata.date,
    summary: metadata.summary,
    tags: metadata.tags || [],
    readingMinutes: estimateReadingMinutes(body),
    body
  });
}

posts.sort((a, b) => new Date(b.date) - new Date(a.date));

await mkdir(outputDir, { recursive: true });
await writeFile(outputFile, `${JSON.stringify(posts, null, 2)}\n`);
await writeFile(
  outputScriptFile,
  `window.DAILY_POSTS = ${JSON.stringify(posts, null, 2)};\n`
);

console.log(`Built ${posts.length} daily posts -> data/daily-posts.json and data/daily-posts.js`);
