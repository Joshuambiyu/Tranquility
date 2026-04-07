import { headers } from "next/headers";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { oneTap } from "better-auth/plugins";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";

const oneTapClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000"],
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
