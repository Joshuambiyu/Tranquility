import { redirect } from "next/navigation";
import {
  ADMIN_HERO_PANEL_CLASS,
  ADMIN_PANEL_CLASS,
} from "@/app/admin/adminDesign";
import { getServerSession } from "@/lib/auth";
import { hasAdminAccess } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function ContactSubmissionsAdminPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin/contact-submissions");
  }

  if (!(await hasAdminAccess(session.user.email))) {
    return (
      <main className="mx-auto grid min-h-[70vh] w-full max-w-4xl place-items-center px-5 py-10 sm:px-8 lg:px-10">
        <section className="grid w-full gap-4 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-rose-100">
          <h1 className="text-2xl font-semibold text-slate-900">Access denied</h1>
          <p className="text-slate-700">
            Your account is signed in, but it is not allowed to view contact submissions.
          </p>
        </section>
      </main>
    );
  }

  const submissions = await prisma.contactSubmission.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 200,
    select: {
      id: true,
      name: true,
      email: true,
      message: true,
      createdAt: true,
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  return (
    <main className="mx-auto grid min-h-[70vh] w-full max-w-6xl gap-6 px-5 py-8 sm:px-8 lg:px-10">
      <section className={ADMIN_HERO_PANEL_CLASS}>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Contact Submissions</h1>
        <p className="text-sm text-slate-600">
          Showing the latest {submissions.length} submissions captured from the contact form.
        </p>
      </section>

      {submissions.length === 0 ? (
        <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
          <p className="text-slate-700">No contact submissions yet.</p>
        </section>
      ) : (
        <section className="grid gap-4">
          {submissions.map((submission) => (
            <article
              key={submission.id}
              className={`grid gap-3 ${ADMIN_PANEL_CLASS}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-900">{submission.name}</h2>
                <time className="text-xs text-slate-500">
                  {new Date(submission.createdAt).toLocaleString()}
                </time>
              </div>

              <div className="grid gap-1 text-sm text-slate-700">
                <p className="break-words">
                  <span className="font-medium text-slate-900">Sender email:</span> {submission.email}
                </p>
                <p className="break-words">
                  <span className="font-medium text-slate-900">Signed-in user:</span>{" "}
                  {submission.user?.email ?? "Guest / not linked"}
                </p>
              </div>

              <p className="whitespace-pre-wrap text-slate-800">{submission.message}</p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
