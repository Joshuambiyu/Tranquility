import { redirect } from "next/navigation";

import {
  archiveResourceAction,
  createOrUpdateResourceAction,
  publishResourceAction,
  setCurrentResourceAction,
} from "@/app/admin/resources/actions";
import ArticleFormEnhancements from "@/app/admin/articles/ArticleFormEnhancements";
import ResourceSubmitButtons from "@/app/admin/resources/ResourceSubmitButtons";
import { hasAdminAccess } from "@/lib/admin";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface ResourceAdminRow {
  id: string;
  monthKey: string;
  title: string;
  description: string;
  linkUrl: string | null;
  linkLabel: string | null;
  status: string;
  isCurrent: boolean;
  publishedAt: Date | null;
  createdAt: Date;
}

type ResourceOfMonthListModel = {
  findMany: (args: {
    orderBy: Array<{ isCurrent: "desc" } | { monthKey: "desc" }>;
    take: number;
    select: {
      id: true;
      monthKey: true;
      title: true;
      description: true;
      linkUrl: true;
      linkLabel: true;
      status: true;
      isCurrent: true;
      publishedAt: true;
      createdAt: true;
    };
  }) => Promise<ResourceAdminRow[]>;
};

function getResourceOfMonthListModel() {
  return (prisma as unknown as { resourceOfMonth: ResourceOfMonthListModel }).resourceOfMonth;
}

const RESOURCE_FORM_ID = "admin-resource-upsert-form";
const RESOURCE_DRAFT_STORAGE_KEY = "admin-resource-upsert-draft";

export default async function AdminResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; duplicate?: string }>;
}) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin/resources");
  }

  if (!(await hasAdminAccess(session.user.email))) {
    return (
      <main className="mx-auto grid min-h-[70vh] w-full max-w-4xl place-items-center px-5 py-10 sm:px-8 lg:px-10">
        <section className="grid w-full gap-4 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-rose-100">
          <h1 className="text-2xl font-semibold text-slate-900">Access denied</h1>
          <p className="text-slate-700">
            Your account is signed in, but it is not allowed to manage monthly resources.
          </p>
        </section>
      </main>
    );
  }

  const resources = await getResourceOfMonthListModel().findMany({
    orderBy: [{ isCurrent: "desc" }, { monthKey: "desc" }],
    take: 24,
    select: {
      id: true,
      monthKey: true,
      title: true,
      description: true,
      linkUrl: true,
      linkLabel: true,
      status: true,
      isCurrent: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  const { saved, duplicate } = await searchParams;

  return (
    <main className="mx-auto grid min-h-[70vh] w-full max-w-6xl gap-6 px-5 py-8 sm:px-8 lg:px-10">
      <section className="grid gap-2 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Resource of the Month</h1>
        <p className="text-sm text-slate-600">
          Create monthly resources, publish them, and set which one is currently featured on the public resources page.
        </p>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        {saved === "1" ? (
          <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            Monthly resource saved successfully.
          </p>
        ) : null}
        {duplicate === "1" ? (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            Duplicate submit blocked: this resource save request was already processed.
          </p>
        ) : null}

        <form id={RESOURCE_FORM_ID} action={createOrUpdateResourceAction} className="grid gap-4">
          <ArticleFormEnhancements
            formId={RESOURCE_FORM_ID}
            storageKey={RESOURCE_DRAFT_STORAGE_KEY}
            clearDraft={saved === "1"}
            restoreDraft={saved !== "1"}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Month key (YYYY-MM)
              <input
                name="monthKey"
                required
                pattern="\d{4}-\d{2}"
                placeholder="2026-04"
                className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-emerald-400 transition focus:ring"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Title
              <input
                name="title"
                required
                minLength={4}
                maxLength={160}
                placeholder="Resource of the Month: Weekly Reflection Template"
                className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-emerald-400 transition focus:ring"
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Description
            <textarea
              name="description"
              required
              minLength={20}
              maxLength={1200}
              rows={4}
              className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-emerald-400 transition focus:ring"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Link URL (optional)
              <input
                name="linkUrl"
                placeholder="https://example.com/resource"
                className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-emerald-400 transition focus:ring"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Link label (optional)
              <input
                name="linkLabel"
                placeholder="Open template"
                className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-emerald-400 transition focus:ring"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-slate-700">
            <label className="flex items-center gap-3 font-medium">
              <input type="checkbox" name="setAsCurrent" className="h-4 w-4" />
              Set as current Resource of the Month
            </label>
          </div>

          <ResourceSubmitButtons />
        </form>
      </section>

      <section className="grid gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Recent Monthly Resources</h2>
        {resources.length === 0 ? (
          <p className="text-sm text-slate-600">No monthly resources yet.</p>
        ) : (
          <div className="grid gap-3">
            {resources.map((resource) => (
              <article
                key={resource.id}
                className="grid gap-3 rounded-xl border border-slate-200 px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="break-words font-semibold text-slate-900">
                    {resource.monthKey} • {resource.title}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.12em]">
                    <span className="rounded-full border border-slate-200 px-2.5 py-1 text-slate-600">
                      {resource.status}
                    </span>
                    {resource.isCurrent ? (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">Current</span>
                    ) : null}
                  </div>
                </div>

                <p className="text-sm text-slate-700">{resource.description}</p>
                {resource.linkUrl && resource.linkLabel ? (
                  <p className="break-all text-xs text-slate-600">
                    Link: {resource.linkLabel} ({resource.linkUrl})
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  {resource.status !== "published" ? (
                    <form action={publishResourceAction}>
                      <input type="hidden" name="resourceId" value={resource.id} />
                      <button
                        type="submit"
                        className="w-full rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 sm:w-auto"
                      >
                        Publish
                      </button>
                    </form>
                  ) : null}

                  {!resource.isCurrent ? (
                    <form action={setCurrentResourceAction}>
                      <input type="hidden" name="resourceId" value={resource.id} />
                      <button
                        type="submit"
                        className="w-full rounded-full border border-amber-200 px-4 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 sm:w-auto"
                      >
                        Set Current
                      </button>
                    </form>
                  ) : null}

                  {resource.status !== "archived" ? (
                    <form action={archiveResourceAction}>
                      <input type="hidden" name="resourceId" value={resource.id} />
                      <button
                        type="submit"
                        className="w-full rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                      >
                        Archive
                      </button>
                    </form>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
