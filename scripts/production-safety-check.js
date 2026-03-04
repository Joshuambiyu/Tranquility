/* eslint-disable no-console */
import "dotenv/config";

const requiredEnvVars = [
  "DATABASE_URL",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "CONTACT_NOTIFY_TO",
  "ADMIN_EMAILS",
];

function isBlank(value) {
  return !value || value.trim().length === 0;
}

function run() {
  const missing = requiredEnvVars.filter((envName) => isBlank(process.env[envName]));

  if (missing.length > 0) {
    console.error("Missing required environment variables:");
    missing.forEach((envName) => console.error(`- ${envName}`));
    process.exit(1);
  }

  if ((process.env.NEXTAUTH_URL ?? "").startsWith("http://")) {
    console.warn("Warning: NEXTAUTH_URL is not HTTPS. Use HTTPS in production.");
  }

  if (!(process.env.RESEND_FROM_EMAIL ?? "").includes("@")) {
    console.error("RESEND_FROM_EMAIL must be a valid email address.");
    process.exit(1);
  }

  if (!(process.env.ADMIN_EMAILS ?? "").includes("@")) {
    console.error("ADMIN_EMAILS should contain one or more valid admin emails.");
    process.exit(1);
  }

  console.log("Production safety check passed.");
}

run();
