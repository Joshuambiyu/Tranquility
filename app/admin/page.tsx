import Link from "next/link";
import { redirect } from "next/navigation";

import {
  hasAdminAccess,
  listAdminUsers,
} from "@/lib/admin";
import {
  addAdminEmailAction,
  removeAdminEmailAction,
} from "@/app/admin/admin-access/actions";
import AdminAccessDenied from "@/app/admin/AdminAccessDenied";
import {
  ADMIN_CARD_CLASS,
  ADMIN_HERO_PANEL_CLASS,
  ADMIN_PANEL_CLASS,
  adminButtonClass,
} from "@/app/admin/adminDesign";
import ActionSubmitButton from "@/app/components/feedback/ActionSubmitButton";
import ToastOnMount from "@/app/components/feedback/ToastOnMount";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ResourceOfMonthAggregateModel = {
  aggregate: (args: {
    _count: { _all: true };
    where: { OR: Array<{ status: string } | { isCurrent: boolean }> };
  }) => Promise<{ _count: { _all: number } }>;
};

function getResourceOfMonthAggregateModel() {
  return (prisma as unknown as { resourceOfMonth: ResourceOfMonthAggregateModel }).resourceOfMonth;
}

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ adminAccess?: string }>;
}) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  if (!(await hasAdminAccess(session.user.email))) {
    return <AdminAccessDenied />;
  }

  const [pendingVoices, totalContacts, resourceStats, admins] = await Promise.all([
    prisma.voiceSubmission.count({ where: { status: "pending" } }),
    prisma.contactSubmission.count(),
    getResourceOfMonthAggregateModel().aggregate({
      _count: { _all: true },
      where: {
        OR: [{ status: "published" }, { isCurrent: true }],
      },
    }),
    listAdminUsers(),
  ]);

  const { adminAccess } = await searchParams;

  const accessToastByResult: Record<string, { type: "success" | "error" | "info"; title: string; message: string }> = {
    added: {
      type: "success",
      title: "Admin added",
      message: "The user now has admin access.",
    },
    removed: {
      type: "success",
      title: "Admin removed",
      message: "Admin access was removed successfully.",
    },
    "self-remove-blocked": {
      type: "error",
      title: "Action blocked",
      message: "You cannot remove your own admin access.",
    },
    "user-not-found": {
      type: "info",
      title: "User must sign in first",
      message: "That email is not yet a registered user. Ask them to sign in once before granting admin access.",
    },
    "invalid-email": {
      type: "error",
      title: "Invalid email",
      message: "Please provide a valid email address.",
    },
    "add-failed": {
      type: "error",
      title: "Could not add admin",
      message: "We could not grant admin access right now. Please try again.",
    },
  };

  const accessToast = adminAccess ? accessToastByResult[adminAccess] : null;

  return (
    <main className="mx-auto grid min-h-[70vh] w-full max-w-6xl gap-6 px-5 py-8 sm:px-8 lg:px-10">
      {accessToast ? (
        <ToastOnMount
          id={`admin-access-${adminAccess}`}
          type={accessToast.type}
          title={accessToast.title}
          message={accessToast.message}
        />
      ) : null}

      <section className={ADMIN_HERO_PANEL_CLASS}>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-600">
          Manage moderation and submissions from one place.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className={ADMIN_PANEL_CLASS}>
          <h2 className="text-xl font-semibold text-slate-900">Community Voices</h2>
          <p className="text-sm text-slate-600">
            Pending submissions: <span className="font-semibold text-slate-900">{pendingVoices}</span>
          </p>
          <p className="text-sm text-slate-700">
            Approve, reject, and set Voice of the Week.
          </p>
          <Link
            href="/admin/voices"
            className={adminButtonClass({ tone: "primary" })}
          >
            Open Voices Admin
          </Link>
        </article>

        <article className={ADMIN_PANEL_CLASS}>
          <h2 className="text-xl font-semibold text-slate-900">Contact Submissions</h2>
          <p className="text-sm text-slate-600">
            Total submissions: <span className="font-semibold text-slate-900">{totalContacts}</span>
          </p>
          <p className="text-sm text-slate-700">
            Review the latest messages from the contact page.
          </p>
          <Link
            href="/admin/contact-submissions"
            className={adminButtonClass({ tone: "secondary" })}
          >
            Open Contact Admin
          </Link>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className={ADMIN_PANEL_CLASS}>
          <h2 className="text-xl font-semibold text-slate-900">Editorial Articles</h2>
          <p className="text-sm text-slate-700">
            Publish and feature blog articles directly from the admin panel.
          </p>
          <div className="grid gap-2 sm:flex sm:flex-wrap">
            <Link
              href="/admin/articles"
              className={adminButtonClass({ tone: "secondary" })}
            >
              Open Articles Admin
            </Link>
            <Link
              href="/admin/articles/delete"
              className={adminButtonClass({ tone: "danger" })}
            >
              Delete Articles
            </Link>
          </div>
        </article>

        <article className={ADMIN_PANEL_CLASS}>
          <h2 className="text-xl font-semibold text-slate-900">Resource of the Month</h2>
          <p className="text-sm text-slate-600">
            Managed resources: <span className="font-semibold text-slate-900">{resourceStats._count._all}</span>
          </p>
          <p className="text-sm text-slate-700">
            Create monthly resources, publish them, and select the current featured resource.
          </p>
          <Link
            href="/admin/resources"
            className={adminButtonClass({ tone: "secondary" })}
          >
            Open Resources Admin
          </Link>
        </article>
      </section>

      <section className={`grid gap-4 ${ADMIN_PANEL_CLASS}`}>
        <h2 className="text-xl font-semibold text-slate-900">Admin Access</h2>
        <p className="text-sm text-slate-700">
          Admin privileges are role-based. Add or remove admins by updating signed-in users to the admin role.
        </p>

        <form action={addAdminEmailAction} className="grid gap-3 sm:max-w-xl sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Admin email
            <input
              type="email"
              name="email"
              required
              placeholder="name@example.com"
              className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-emerald-400 transition focus:ring"
            />
          </label>
          <ActionSubmitButton
            idleLabel="Add Admin"
            pendingLabel="Adding..."
            className={adminButtonClass({ tone: "primary", className: "px-6" })}
          />
        </form>

        <div className="grid gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">Current admins</h3>
          {admins.length === 0 ? (
            <p className="text-sm text-slate-600">No admins found.</p>
          ) : (
            <div className="grid gap-2">
              {admins.map((admin) => (
                <article key={admin.id} className={`flex flex-wrap items-center justify-between gap-3 ${ADMIN_CARD_CLASS}`}>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium text-slate-900">{admin.email}</p>
                    <p className="text-xs text-slate-500">
                      {admin.name ? `${admin.name} • ` : ""}Role updated {new Date(admin.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <form action={removeAdminEmailAction}>
                    <input type="hidden" name="email" value={admin.email} />
                    <ActionSubmitButton
                      idleLabel="Remove"
                      pendingLabel="Removing..."
                      className={adminButtonClass({ tone: "danger", size: "compact", fullWidth: false })}
                    />
                  </form>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
