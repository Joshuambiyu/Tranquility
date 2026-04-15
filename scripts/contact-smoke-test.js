import "dotenv/config";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

async function run() {
  const payload = {
    name: "Smoke Test User",
    email: "smoke-test@example.com",
    message: "This is a contact API smoke test submission.",
    website: "",
  };

  console.log(`Running contact smoke test against ${baseUrl}/api/contact`);

  const response = await fetch(`${baseUrl}/api/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseBody = await response.text();

  console.log(`Status: ${response.status}`);
  console.log(`Body: ${responseBody}`);

  if (!response.ok) {
    process.exitCode = 1;
    throw new Error("Contact smoke test failed.");
  }

  console.log("Contact smoke test passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
