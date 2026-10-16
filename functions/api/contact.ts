// Cloudflare Pages Function: POST /api/contact
// Sends contact form submissions through the Brevo transactional email API.
//
// Required environment variables (Cloudflare Pages → Settings → Variables and Secrets):
//   BREVO_API_KEY       Brevo API key (v3)
//   CONTACT_TO_EMAIL    Inbox that receives the messages
//   CONTACT_FROM_EMAIL  Sender address verified in Brevo

interface Env {
  BREVO_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

const MAX_LENGTH = { name: 100, email: 254, message: 5000 };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const onRequestPost = async ({ request, env }: PagesContext) => {
  const wantsJson = request.headers.get("accept")?.includes("application/json");
  const respond = (status: number, ok: boolean, error?: string) => {
    if (wantsJson) return json(status, ok ? { ok } : { ok, error });
    // Fallback for browsers without JavaScript: redirect back to the form.
    const url = new URL("/contact", request.url);
    url.searchParams.set("status", ok ? "sent" : "error");
    return Response.redirect(url.toString(), 303);
  };

  if (!env.BREVO_API_KEY || !env.CONTACT_TO_EMAIL || !env.CONTACT_FROM_EMAIL) {
    console.error("Contact form: missing Brevo environment variables");
    return respond(500, false, "not_configured");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return respond(400, false, "invalid_request");
  }

  // Honeypot: real users never fill this hidden field. Pretend success for bots.
  if (String(form.get("website") ?? "").trim()) return respond(200, true);

  const name = String(form.get("name") ?? "")
    .replace(/\s+/g, " ")
    .trim();
  const email = String(form.get("email") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();

  if (
    !name ||
    !message ||
    !EMAIL_PATTERN.test(email) ||
    name.length > MAX_LENGTH.name ||
    email.length > MAX_LENGTH.email ||
    message.length > MAX_LENGTH.message
  ) {
    return respond(422, false, "invalid_input");
  }

  const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": env.BREVO_API_KEY,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "hoefener.media Kontaktformular",
        email: env.CONTACT_FROM_EMAIL,
      },
      to: [{ email: env.CONTACT_TO_EMAIL }],
      replyTo: { email, name },
      subject: `Neue Kontaktanfrage von ${name}`,
      textContent: `Name: ${name}\nE-Mail: ${email}\n\n${message}`,
      htmlContent: `<p><strong>Name:</strong> ${escapeHtml(name)}<br><strong>E-Mail:</strong> ${escapeHtml(email)}</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    }),
  });

  if (!brevoResponse.ok) {
    console.error(
      "Contact form: Brevo request failed",
      brevoResponse.status,
      await brevoResponse.text(),
    );
    return respond(502, false, "send_failed");
  }

  return respond(200, true);
};
