import Link from "next/link";
import { redirect } from "next/navigation";

import { createArticleAction } from "@/app/admin/articles/actions";
import { isAdminEmail } from "@/lib/admin";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminArticlesPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin/articles");
  }

  if (!isAdminEmail(session.user.email)) {
    return (
      <main className="mx-auto grid min-h-[70vh] w-full max-w-4xl place-items-center px-5 py-10 sm:px-8 lg:px-10">
        <section className="grid w-full gap-4 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-rose-100">
          <h1 className="text-2xl font-semibold text-slate-900">Access denied</h1>
          <p className="text-slate-700">
            Your account is signed in, but it is not allowed to manage articles.
          </p>
        </section>
      </main>
    );
  }

  const latestArticles = await prisma.article.findMany({
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
    take: 12,
    select: {
      id: true,
      slug: true,
      title: true,
      author: true,
      isFeatured: true,
      publishedAt: true,
    },
  });

  return (
    <main className="mx-auto grid min-h-[70vh] w-full max-w-6xl gap-6 px-5 py-8 sm:px-8 lg:px-10">
      <section className="grid gap-2 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Editorial Articles</h1>
            <p className="text-sm text-slate-600">Create and publish articles directly to the live blog feed.</p>
          </div>
          <Link
            href="/admin/articles/delete"
            className="inline-grid w-full place-items-center rounded-full border border-rose-300 px-5 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 sm:w-fit"
          >
            Delete Articles
          </Link>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <form action={createArticleAction} className="grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Title
            <input
              name="title"
              required
              minLength={4}
              maxLength={160}
              className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-emerald-400 transition focus:ring"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Author
              <input
                name="author"
                maxLength={100}
                placeholder="Editorial"
                className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-emerald-400 transition focus:ring"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Slug (optional)
              <input
                name="slug"
                maxLength={180}
                placeholder="quiet-morning-reset"
                className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-emerald-400 transition focus:ring"
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Excerpt
            <textarea
              name="excerpt"
              required
              minLength={20}
              maxLength={500}
              rows={3}
              className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-emerald-400 transition focus:ring"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Content (separate paragraphs with blank lines)
            <textarea
              name="content"
              required
              rows={10}
              className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-emerald-400 transition focus:ring"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Reflection moment
            <textarea
              name="reflectionMoment"
              required
              minLength={10}
              maxLength={300}
              rows={2}
              className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-emerald-400 transition focus:ring"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Image src
              <input
                name="imageSrc"
                placeholder="/featured-reflection.svg"
                className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-emerald-400 transition focus:ring"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Image alt
              <input
                name="imageAlt"
                placeholder="A calm sunrise"
                className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-emerald-400 transition focus:ring"
              />
            </label>
          </div>

          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input type="checkbox" name="isFeatured" className="h-4 w-4" />
            Set as featured article
          </label>

          <button
            type="submit"
            className="inline-grid w-full place-items-center rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 sm:w-fit"
          >
            Publish Article
          </button>
        </form>
      </section>

      <section className="grid gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Recent Published Articles</h2>
        <div className="grid gap-3">
          {latestArticles.map((article) => (
            <article key={article.id} className="grid gap-3 rounded-xl border border-slate-200 px-4 py-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
              <div className="grid gap-1">
                <p className="font-semibold text-slate-900">{article.title}</p>
                <p className="break-all text-xs text-slate-600">
                  {article.author} • {new Date(article.publishedAt).toLocaleString()} • /blog/{article.slug}
                </p>
              </div>
              {article.isFeatured ? (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                  Featured
                </span>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}