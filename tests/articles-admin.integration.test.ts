import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type MockSession = {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
  };
} | null;

type ArticleRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: unknown;
  author: string;
  imageSrc: string;
  imageAlt: string;
  reflectionMoment: string;
  isFeatured: boolean;
  status: string;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  createdById?: string | null;
};

const {
  getServerSessionMock,
  hasAdminAccessMock,
  redirectMock,
  requestHeaders,
  cookieJar,
  revalidatePathMock,
  articleStore,
  mockPrisma,
} = vi.hoisted(() => {
  const requestHeadersState = new Map<string, string>();
  const cookieState = new Map<string, string>();
  const articles: ArticleRecord[] = [];

  const applySelect = <T extends object>(row: T, select?: Record<string, boolean>) => {
    if (!select) {
      return row;
    }

    const selected: Record<string, unknown> = {};

    Object.entries(select).forEach(([key, include]) => {
      if (include) {
        selected[key] = (row as Record<string, unknown>)[key];
      }
    });

    return selected;
  };

  const matchesWhere = (row: ArticleRecord, where?: Record<string, unknown>) => {
    if (!where) {
      return true;
    }

    return Object.entries(where).every(([key, value]) => {
      if (key === "id" && value && typeof value === "object" && "not" in (value as Record<string, unknown>)) {
        return row.id !== (value as { not: string }).not;
      }

      if (key === "createdAt" && value && typeof value === "object" && "gte" in (value as Record<string, unknown>)) {
        return row.createdAt >= (value as { gte: Date }).gte;
      }

      return (row as Record<string, unknown>)[key] === value;
    });
  };

  const prisma = {
    article: {
      findFirst: vi.fn(async (args?: { where?: Record<string, unknown>; orderBy?: Record<string, "asc" | "desc">; select?: Record<string, boolean> }) => {
        const candidates = articles.filter((row) => matchesWhere(row, args?.where));

        if (args?.orderBy) {
          const [[field, direction]] = Object.entries(args.orderBy);
          candidates.sort((a, b) => {
            const aValue = a[field as keyof ArticleRecord];
            const bValue = b[field as keyof ArticleRecord];

            if (aValue instanceof Date && bValue instanceof Date) {
              return direction === "desc" ? bValue.getTime() - aValue.getTime() : aValue.getTime() - bValue.getTime();
            }

            if (typeof aValue === "string" && typeof bValue === "string") {
              return direction === "desc" ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
            }

            return 0;
          });
        }

        const row = candidates[0];
        return row ? applySelect(row, args?.select) : null;
      }),
      findUnique: vi.fn(async (args: { where: { id?: string; slug?: string }; select?: Record<string, boolean> }) => {
        const row = args.where.id
          ? articles.find((entry) => entry.id === args.where.id)
          : articles.find((entry) => entry.slug === args.where.slug);

        return row ? applySelect(row, args.select) : null;
      }),
      updateMany: vi.fn(async (args: { where?: Record<string, unknown>; data: Partial<ArticleRecord> }) => {
        let count = 0;

        articles.forEach((row, index) => {
          if (!matchesWhere(row, args.where)) {
            return;
          }

          articles[index] = {
            ...row,
            ...args.data,
            updatedAt: new Date(),
          };
          count += 1;
        });

        return { count };
      }),
      create: vi.fn(async (args: { data: Omit<ArticleRecord, "id" | "createdAt" | "updatedAt"> }) => {
        const now = new Date();
        const record: ArticleRecord = {
          id: randomUUID(),
          createdAt: now,
          updatedAt: now,
          ...args.data,
        };

        articles.push(record);
        return record;
      }),
      update: vi.fn(async (args: { where: { id: string }; data: Partial<ArticleRecord> }) => {
        const index = articles.findIndex((entry) => entry.id === args.where.id);

        if (index === -1) {
          throw new Error("Article not found for update");
        }

        const updated: ArticleRecord = {
          ...articles[index],
          ...args.data,
          updatedAt: new Date(),
        };

        articles[index] = updated;
        return updated;
      }),
      count: vi.fn(async (args?: { where?: Record<string, unknown> }) => {
        return articles.filter((row) => matchesWhere(row, args?.where)).length;
      }),
    },
    $disconnect: vi.fn(async () => undefined),
  };

  return {
    getServerSessionMock: vi.fn(),
    hasAdminAccessMock: vi.fn(),
    redirectMock: vi.fn((target: string) => {
      throw new Error(`NEXT_REDIRECT:${target}`);
    }),
    requestHeaders: requestHeadersState,
    cookieJar: cookieState,
    revalidatePathMock: vi.fn(),
    articleStore: articles,
    mockPrisma: prisma,
  };
});

let mockSession: MockSession = null;

vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth");
  return {
    ...actual,
    getServerSession: getServerSessionMock,
  };
});

vi.mock("@/lib/admin", async () => {
  const actual = await vi.importActual<typeof import("@/lib/admin")>("@/lib/admin");
  return {
    ...actual,
    hasAdminAccess: hasAdminAccessMock,
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");
  return {
    ...actual,
    redirect: redirectMock,
  };
});

vi.mock("next/cache", async () => {
  const actual = await vi.importActual<typeof import("next/cache")>("next/cache");
  return {
    ...actual,
    revalidatePath: revalidatePathMock,
  };
});

vi.mock("next/headers", async () => {
  const actual = await vi.importActual<typeof import("next/headers")>("next/headers");

  return {
    ...actual,
    headers: async () => ({
      get: (name: string) => requestHeaders.get(name.toLowerCase()) ?? null,
    }),
    cookies: async () => ({
      get: (name: string) => {
        const value = cookieJar.get(name);
        return value ? { name, value } : undefined;
      },
      set: (name: string, value: string) => {
        cookieJar.set(name, value);
      },
    }),
  };
});

import { createArticleAction, updateArticleAction } from "@/app/admin/articles/actions";

function setRequestOrigin(baseUrl = "http://localhost:3000") {
  requestHeaders.clear();
  requestHeaders.set("origin", baseUrl);
  requestHeaders.set("host", baseUrl.replace(/^https?:\/\//, ""));
  requestHeaders.set("x-forwarded-proto", baseUrl.startsWith("https") ? "https" : "http");
}

function emptyDocJson() {
  return JSON.stringify({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [],
      },
    ],
  });
}

function paragraphDocJson(text: string) {
  return JSON.stringify({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text,
          },
        ],
      },
    ],
  });
}

function buildCreateFormData(input: {
  submitToken: string;
  submitIntent: "draft" | "publish";
  title?: string;
  reflectionMoment?: string;
  contentJson?: string;
}) {
  const formData = new FormData();
  formData.set("submitToken", input.submitToken);
  formData.set("submitIntent", input.submitIntent);
  formData.set("title", input.title ?? "");
  formData.set("author", "");
  formData.set("excerpt", "");
  formData.set("contentJson", input.contentJson ?? emptyDocJson());
  formData.set("content", "");
  formData.set("reflectionMoment", input.reflectionMoment ?? "");
  formData.set("imageSrc", "");
  formData.set("imageAlt", "");
  formData.set("slug", "");
  return formData;
}

function buildUpdateFormData(input: {
  articleId: string;
  submitToken: string;
  submitIntent?: "draft" | "publish";
  title?: string;
  author?: string;
  excerpt?: string;
  contentJson?: string;
  reflectionMoment?: string;
  imageAlt?: string;
  slug?: string;
}) {
  const formData = new FormData();
  formData.set("articleId", input.articleId);
  formData.set("submitToken", input.submitToken);
  formData.set("submitIntent", input.submitIntent ?? "publish");
  formData.set("title", input.title ?? "Updated title");
  formData.set("author", input.author ?? "Updated author");
  formData.set("excerpt", input.excerpt ?? "");
  formData.set("contentJson", input.contentJson ?? paragraphDocJson("Updated publish content."));
  formData.set("content", "");
  formData.set("reflectionMoment", input.reflectionMoment ?? "Updated reflection is long enough.");
  formData.set("imageSrc", "");
  formData.set("imageAlt", input.imageAlt ?? "Updated image alt");
  formData.set("slug", input.slug ?? "updated-title");
  return formData;
}

beforeEach(() => {
  mockSession = {
    user: {
      id: `user-${randomUUID().slice(0, 8)}`,
      email: "admin@tranquilityhub.test",
      name: "Vitest Author",
    },
  };

  articleStore.length = 0;
  cookieJar.clear();
  setRequestOrigin("http://localhost:3000");

  getServerSessionMock.mockImplementation(async () => mockSession);
  hasAdminAccessMock.mockResolvedValue(true);
  redirectMock.mockImplementation((target: string) => {
    throw new Error(`NEXT_REDIRECT:${target}`);
  });
  revalidatePathMock.mockReset();
  mockPrisma.article.findFirst.mockClear();
  mockPrisma.article.findUnique.mockClear();
  mockPrisma.article.updateMany.mockClear();
  mockPrisma.article.create.mockClear();
  mockPrisma.article.update.mockClear();
  mockPrisma.article.count.mockClear();
});

afterEach(() => {
  mockSession = null;
  articleStore.length = 0;
  cookieJar.clear();
  requestHeaders.clear();

  getServerSessionMock.mockReset();
  hasAdminAccessMock.mockReset();
  redirectMock.mockReset();
  revalidatePathMock.mockReset();
  mockPrisma.article.findFirst.mockClear();
  mockPrisma.article.findUnique.mockClear();
  mockPrisma.article.updateMany.mockClear();
  mockPrisma.article.create.mockClear();
  mockPrisma.article.update.mockClear();
  mockPrisma.article.count.mockClear();
});

describe("admin article actions", () => {
  it("allows incomplete draft creation while publish remains strict", async () => {
    const draftFormData = buildCreateFormData({
      submitToken: randomUUID(),
      submitIntent: "draft",
      title: "",
      reflectionMoment: "",
      contentJson: emptyDocJson(),
    });

    await expect(createArticleAction(draftFormData)).rejects.toThrow("NEXT_REDIRECT:/admin/articles?created=1");

    expect(articleStore).toHaveLength(1);
    expect(articleStore[0].status).toBe("draft");
    expect(articleStore[0].title).toBe("Untitled draft");

    const publishFormData = buildCreateFormData({
      submitToken: randomUUID(),
      submitIntent: "publish",
      title: "",
      reflectionMoment: "This is valid reflection text for publish.",
      contentJson: paragraphDocJson("Publish body content."),
    });

    await expect(createArticleAction(publishFormData)).rejects.toThrow("Title must be at least 4 characters.");
  });

  it("blocks replayed create submits with same idempotency token", async () => {
    const token = randomUUID();

    const firstSubmit = buildCreateFormData({
      submitToken: token,
      submitIntent: "publish",
      title: "Vitest Article Replay",
      reflectionMoment: "This reflection has enough text for publishing.",
      contentJson: paragraphDocJson("Replay protected body content."),
    });

    await expect(createArticleAction(firstSubmit)).rejects.toThrow("NEXT_REDIRECT:/admin/articles?created=1");

    const replaySubmit = buildCreateFormData({
      submitToken: token,
      submitIntent: "publish",
      title: "Vitest Article Replay",
      reflectionMoment: "This reflection has enough text for publishing.",
      contentJson: paragraphDocJson("Replay protected body content."),
    });

    await expect(createArticleAction(replaySubmit)).rejects.toThrow(
      "NEXT_REDIRECT:/admin/articles?created=1&duplicate=1",
    );

    expect(articleStore).toHaveLength(1);
    expect(articleStore[0].title).toBe("Vitest Article Replay");
  });

  it("treats a retried create with a new token as already processed when the article already exists", async () => {
    const firstSubmit = buildCreateFormData({
      submitToken: randomUUID(),
      submitIntent: "publish",
      title: "Retry-safe Create Article",
      reflectionMoment: "This reflection has enough text for publishing.",
      contentJson: paragraphDocJson("Retry-safe create body content."),
    });

    await expect(createArticleAction(firstSubmit)).rejects.toThrow("NEXT_REDIRECT:/admin/articles?created=1");

    const retrySubmit = buildCreateFormData({
      submitToken: randomUUID(),
      submitIntent: "publish",
      title: "Retry-safe Create Article",
      reflectionMoment: "This reflection has enough text for publishing.",
      contentJson: paragraphDocJson("Retry-safe create body content."),
    });

    await expect(createArticleAction(retrySubmit)).rejects.toThrow(
      "NEXT_REDIRECT:/admin/articles?created=1&duplicate=1",
    );

    expect(articleStore).toHaveLength(1);
    expect(articleStore[0].title).toBe("Retry-safe Create Article");
  });

  it("recovers from a concurrent create race by treating slug conflicts with matching payload as duplicate success", async () => {
    const createSpy = mockPrisma.article.create;
    const originalCreate = createSpy.getMockImplementation();

    createSpy.mockImplementationOnce(async (args: { data: Omit<ArticleRecord, "id" | "createdAt" | "updatedAt"> }) => {
      const now = new Date();

      articleStore.push({
        id: randomUUID(),
        createdAt: now,
        updatedAt: now,
        ...args.data,
      });

      throw {
        code: "P2002",
        meta: { target: ["slug"] },
      };
    });

    if (originalCreate) {
      createSpy.mockImplementation(originalCreate);
    }

    const raceSubmit = buildCreateFormData({
      submitToken: randomUUID(),
      submitIntent: "publish",
      title: "Concurrent Create Article",
      reflectionMoment: "This reflection has enough text for publishing.",
      contentJson: paragraphDocJson("Concurrent create body content."),
    });

    await expect(createArticleAction(raceSubmit)).rejects.toThrow(
      "NEXT_REDIRECT:/admin/articles?created=1&duplicate=1",
    );

    expect(articleStore).toHaveLength(1);
    expect(articleStore[0].slug).toBe("concurrent-create-article");
  });

  it("updates draft article to published status with strict checks", async () => {
    const originalPublishedAt = new Date("2020-01-01T00:00:00.000Z");

    const seededArticle: ArticleRecord = {
      id: randomUUID(),
      slug: `vitest-article-seed-${randomUUID().slice(0, 8)}`,
      title: "Vitest Article Seed",
      excerpt: "Seed excerpt",
      content: JSON.parse(paragraphDocJson("Seed content")),
      author: "Vitest Author Seed",
      imageSrc: "/featured-reflection.svg",
      imageAlt: "Seed image",
      reflectionMoment: "Seed reflection moment text",
      isFeatured: false,
      status: "draft",
      publishedAt: originalPublishedAt,
      createdAt: new Date("2020-01-01T00:00:00.000Z"),
      updatedAt: new Date("2020-01-01T00:00:00.000Z"),
      createdById: mockSession?.user.id,
    };

    articleStore.push(seededArticle);

    const updateFormData = buildUpdateFormData({
      articleId: seededArticle.id,
      submitToken: randomUUID(),
      title: "Vitest Article Updated",
      author: "Vitest Author Updated",
      reflectionMoment: "Updated reflection is long enough.",
      imageAlt: "Updated image alt",
      slug: "vitest-article-updated",
    });

    await expect(updateArticleAction(updateFormData)).rejects.toThrow(
      `NEXT_REDIRECT:/admin/articles?updated=1&articleId=${seededArticle.id}`,
    );

    expect(articleStore).toHaveLength(1);
    expect(articleStore[0].status).toBe("published");
    expect(articleStore[0].title).toBe("Vitest Article Updated");
    expect(articleStore[0].slug).toBe("vitest-article-updated");
    expect(articleStore[0].publishedAt.getTime() > originalPublishedAt.getTime()).toBe(true);
  });

  it("treats a replayed update with the same token as already processed success", async () => {
    const seededArticle: ArticleRecord = {
      id: randomUUID(),
      slug: `retryable-update-${randomUUID().slice(0, 8)}`,
      title: "Retryable Update Seed",
      excerpt: "Seed excerpt",
      content: JSON.parse(paragraphDocJson("Seed content")),
      author: "Vitest Author Seed",
      imageSrc: "",
      imageAlt: "Seed image",
      reflectionMoment: "Seed reflection moment text",
      isFeatured: false,
      status: "published",
      publishedAt: new Date("2020-01-01T00:00:00.000Z"),
      createdAt: new Date("2020-01-01T00:00:00.000Z"),
      updatedAt: new Date("2020-01-01T00:00:00.000Z"),
      createdById: mockSession?.user.id,
    };

    articleStore.push(seededArticle);

    const token = randomUUID();
    const firstSubmit = buildUpdateFormData({
      articleId: seededArticle.id,
      submitToken: token,
      title: "Retry-safe Updated Title",
      author: "Retry-safe Updated Author",
      reflectionMoment: "Retry-safe reflection that is long enough.",
      imageAlt: "Retry-safe image alt",
      slug: "retry-safe-updated-title",
    });

    await expect(updateArticleAction(firstSubmit)).rejects.toThrow(
      `NEXT_REDIRECT:/admin/articles?updated=1&articleId=${seededArticle.id}`,
    );

    const replaySubmit = buildUpdateFormData({
      articleId: seededArticle.id,
      submitToken: token,
      title: "Retry-safe Updated Title",
      author: "Retry-safe Updated Author",
      reflectionMoment: "Retry-safe reflection that is long enough.",
      imageAlt: "Retry-safe image alt",
      slug: "retry-safe-updated-title",
    });

    await expect(updateArticleAction(replaySubmit)).rejects.toThrow(
      `NEXT_REDIRECT:/admin/articles?updated=1&articleId=${seededArticle.id}&duplicate=1`,
    );

    expect(mockPrisma.article.update).toHaveBeenCalledTimes(1);
    expect(articleStore[0].title).toBe("Retry-safe Updated Title");
    expect(articleStore[0].slug).toBe("retry-safe-updated-title");
  });

  it("treats a retried update with a new token as already applied when the state already matches", async () => {
    const seededArticle: ArticleRecord = {
      id: randomUUID(),
      slug: `matching-update-${randomUUID().slice(0, 8)}`,
      title: "Matching Update Seed",
      excerpt: "Seed excerpt",
      content: JSON.parse(paragraphDocJson("Seed content")),
      author: "Vitest Author Seed",
      imageSrc: "",
      imageAlt: "Seed image",
      reflectionMoment: "Seed reflection moment text",
      isFeatured: false,
      status: "published",
      publishedAt: new Date("2020-01-01T00:00:00.000Z"),
      createdAt: new Date("2020-01-01T00:00:00.000Z"),
      updatedAt: new Date("2020-01-01T00:00:00.000Z"),
      createdById: mockSession?.user.id,
    };

    articleStore.push(seededArticle);

    await expect(
      updateArticleAction(
        buildUpdateFormData({
          articleId: seededArticle.id,
          submitToken: randomUUID(),
          title: "State Match Updated Title",
          author: "State Match Updated Author",
          reflectionMoment: "State match reflection that is long enough.",
          imageAlt: "State match image alt",
          slug: "state-match-updated-title",
        }),
      ),
    ).rejects.toThrow(`NEXT_REDIRECT:/admin/articles?updated=1&articleId=${seededArticle.id}`);

    await expect(
      updateArticleAction(
        buildUpdateFormData({
          articleId: seededArticle.id,
          submitToken: randomUUID(),
          title: "State Match Updated Title",
          author: "State Match Updated Author",
          reflectionMoment: "State match reflection that is long enough.",
          imageAlt: "State match image alt",
          slug: "state-match-updated-title",
        }),
      ),
    ).rejects.toThrow(`NEXT_REDIRECT:/admin/articles?updated=1&articleId=${seededArticle.id}`);

    expect(mockPrisma.article.update).toHaveBeenCalledTimes(1);
    expect(articleStore[0].title).toBe("State Match Updated Title");
    expect(articleStore[0].author).toBe("State Match Updated Author");
  });
});
