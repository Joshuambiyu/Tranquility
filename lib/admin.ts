const splitEmails = (value?: string | null) =>
  (value ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export function getAdminEmails() {
  const explicitAdmins = splitEmails(process.env.ADMIN_EMAILS);
  const fallbackAdmin = splitEmails(process.env.CONTACT_NOTIFY_TO);

  return new Set([...explicitAdmins, ...fallbackAdmin]);
}

export function isAdminEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  return getAdminEmails().has(email.toLowerCase());
}
