"use node";

import { createHash } from "node:crypto";
import fontkit from "@pdf-lib/fontkit";
import bwipjs from "bwip-js";
import { PDFDocument, rgb } from "pdf-lib";
import { ConvexError, v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { BACKEND_RELEASE_GATES, requireBridgeSecret } from "./model";
import { notoSansLatinExtWoffBase64 } from "./notoSansLatinExt";

type PaymentCodeInput = {
  amountCents: number;
  payerName: string;
  payerAddress: string;
  payerCity: string;
  receiverName: string;
  receiverAddress: string;
  receiverCity: string;
  iban: string;
  model: string;
  reference: string;
  purposeCode: string;
  description: string;
};

async function paymentCodePng(input: PaymentCodeInput) {
  const mode = process.env.CJENIK_HR_PAYMENT_CODE_PROVIDER ?? "disabled";
  if (mode === "live") {
    // Intentionally fail-closed: the official ePoslovanje API v2 payment-code
    // request/response contract has not been confirmed for this release.
    throw new ConvexError({ code: "PAYMENT_CODE_LIVE_CONTRACT_UNCONFIRMED" });
  }
  if (mode !== "mock" || process.env.CJENIK_HR_PAYMENT_CODE_SANDBOX_ENABLED !== "true") return null;
  const amount = String(input.amountCents).padStart(15, "0");
  const hub3 = [
    "HRVHUB30", "EUR", amount, input.payerName, input.payerAddress, input.payerCity,
    input.receiverName, input.receiverAddress, input.receiverCity, input.iban,
    input.model, input.reference, input.purposeCode, input.description,
  ].join("\n");
  return bwipjs.toBuffer({ bcid: "pdf417", text: hub3, scale: 2, height: 12, includetext: false });
}

function requireSandboxConfig() {
  if (process.env.CJENIK_HR_BILLING_MODE !== "sandbox") {
    if (!BACKEND_RELEASE_GATES.commercialTermsConfirmed ||
        !BACKEND_RELEASE_GATES.billingPolicyConfirmed ||
        !BACKEND_RELEASE_GATES.eposlovanjeProductionEnabled) {
      throw new ConvexError({ code: "PRODUCTION_BILLING_DISABLED" });
    }
    throw new ConvexError({ code: "LIVE_QUOTE_ADAPTER_NOT_IMPLEMENTED" });
  }
  if (process.env.CJENIK_HR_PAYMENT_IBAN_IS_TEST !== "true") {
    throw new ConvexError({ code: "SANDBOX_PAYMENT_IBAN_NOT_CONFIRMED_TEST" });
  }
  const config = {
    sellerName: process.env.CJENIK_HR_SELLER_NAME,
    sellerAddress: process.env.CJENIK_HR_SELLER_ADDRESS,
    sellerCity: process.env.CJENIK_HR_SELLER_CITY,
    sellerOib: process.env.CJENIK_HR_SELLER_OIB,
    iban: process.env.CJENIK_HR_PAYMENT_IBAN,
    paymentModel: process.env.CJENIK_HR_PAYMENT_MODEL,
    purposeCode: process.env.CJENIK_HR_PAYMENT_PURPOSE_CODE,
    sellerTaxText: process.env.CJENIK_HR_SELLER_TAX_TEXT,
  };
  const missing = Object.entries(config).filter(([, value]) => !value?.trim()).map(([key]) => key);
  if (missing.length) throw new ConvexError({ code: "QUOTE_CONFIG_MISSING", fields: missing });
  return config as Record<keyof typeof config, string>;
}

function loadNotoSans() {
  return Buffer.from(notoSansLatinExtWoffBase64, "base64");
}

type QuoteResult = { quoteNumber: string; sha256: string; testDocument: true };

async function sendResendEmail(
  ctx: ActionCtx,
  input: {
    orderId: Id<"orders">; kind: "quote_customer" | "quote_internal";
    recipientClass: "customer" | "internal"; idempotencyKey: string;
    to: string; subject: string; html: string; attachment?: { filename: string; content: string };
  },
) {
  const claim = await ctx.runMutation(internal.emails.claimEmailSendInternal, {
    orderId: input.orderId, kind: input.kind, recipientClass: input.recipientClass,
    idempotencyKey: input.idempotencyKey,
  }) as { emailEventId: Id<"emailEvents">; shouldSend: boolean; status: string };
  if (!claim.shouldSend) return { sent: claim.status === "sent", providerMessageId: "already-sent" };
  if (process.env.CJENIK_HR_QUOTE_EMAIL_MODE === "mock" &&
      process.env.CJENIK_HR_QUOTE_EMAIL_SANDBOX_ENABLED === "true") {
    const providerMessageId = `mock:${input.idempotencyKey}`;
    await ctx.runMutation(internal.emails.completeEmailSendInternal, {
      emailEventId: claim.emailEventId, succeeded: true, providerMessageId,
    });
    return { sent: true, providerMessageId };
  }
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !from || process.env.CJENIK_HR_QUOTE_EMAIL_ENABLED !== "true") {
    await ctx.runMutation(internal.emails.completeEmailSendInternal, {
      emailEventId: claim.emailEventId, succeeded: false, errorCode: "QUOTE_EMAIL_CONFIG_MISSING",
    });
    return { sent: false, providerMessageId: "" };
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": input.idempotencyKey,
      },
      body: JSON.stringify({
        from, to: [input.to], subject: input.subject, html: input.html,
        ...(input.attachment ? { attachments: [input.attachment] } : {}),
      }),
    });
    if (!response.ok) throw new Error(`resend_${response.status}`);
    const data = await response.json() as { id?: string };
    const providerMessageId = data.id ?? "resend-accepted";
    await ctx.runMutation(internal.emails.completeEmailSendInternal, {
      emailEventId: claim.emailEventId, succeeded: true, providerMessageId,
    });
    return { sent: true, providerMessageId };
  } catch {
    await ctx.runMutation(internal.emails.completeEmailSendInternal, {
      emailEventId: claim.emailEventId, succeeded: false, errorCode: "RESEND_DELIVERY_FAILED",
    });
    return { sent: false, providerMessageId: "" };
  }
}

async function runQuoteWorkflow(ctx: ActionCtx, orderId: Id<"orders">): Promise<QuoteResult> {
    const config = requireSandboxConfig();
    const order = await ctx.runQuery(internal.quoteRecords.getOrderForQuote, { orderId });
    if (!order) throw new ConvexError({ code: "ORDER_NOT_FOUND" });
    const quote = await ctx.runMutation(internal.quoteRecords.reserveQuote, {
      orderId, testDocument: true,
    });
    try {
      const pdf = await PDFDocument.create();
      pdf.registerFontkit(fontkit);
      const font = await pdf.embedFont(loadNotoSans(), { subset: true });
      const page = pdf.addPage([595.28, 841.89]);
      const draw = (text: string, x: number, y: number, size = 10, color = rgb(0.1, 0.12, 0.16)) =>
        page.drawText(text, { x, y, size, font, color });
      draw("TEST / NIJE ZA PLAĆANJE", 42, 790, 14, rgb(0.72, 0.08, 0.08));
      draw("PONUDA", 42, 748, 24);
      draw(`Broj ponude: ${quote.quoteNumber}`, 42, 720);
      draw(`Narudžba: ${order.orderNumber}`, 42, 702);
      draw(`Vrijedi do: ${new Date(order.quoteExpiresAt).toLocaleDateString("hr-HR", { timeZone: "UTC" })}`, 42, 684);
      draw("Izdavatelj", 42, 646, 12);
      draw(config.sellerName, 42, 626);
      draw(config.sellerAddress, 42, 610);
      draw(config.sellerCity, 42, 594);
      draw(`OIB: ${config.sellerOib}`, 42, 578);
      draw("Kupac", 320, 646, 12);
      draw(order.customer.companyName ?? order.customer.fullName, 320, 626);
      draw(order.customer.billingAddress, 320, 610);
      draw(`${order.customer.postalCode} ${order.customer.city}`, 320, 594);
      if (order.customer.companyOib) draw(`OIB: ${order.customer.companyOib}`, 320, 578);
      draw("Paket", 42, 522, 11);
      draw(order.packageType === "plugin" ? "Cjenik HR — plugin" : "Cjenik HR — plugin i postavljanje", 42, 500);
      draw(`Iznos: ${(order.amountCents / 100).toFixed(2).replace(".", ",")} €`, 390, 500, 12);
      draw(config.sellerTaxText, 42, 474, 9);
      draw("Podaci za uplatu (testno okruženje)", 42, 420, 12);
      draw(`IBAN: ${config.iban}`, 42, 398);
      draw(`Model: ${config.paymentModel}`, 42, 382);
      draw(`Poziv na broj: ${order.paymentReference}`, 42, 366);
      draw("Ponuda nije račun.", 42, 96, 11);
      draw("Dokument je generiran u testnom okruženju i nije za plaćanje.", 42, 76, 9, rgb(0.72, 0.08, 0.08));

      const barcode = await paymentCodePng({
        amountCents: order.amountCents,
        payerName: order.customer.companyName ?? order.customer.fullName,
        payerAddress: order.customer.billingAddress,
        payerCity: `${order.customer.postalCode} ${order.customer.city}`,
        receiverName: config.sellerName,
        receiverAddress: config.sellerAddress,
        receiverCity: config.sellerCity,
        iban: config.iban,
        model: config.paymentModel,
        reference: order.paymentReference,
        purposeCode: config.purposeCode,
        description: `TEST ${order.orderNumber}`,
      });
      if (barcode) {
        const image = await pdf.embedPng(barcode);
        page.drawImage(image, { x: 300, y: 300, width: 245, height: 84 });
        draw("TESTNI PDF417", 300, 286, 8, rgb(0.72, 0.08, 0.08));
      }
      pdf.setTitle(`TEST ponuda ${quote.quoteNumber}`);
      pdf.setCreator("Deweb Cjenik HR sandbox");
      const bytes = await pdf.save({ useObjectStreams: false });
      const sha256 = createHash("sha256").update(bytes).digest("hex");
      const byteBuffer = Uint8Array.from(bytes).buffer;
      const storageId = await ctx.storage.store(new Blob([byteBuffer], { type: "application/pdf" }));
      await ctx.runMutation(internal.quoteRecords.attachQuotePdf, {
        quoteId: quote.quoteId, storageId, documentSha256: sha256,
      });
      const attachment = {
        filename: `TEST-ponuda-${quote.quoteNumber}.pdf`,
        content: Buffer.from(bytes).toString("base64"),
      };
      const customerMail = await sendResendEmail(ctx, {
        orderId, kind: "quote_customer", recipientClass: "customer",
        idempotencyKey: `quote-customer:${quote.quoteNumber}`,
        to: order.customer.email,
        subject: `TEST ponuda ${quote.quoteNumber} — Cjenik HR`,
        html: `<p><strong>TEST / NIJE ZA PLAĆANJE</strong></p><p>U privitku je ponuda ${quote.quoteNumber}.</p><p>Ponuda nije račun.</p>`,
        attachment,
      });
      const internalRecipient = process.env.CJENIK_HR_INTERNAL_EMAIL ?? process.env.CONTACT_TO_EMAIL;
      if (internalRecipient) {
        await sendResendEmail(ctx, {
          orderId, kind: "quote_internal", recipientClass: "internal",
          idempotencyKey: `quote-internal:${quote.quoteNumber}`,
          to: internalRecipient,
          subject: `Nova TEST ponuda ${quote.quoteNumber}`,
          html: `<p>TEST ponuda ${quote.quoteNumber}</p><p>Paket: ${order.packageType}</p><p>Iznos: ${(order.amountCents / 100).toFixed(2)} EUR</p>`,
        });
      }
      if (customerMail.sent) {
        await ctx.runMutation(internal.quoteRecords.markQuoteSentInternal, {
          orderId, providerMessageId: customerMail.providerMessageId,
        });
      }
      return { quoteNumber: quote.quoteNumber, sha256, testDocument: true };
    } catch (error) {
      await ctx.runMutation(internal.quoteRecords.failQuote, {
        quoteId: quote.quoteId,
        errorCode: error instanceof ConvexError ? "QUOTE_GENERATION_REJECTED" : "QUOTE_GENERATION_FAILED",
      });
      throw error;
    }
}

export const generateQuotePdfInternal = internalAction({
  args: { orderId: v.id("orders") },
  returns: v.object({ quoteNumber: v.string(), sha256: v.string(), testDocument: v.boolean() }),
  handler: async (ctx, args) => await runQuoteWorkflow(ctx, args.orderId),
});

export const generateQuotePdf = action({
  args: { bridgeSecret: v.string(), orderId: v.id("orders") },
  returns: v.object({ quoteNumber: v.string(), sha256: v.string(), testDocument: v.boolean() }),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret);
    return await runQuoteWorkflow(ctx, args.orderId);
  },
});
