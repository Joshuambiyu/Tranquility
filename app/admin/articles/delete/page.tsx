import Link from "next/link";
import { redirect } from "next/navigation";

import { deleteAllArticlesAction, deleteArticleAction } from "@/app/admin/articles/actions";
import { hasAdminAccess } from "@/lib/admin";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DeleteArticlesAdminPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin/articles/delete");
  }

  if (!(await hasAdminAccess(session.user.email))) {
    return (
      <main className="mx-auto grid min-h-[70vh] w-full max-w-4xl place-items-center px-5 py-10 sm:px-8 lg:px-10">
        <section className="grid w-full gap-4 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-rose-100">
          <h1 className="text-2xl font-semibold text-slate-900">Access denied</h1>
          <p className="text-slate-700">
            Your account is signed in, but it is not allowed to delete articles.
          </p>
        </section>
      </main>
    );
  }

  const articles = await prisma.article.findMany({
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
    take: 300,
    select: {
      id: true,
      title: true,
      slug: true,
      author: true,
      isFeatured: true,
      publishedAt: true,
    },
  });

  return (
    <main className="mx-auto grid min-h-[70vh] w-full max-w-6xl gap-6 px-5 py-8 sm:px-8 lg:px-10">
      <section className="grid gap-3 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-rose-200">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Delete Articles</h1>
            <p className="text-sm text-slate-700">
              This page permanently deletes published articles. There is no restore action.
            </p>
          </div>
          <Link
            href="/admin/articles"
            className="inline-grid w-full place-items-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 sm:w-fit"
          >
            Back to Articles Admin
          </Link>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 px-4 py-3 text-sm text-rose-900">
          Active articles: <span className="font-semibold">{articles.length}</span>
        </div>
      </section>

      {articles.length === 0 ? (
        <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
          <p className="text-slate-700">No articles found. Nothing to delete.</p>
        </section>
      ) : (
        <section className="grid gap-4">
          {articles.map((article) => (
            <article
              key={article.id}
              className="grid gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="grid gap-1">
                  <h2 className="text-xl font-semibold text-slate-900">{article.title}</h2>
                  <p className="break-all text-xs text-slate-600">
                    {article.author} • {new Date(article.publishedAt).toLocaleString()} • /blog/
                    {article.slug}
                  </p>
                </div>
                {article.isFeatured ? (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                    Featured
                  </span>
                ) : null}
              </div>

              <form action={deleteArticleAction} className="flex justify-end">
                <input type="hidden" name="articleId" value={article.id} />
                <button
                  type="submit"
                  className="w-full rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 sm:w-auto"
                >
                  Delete Article
                </button>
              </form>
            </article>
          ))}
        </section>
      )}

      {articles.length > 0 ? (
        <section className="grid gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-rose-200">
          <h2 className="text-xl font-semibold text-slate-900">Danger Zone</h2>
          <p className="text-sm text-slate-700">
            Delete every article in one action. To continue, type <span className="font-semibold">DELETE ALL ARTICLES</span>.
          </p>
          <form action={deleteAllArticlesAction} className="grid gap-3 sm:max-w-md">
            <input
              name="confirmation"
              required
              placeholder="DELETE ALL ARTICLES"
              className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-rose-400 transition focus:ring"
            />
            <button
              type="submit"
              className="inline-grid w-full place-items-center rounded-full bg-rose-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-800 sm:w-fit"
            >
              Delete All Articles
            </button>
          </form>
        </section>
      ) : null}
    </main>
  );
}
