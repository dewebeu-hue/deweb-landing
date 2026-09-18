import { NextResponse } from "next/server";
import {
  isCjenikHrHoneypotSubmission,
  prepareCjenikHrRequest,
  sendCjenikHrEmail,
  validateCjenikHrRequest,
  type CjenikHrEmailConfig,
  type CjenikHrRequestData,
} from "../../../lib/cjenik-hr-request";

export const runtime = "nodejs";

function getEmailConfig(): CjenikHrEmailConfig {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !toEmail || !fromEmail) throw new Error("Missing contact email environment variables.");
  return { apiKey, toEmail, fromEmail };
}

export async function POST(request: Request) {
  let data: Partial<CjenikHrRequestData>;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neispravan zahtjev." }, { status: 400 });
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return NextResponse.json({ ok: false, error: "Neispravan zahtjev." }, { status: 400 });
  }
  if (isCjenikHrHoneypotSubmission(data)) return NextResponse.json({ ok: true });

  const validation = validateCjenikHrRequest(data);
  if (!validation.valid) {
    return NextResponse.json(
      { ok: false, error: "Provjerite označena polja i pokušajte ponovno.", fields: validation.errors },
      { status: 400 },
    );
  }

  try {
    const providerMessageId = await sendCjenikHrEmail(prepareCjenikHrRequest(data), getEmailConfig());
    if (providerMessageId) console.info("Cjenik HR provider message ID:", providerMessageId);
  } catch {
    console.error("Cjenik HR email failed");
    return NextResponse.json(
      { ok: false, error: "Upit trenutačno nije moguće poslati. Pokušajte ponovno za nekoliko trenutaka." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
