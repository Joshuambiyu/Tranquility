import Link from "next/link";
import { redirect } from "next/navigation";

import AdminAccessDenied from "@/app/admin/AdminAccessDenied";
import {
  ADMIN_HERO_PANEL_CLASS,
  ADMIN_PANEL_CLASS,
  adminButtonClass,
} from "@/app/admin/adminDesign";
import { deleteAllArticlesAction, deleteArticleAction } from "@/app/admin/articles/actions";
import ActionSubmitButton from "@/app/components/feedback/ActionSubmitButton";
import ToastOnMount from "@/app/components/feedback/ToastOnMount";
import { hasAdminAccess } from "@/lib/admin";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DeleteArticlesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ result?: string }>;
}) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin/articles/delete");
  }

  if (!(await hasAdminAccess(session.user.email))) {
    return <AdminAccessDenied />;
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

  const { result } = await searchParams;

  const toastByResult: Record<string, { type: "success" | "error"; title: string; message: string }> = {
    "all-deleted": {
      type: "success",
      title: "All articles deleted",
      message: "Every article was permanently removed.",
    },
    "confirm-required": {
      type: "error",
      title: "Confirmation required",
      message: "Type DELETE ALL ARTICLES to continue.",
    },
  };
  const activeToast = result ? toastByResult[result] : null;

  return (
    <main className="mx-auto grid min-h-[70vh] w-full max-w-6xl gap-6 px-5 py-8 sm:px-8 lg:px-10">
      {activeToast ? (
        <ToastOnMount
          id={`delete-articles-${result}`}
          type={activeToast.type}
          title={activeToast.title}
          message={activeToast.message}
        />
      ) : null}

      <section className={`${ADMIN_HERO_PANEL_CLASS} gap-3 ring-rose-200`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Delete Articles</h1>
            <p className="text-sm text-slate-700">
              This page permanently deletes published articles. There is no restore action.
            </p>
          </div>
          <Link
            href="/admin/articles"
            className={adminButtonClass({ tone: "secondary" })}
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
              className={`grid gap-3 ${ADMIN_PANEL_CLASS}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="grid gap-1">
                  <h2 className="text-xl font-semibold text-slate-900">{article.title}</h2>
                  <p className="break-words text-xs text-slate-600">
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
                <ActionSubmitButton
                  idleLabel="Delete Article"
                  pendingLabel="Deleting..."
                  className={adminButtonClass({ tone: "danger" })}
                />
              </form>
            </article>
          ))}
        </section>
      )}

      {articles.length > 0 ? (
        <section className={`grid gap-4 ${ADMIN_PANEL_CLASS} ring-rose-200`}>
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
            <ActionSubmitButton
              idleLabel="Delete All Articles"
              pendingLabel="Deleting..."
              className={adminButtonClass({ tone: "danger", className: "bg-rose-700 text-white hover:border-rose-800 hover:bg-rose-800" })}
            />
          </form>
        </section>
      ) : null}
    </main>
  );
}
