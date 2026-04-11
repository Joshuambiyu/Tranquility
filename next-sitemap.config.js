/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

async function getPublishedBlogPaths() {
  const prisma = new PrismaClient();

  try {
    const articles = await prisma.article.findMany({
      where: { status: "published" },
      select: { slug: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    });

    return articles
      .map((article) => ({
        slug: article.slug?.trim(),
        publishedAt: article.publishedAt,
      }))
      .filter((article) => Boolean(article.slug))
      .map((article) => ({
        loc: `/blog/${article.slug}`,
        lastmod: new Date(article.publishedAt).toISOString(),
      }));
  } catch (error) {
    console.warn("[next-sitemap] Failed to load blog slugs from DB:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.tranquilityhub.co.ke",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: "monthly",
  priority: 0.6,
  sitemapSize: 5000,
  exclude: [
    "/404",
    "/server-error",
    "/admin/*",
    "/api/*",
    "/auth/*",
    "/icon.svg",
  ],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/admin", "/api", "/auth"] },
    ],
  },
  transform: async (config, path) => {
    const pageMeta = {
      "/": { priority: 1.0, changefreq: "weekly" },
      "/about": { priority: 0.8, changefreq: "monthly" },
      "/voices": { priority: 0.9, changefreq: "daily" },
      "/blog": { priority: 0.9, changefreq: "daily" },
      "/resources": { priority: 0.85, changefreq: "weekly" },
      "/journals": { priority: 0.8, changefreq: "weekly" },
      "/contact": { priority: 0.7, changefreq: "monthly" },
      "/privacy": { priority: 0.5, changefreq: "yearly" },
    };

    const meta = pageMeta[path] ?? { priority: 0.6, changefreq: "monthly" };

    return {
      loc: path,
      changefreq: meta.changefreq,
      priority: meta.priority,
      lastmod: new Date().toISOString(),
      alternateRefs: config.alternateRefs ?? [],
    };
  },
  additionalPaths: async (config) => {
    const staticPaths = [
      "/",
      "/about",
      "/voices",
      "/blog",
      "/resources",
      "/journals",
      "/contact",
      "/privacy",
    ];
    const blogPaths = await getPublishedBlogPaths();

    const staticEntries = await Promise.all(
      staticPaths.map((path) => config.transform(config, path)),
    );

    const blogEntries = await Promise.all(
      blogPaths.map(async (path) => {
        const transformed = await config.transform(config, path.loc);
        return {
          ...transformed,
          changefreq: "weekly",
          priority: 0.8,
          lastmod: path.lastmod,
        };
      }),
    );

    return [...staticEntries, ...blogEntries];
  },
};
