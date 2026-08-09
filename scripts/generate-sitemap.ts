// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.

import { writeFileSync } from "fs";
import { resolve } from "path";
import { sportsVideos } from "../src/data/sportsVideos";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

const BASE_URL = "https://undereview.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/feed", changefreq: "daily", priority: "0.9" },
  { path: "/trending", changefreq: "daily", priority: "0.8" },
  { path: "/rulebook", changefreq: "weekly", priority: "0.8" },
  { path: "/rulebooks", changefreq: "weekly", priority: "0.7" },
  { path: "/rules", changefreq: "weekly", priority: "0.7" },
  { path: "/leaderboard", changefreq: "daily", priority: "0.6" },
  { path: "/clips", changefreq: "daily", priority: "0.6" },
  { path: "/reels", changefreq: "daily", priority: "0.6" },
  { path: "/community", changefreq: "daily", priority: "0.6" },
  { path: "/about", changefreq: "monthly", priority: "0.5" },
  { path: "/calls", changefreq: "daily", priority: "0.9" },
  // One indexable page per controversial call
  ...sportsVideos.map((v) => ({
    path: `/call/${slugify(v.title)}-${v.id}`,
    changefreq: "weekly" as const,
    priority: "0.7",
  })),
];

function generateSitemap(list: SitemapEntry[]) {
  const urls = list.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
