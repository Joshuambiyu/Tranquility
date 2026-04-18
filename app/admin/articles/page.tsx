import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ADMIN_CARD_CLASS,
  ADMIN_HERO_PANEL_CLASS,
  ADMIN_PANEL_CLASS,
  adminButtonClass,
} from "@/app/admin/adminDesign";
import AdminAccessDenied from "@/app/admin/AdminAccessDenied";
import { createArticleAction, deleteArticleAction } from "@/app/admin/articles/actions";
import DeleteArticleInlineButton from "@/app/admin/articles/DeleteArticleInlineButton";
import ArticleFormEnhancements from "@/app/admin/articles/ArticleFormEnhancements";
import ArticleRichEditor from "@/app/admin/articles/ArticleRichEditor";
import ArticleSubmitButtons from "@/app/admin/articles/ArticleSubmitButtons";
import CollapsibleAdminSection from "@/app/admin/articles/CollapsibleAdminSection";
import ImagePickerPreview from "@/app/admin/articles/ImagePickerPreview";
import PublishReadinessChecklist from "@/app/admin/articles/PublishReadinessChecklist";
import ToastOnMount from "@/app/components/feedback/ToastOnMount";
import { hasAdminAccess } from "@/lib/admin";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface AdminArticlesPageProps {
  searchParams: Promise<{ created?: string; duplicate?: string; result?: string }>;
}

const CREATE_ARTICLE_FORM_ID = "admin-article-create-form";
const CREATE_ARTICLE_DRAFT_STORAGE_KEY = "admin-article-create-draft";

export default async function AdminArticlesPage({ searchParams }: AdminArticlesPageProps) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin/articles");
  }

  if (!(await hasAdminAccess(session.user.email))) {
    return <AdminAccessDenied />;
  }

  const latestArticles = await prisma.article.findMany({
    orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
    take: 12,
    select: {
      id: true,
      slug: true,
      title: true,
      author: true,
      isFeatured: true,
      status: true,
      publishedAt: true,
    },
  });

  const { created, duplicate, result } = await searchParams;

  return (
    <main className="mx-auto grid min-h-[70vh] w-full min-w-0 max-w-6xl gap-6 overflow-x-hidden px-5 py-8 sm:px-8 lg:px-10">
      <ToastOnMount
        id={`articles-created-${created}-${duplicate}`}
        type={duplicate === "1" ? "info" : "success"}
        title={duplicate === "1" ? "Duplicate submission blocked" : "Article saved"}
        message={duplicate === "1" ? "Your previous submit was already processed." : "Your article was created successfully."}
        enabled={created === "1"}
      />
      <ToastOnMount
        id={`articles-result-${result}`}
        type="info"
        title="Article deleted"
        message="The article was removed successfully."
        enabled={result === "deleted"}
      />

      <section className={ADMIN_HERO_PANEL_CLASS}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Editorial Articles</h1>
            <p className="text-sm text-slate-600">Create and publish articles directly to the live blog feed.</p>
          </div>
          <Link
            href="/admin/articles/delete"
            className={adminButtonClass({ tone: "danger" })}
          >
            Delete Articles
          </Link>
        </div>
      </section>

      <CollapsibleAdminSection
        panelId="admin-articles-create-panel"
        title="Create Article"
        sectionClassName={`min-w-0 ${ADMIN_PANEL_CLASS}`}
        defaultExpanded={false}
      >
        {created === "1" ? (
          <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            Article created successfully.
          </p>
        ) : null}
        {duplicate === "1" ? (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            Duplicate submit blocked: an identical article was just created recently.
          </p>
        ) : null}

        <form id={CREATE_ARTICLE_FORM_ID} action={createArticleAction} className="grid min-w-0 gap-4">
          <ArticleFormEnhancements
            formId={CREATE_ARTICLE_FORM_ID}
            storageKey={CREATE_ARTICLE_DRAFT_STORAGE_KEY}
            clearDraft={created === "1"}
            restoreDraft={created !== "1"}
          />

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
            Excerpt (optional)
            <textarea
              name="excerpt"
              maxLength={500}
              rows={3}
              placeholder="Leave blank to auto-generate from content"
              className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-emerald-400 transition focus:ring"
            />
          </label>

          <ArticleRichEditor
            draftStorageKey={CREATE_ARTICLE_DRAFT_STORAGE_KEY}
            restoreDraft={created !== "1"}
          />

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

          <ImagePickerPreview />

          <label className="grid gap-2 text-sm font-medium text-slate-700">
              Image description (optional)
              <input
                name="imageAlt"
                placeholder="A calm sunrise over quiet hills"
                className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-emerald-400 transition focus:ring"
              />
              <span className="text-xs font-normal text-slate-500">
                Short description for accessibility. If empty, the article title is used.
              </span>
          </label>

          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input type="checkbox" name="isFeatured" className="h-4 w-4" />
            Set as featured article
          </label>

          <PublishReadinessChecklist formId={CREATE_ARTICLE_FORM_ID} />

          <ArticleSubmitButtons draftLabel="Save Draft" publishLabel="Publish Article" />
        </form>
      </CollapsibleAdminSection>

      <CollapsibleAdminSection
        panelId="admin-articles-recent-panel"
        title="Recent Articles"
        sectionClassName={`grid gap-4 ${ADMIN_PANEL_CLASS}`}
        defaultExpanded={false}
      >
        <div className="grid gap-3">
          {latestArticles.map((article) => (
            <article key={article.id} className={`grid gap-3 ${ADMIN_CARD_CLASS} sm:flex sm:flex-wrap sm:items-center sm:justify-between`}>
              <div className="grid gap-1">
                <p className="font-semibold text-slate-900">{article.title}</p>
                <p className="break-words text-xs text-slate-600">
                  {article.author} • {new Date(article.publishedAt).toLocaleString()} • /blog/{article.slug}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/articles/edit/${article.id}`}
                  className={adminButtonClass({ tone: "secondary", size: "compact", fullWidth: false })}
                >
                  Edit
                </Link>
                <form action={deleteArticleAction}>
                  <input type="hidden" name="articleId" value={article.id} />
                  <DeleteArticleInlineButton />
                </form>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                    article.status === "published"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {article.status}
                </span>
                {article.isFeatured ? (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                    Featured
                  </span>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </CollapsibleAdminSection>
    </main>
  );
}