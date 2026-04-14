import { headers } from "next/headers";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { oneTap } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";

function buildTrustedOrigins() {
  const explicit = [
    process.env.BETTER_AUTH_URL,
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_NEXTAUTH_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    "http://localhost:3000",
  ].filter((value): value is string => Boolean(value));

  const variants = new Set<string>();

  for (const origin of explicit) {
    variants.add(origin);

    try {
      const url = new URL(origin);
      const host = url.hostname;
      if (host.startsWith("www.")) {
        variants.add(`${url.protocol}//${host.replace(/^www\./, "")}${url.port ? `:${url.port}` : ""}`);
      } else {
        variants.add(`${url.protocol}//www.${host}${url.port ? `:${url.port}` : ""}`);
      }
    } catch {
      // Ignore invalid URL values.
    }
  }

  return Array.from(variants);
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      // Avoid `prompt=none` flows that can behave inconsistently on mobile/webviews
      // (especially when One Tap was dismissed) by always asking the user to pick an account.
      prompt: "select_account",
    },
  },
  appName: "TranquilityHub",
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustedOrigins: buildTrustedOrigins(),
  plugins: [
    oneTap({
      clientId: process.env.GOOGLE_CLIENT_ID,
    }),
    nextCookies(),
  ],
});

export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const userRoleRecord = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      role: userRoleRecord?.role ?? "user",
    },
  };
}
