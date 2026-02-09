// src/sync.js
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || "https://jsonplaceholder.typicode.com";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}, retries = 3) {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }
      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      const backoff = 500 * Math.pow(2, attempt); // 500ms, 1s, 2s...
      console.log(`Fetch failed (attempt ${attempt + 1}). Retrying in ${backoff}ms...`);
      await sleep(backoff);
      attempt++;
    }
  }
}

async function main() {
  console.log("Starting sync...");

  const postsUrl = `${API_BASE_URL}/posts`;
  const usersUrl = `${API_BASE_URL}/users`;

  // Fetch data
  const posts = await fetchWithRetry(postsUrl);
  const users = await fetchWithRetry(usersUrl);

  // Simple “transformation”: attach user name to each post
  const userMap = new Map(users.map((u) => [u.id, u.name]));
  const enrichedPosts = posts.slice(0, 20).map((p) => ({
    id: p.id,
    title: p.title,
    userId: p.userId,
    userName: userMap.get(p.userId) || "Unknown",
  }));

  // Write to output file
  const outPath = path.join("output", "posts_enriched.json");
  fs.writeFileSync(outPath, JSON.stringify(enrichedPosts, null, 2));
  console.log(`Done. Wrote ${enrichedPosts.length} records to ${outPath}`);
}

main().catch((err) => {
  console.error("Sync failed:", err.message);
  process.exit(1);
});