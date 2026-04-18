import { redirect } from "next/navigation";

import {
  approveVoiceSubmissionAction,
  clearVoiceOfWeekAction,
  featureVoiceSubmissionAction,
  rejectVoiceSubmissionAction,
} from "@/app/admin/voices/actions";
import {
  ADMIN_HERO_PANEL_CLASS,
  ADMIN_PANEL_CLASS,
  adminButtonClass,
} from "@/app/admin/adminDesign";
import ActionSubmitButton from "@/app/components/feedback/ActionSubmitButton";
import ToastOnMount from "@/app/components/feedback/ToastOnMount";
import { hasAdminAccess } from "@/lib/admin";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const visibilityLabels = {
  open: "Open",
  anonymous: "Anonymous",
} as const;

export default async function VoicesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ result?: string }>;
}) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin/voices");
  }

  if (!(await hasAdminAccess(session.user.email))) {
    return (
      <main className="mx-auto grid min-h-[70vh] w-full max-w-4xl place-items-center px-5 py-10 sm:px-8 lg:px-10">
        <section className="grid w-full gap-4 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-rose-100">
          <h1 className="text-2xl font-semibold text-slate-900">Access denied</h1>
          <p className="text-slate-700">
            Your account is signed in, but it is not allowed to manage community voices.
          </p>
        </section>
      </main>
    );
  }

  const submissions = await prisma.voiceSubmission.findMany({
    orderBy: [{ isVoiceOfWeek: "desc" }, { createdAt: "desc" }],
    take: 200,
    select: {
      id: true,
      title: true,
      reflection: true,
      author: true,
      visibility: true,
      descriptor: true,
      status: true,
      isVoiceOfWeek: true,
      createdAt: true,
      approvedAt: true,
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  const { result } = await searchParams;
  const resultToastByKey: Record<string, { type: "success" | "info"; title: string; message: string }> = {
    approved: {
      type: "success",
      title: "Voice approved",
      message: "The submission is now visible in community voices.",
    },
    rejected: {
      type: "info",
      title: "Voice rejected",
      message: "The submission has been marked as rejected.",
    },
    featured: {
      type: "success",
      title: "Voice of the Week updated",
      message: "The selected submission is now featured.",
    },
    cleared: {
      type: "info",
      title: "Feature cleared",
      message: "Voice of the Week was cleared.",
    },
  };
  const resultToast = result ? resultToastByKey[result] : null;

  return (
    <main className="mx-auto grid min-h-[70vh] w-full max-w-6xl gap-6 px-5 py-8 sm:px-8 lg:px-10">
      {resultToast ? (
        <ToastOnMount
          id={`voices-admin-${result}`}
          type={resultToast.type}
          title={resultToast.title}
          message={resultToast.message}
        />
      ) : null}

      <section className={ADMIN_HERO_PANEL_CLASS}>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Community Voices</h1>
        <p className="text-sm text-slate-600">
          Approve, reject, and choose which approved submission appears as Voice of the Week.
        </p>
      </section>

      {submissions.length === 0 ? (
        <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
          <p className="text-slate-700">No voice submissions yet.</p>
        </section>
      ) : (
        <section className="grid gap-4">
          {submissions.map((submission) => (
            <article
              key={submission.id}
              className={`grid gap-4 ${ADMIN_PANEL_CLASS}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="grid gap-2">
                  <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    <span className="rounded-full border border-slate-200 px-3 py-1 text-slate-600">
                      {visibilityLabels[submission.visibility as keyof typeof visibilityLabels]}
                    </span>
                    <span className="rounded-full border border-slate-200 px-3 py-1 text-slate-600">
                      {submission.status}
                    </span>
                    {submission.isVoiceOfWeek ? (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                        Voice of the Week
                      </span>
                    ) : null}
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900">{submission.title}</h2>
                </div>
                <div className="grid gap-1 text-xs text-slate-500 sm:text-right">
                  <time>{new Date(submission.createdAt).toLocaleString()}</time>
                  {submission.approvedAt ? <span>Approved {new Date(submission.approvedAt).toLocaleString()}</span> : null}
                </div>
              </div>

              <div className="grid gap-1 text-sm text-slate-700">
                <p className="break-words">
                  <span className="font-medium text-slate-900">Public author:</span> {submission.author}
                </p>
                <p className="break-words">
                  <span className="font-medium text-slate-900">Signed-in user:</span>{" "}
                  {submission.user?.email ?? "Guest / not linked"}
                </p>
                {submission.descriptor ? (
                  <p className="break-words">
                    <span className="font-medium text-slate-900">Descriptor:</span> {submission.descriptor}
                  </p>
                ) : null}
              </div>

              <p className="whitespace-pre-wrap text-slate-800">{submission.reflection}</p>

              <div className="flex flex-wrap gap-3">
                {submission.status !== "approved" ? (
                  <form action={approveVoiceSubmissionAction}>
                    <input type="hidden" name="voiceId" value={submission.id} />
                    <ActionSubmitButton
                      idleLabel="Approve"
                      pendingLabel="Approving..."
                      className={adminButtonClass({ tone: "primary" })}
                    />
                  </form>
                ) : null}

                {submission.status !== "rejected" ? (
                  <form action={rejectVoiceSubmissionAction}>
                    <input type="hidden" name="voiceId" value={submission.id} />
                    <ActionSubmitButton
                      idleLabel="Reject"
                      pendingLabel="Rejecting..."
                      className={adminButtonClass({ tone: "danger" })}
                    />
                  </form>
                ) : null}

                {submission.status === "approved" && !submission.isVoiceOfWeek ? (
                  <form action={featureVoiceSubmissionAction}>
                    <input type="hidden" name="voiceId" value={submission.id} />
                    <ActionSubmitButton
                      idleLabel="Make Voice of the Week"
                      pendingLabel="Updating..."
                      className={adminButtonClass({ tone: "warning" })}
                    />
                  </form>
                ) : null}

                {submission.isVoiceOfWeek ? (
                  <form action={clearVoiceOfWeekAction}>
                    <input type="hidden" name="voiceId" value={submission.id} />
                    <ActionSubmitButton
                      idleLabel="Clear Voice of the Week"
                      pendingLabel="Clearing..."
                      className={adminButtonClass({ tone: "secondary" })}
                    />
                  </form>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}