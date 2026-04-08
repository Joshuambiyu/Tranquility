import { headers } from "next/headers";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { oneTap } from "better-auth/plugins";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";

const oneTapClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

export async function authorizeGoogleOneTapCredential(credential?: string) {
  if (!credential) {
    return null;
  }

  const ticket = await oneTapClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload?.email || !payload.email_verified) {
    return null;
  }

  const user = await prisma.user.upsert({
    where: { email: payload.email },
    update: {
      name: payload.name,
      image: payload.picture,
    },
    create: {
      email: payload.email,
      name: payload.name,
      image: payload.picture,
      emailVerified: new Date(),
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
  };
}

export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    },
  };
}
