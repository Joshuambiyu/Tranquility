import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { updateArticleAction } from "@/app/admin/articles/actions";
import ArticleRichEditor from "@/app/admin/articles/ArticleRichEditor";
import ImagePickerPreview from "@/app/admin/articles/ImagePickerPreview";
import { hasAdminAccess } from "@/lib/admin";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface AdminEditArticlePageProps {
  params: Promise<{ articleId: string }>;
  searchParams: Promise<{ updated?: string }>;
}

export default async function AdminEditArticlePage({ params, searchParams }: AdminEditArticlePageProps) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin/articles");
  }

  if (!(await hasAdminAccess(session.user.email))) {
    return (
      <main className="mx-auto grid min-h-[70vh] w-full max-w-4xl place-items-center px-5 py-10 sm:px-8 lg:px-10">
        <section className="grid w-full gap-4 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-rose-100">
          <h1 className="text-2xl font-semibold text-slate-900">Access denied</h1>
          <p className="text-slate-700">
            Your account is signed in, but it is not allowed to edit articles.
          </p>
        </section>
      </main>
    );
  }

  const { articleId } = await params;
  const { updated } = await searchParams;

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

  return (
    <main className="mx-auto grid min-h-[70vh] w-full max-w-6xl gap-6 px-5 py-8 sm:px-8 lg:px-10">
      <section className="grid gap-3 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Edit Article</h1>
            <p className="text-sm text-slate-600">Update this article as a draft or publish changes.</p>
          </div>
          <Link
            href="/admin/articles"
            className="inline-grid w-full place-items-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 sm:w-fit"
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
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <form action={updateArticleAction} className="grid gap-4">
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

          <ArticleRichEditor initialContent={article.content} />

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

          <ImagePickerPreview initialImageSrc={article.imageSrc} />

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

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="submit"
              name="submitIntent"
              value="draft"
              className="inline-grid w-full place-items-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-fit"
            >
              Save Draft Changes
            </button>
            <button
              type="submit"
              name="submitIntent"
              value="publish"
              className="inline-grid w-full place-items-center rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 sm:w-fit"
            >
              Publish Changes
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
