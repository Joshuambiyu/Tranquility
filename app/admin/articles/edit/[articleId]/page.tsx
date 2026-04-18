import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  ADMIN_HERO_PANEL_CLASS,
  ADMIN_PANEL_CLASS,
  adminButtonClass,
} from "@/app/admin/adminDesign";
import AdminAccessDenied from "@/app/admin/AdminAccessDenied";
import { updateArticleAction } from "@/app/admin/articles/actions";
import ArticleFormEnhancements from "@/app/admin/articles/ArticleFormEnhancements";
import ArticleRichEditor from "@/app/admin/articles/ArticleRichEditor";
import ArticleSubmitButtons from "@/app/admin/articles/ArticleSubmitButtons";
import ImagePickerPreview from "@/app/admin/articles/ImagePickerPreview";
import PublishReadinessChecklist from "@/app/admin/articles/PublishReadinessChecklist";
import ToastOnMount from "@/app/components/feedback/ToastOnMount";
import { hasAdminAccess } from "@/lib/admin";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface AdminEditArticlePageProps {
  params: Promise<{ articleId: string }>;
  searchParams: Promise<{ updated?: string; duplicate?: string }>;
}

export default async function AdminEditArticlePage({ params, searchParams }: AdminEditArticlePageProps) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin/articles");
  }

  if (!(await hasAdminAccess(session.user.email))) {
    return <AdminAccessDenied />;
  }

  const { articleId } = await params;
  const { updated, duplicate } = await searchParams;

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: {
      id: true,
      title: true,
      slug: true,
      author: true,
      excerpt: true,
      content: true,
      reflectionMoment: true,
      imageSrc: true,
      imageAlt: true,
      isFeatured: true,
      status: true,
      updatedAt: true,
    },
  });

  if (!article) {
    notFound();
  }

  const editFormId = `admin-article-edit-form-${article.id}`;
  const editDraftStorageKey = `admin-article-edit-draft-${article.id}`;

  return (
    <main className="mx-auto grid min-h-[70vh] w-full min-w-0 max-w-6xl gap-6 overflow-x-hidden px-5 py-8 sm:px-8 lg:px-10">
      <ToastOnMount
        id={`articles-updated-${article.id}-${updated}-${duplicate}`}
        type={duplicate === "1" ? "info" : "success"}
        title={duplicate === "1" ? "Duplicate submission blocked" : "Article updated"}
        message={duplicate === "1" ? "Your previous update was already processed." : "Changes were saved successfully."}
        enabled={updated === "1"}
      />

      <section className={`${ADMIN_HERO_PANEL_CLASS} gap-3`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Edit Article</h1>
            <p className="text-sm text-slate-600">Update this article as a draft or publish changes.</p>
          </div>
          <Link
            href="/admin/articles"
            className={adminButtonClass({ tone: "secondary" })}
          >
            Back to Articles Admin
          </Link>
        </div>

        <p className="text-xs text-slate-500">
          Last updated: {new Date(article.updatedAt).toLocaleString()} • Status: {article.status}
        </p>

        {updated === "1" ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            Article updated successfully.
          </p>
        ) : null}
        {duplicate === "1" ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            Duplicate submit blocked: this update request was already processed.
          </p>
        ) : null}
      </section>

      <section className={`min-w-0 ${ADMIN_PANEL_CLASS}`}>
        <form id={editFormId} action={updateArticleAction} className="grid min-w-0 gap-4">
          <ArticleFormEnhancements
            formId={editFormId}
            storageKey={editDraftStorageKey}
            clearDraft={updated === "1"}
            restoreDraft={updated !== "1"}
          />

          <input type="hidden" name="articleId" value={article.id} />

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Title
            <input
              name="title"
              required
              minLength={4}
              maxLength={160}
              defaultValue={article.title}
              className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-emerald-400 transition focus:ring"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Author
              <input
                name="author"
                maxLength={100}
                defaultValue={article.author}
                className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-emerald-400 transition focus:ring"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Slug
              <input
                name="slug"
                maxLength={180}
                defaultValue={article.slug}
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
              defaultValue={article.excerpt}
              className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-emerald-400 transition focus:ring"
            />
          </label>

          <ArticleRichEditor
            initialContent={article.content}
            draftStorageKey={editDraftStorageKey}
            restoreDraft={updated !== "1"}
            formId={editFormId}
          />

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Reflection moment
            <textarea
              name="reflectionMoment"
              required
              minLength={10}
              maxLength={300}
              rows={2}
              defaultValue={article.reflectionMoment}
              className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-emerald-400 transition focus:ring"
            />
          </label>

          <ImagePickerPreview initialImageSrc={article.imageSrc} formId={editFormId} />

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Image description (optional)
            <input
              name="imageAlt"
              defaultValue={article.imageAlt}
              className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-emerald-400 transition focus:ring"
            />
            <span className="text-xs font-normal text-slate-500">
              Short description for accessibility. If empty, the article title is used.
            </span>
          </label>

          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input type="checkbox" name="isFeatured" defaultChecked={article.isFeatured} className="h-4 w-4" />
            Set as featured article
          </label>

          <PublishReadinessChecklist formId={editFormId} />

          <ArticleSubmitButtons draftLabel="Save Draft Changes" publishLabel="Publish Changes" />
        </form>
      </section>
    </main>
  );
}
