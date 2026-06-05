import { NextResponse } from "next/server";
import {
  isHoneypotSubmission,
  prepareProblemSubmission,
  sendContactEmail,
  validateContactPayload,
  type ContactEmailConfig,
  type ProblemFormData,
} from "../../../lib/problem-email";

export const runtime = "nodejs";

function getContactEmailConfig(): ContactEmailConfig {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !toEmail || !fromEmail) {
    throw new Error("Missing contact email environment variables.");
  }

  return {
    apiKey,
    toEmail,
    fromEmail,
  };
}

export async function POST(request: Request) {
  let data: Partial<ProblemFormData>;

  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neispravan zahtjev." }, { status: 400 });
  }

  if (isHoneypotSubmission(data)) {
    return NextResponse.json({ ok: true });
  }

  const validation = validateContactPayload(data);
  if (!validation.valid) {
    return NextResponse.json(
      {
        ok: false,
        error: "Molimo provjerite obavezna polja i unesite valjanu email adresu.",
        fields: validation.errors,
      },
      { status: 400 },
    );
  }

  try {
    await sendContactEmail(prepareProblemSubmission(data), getContactEmailConfig());
  } catch (error) {
    console.error("Contact form email failed", error);
    return NextResponse.json(
      { ok: false, error: "Trenutno ne možemo poslati upit. Molimo pokušajte ponovno za nekoliko trenutaka." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
