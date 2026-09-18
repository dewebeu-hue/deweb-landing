import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import {
  canTransitionCjenikHrOrder,
  cjenikHrOrderStatuses,
  type CjenikHrOrderStatus,
} from "../lib/cjenik-hr-state-machine";

export const ORDER_STATUSES = cjenikHrOrderStatuses;
export type OrderStatus = CjenikHrOrderStatus;

export const orderStatusValidator = v.union(
  ...ORDER_STATUSES.map((status) => v.literal(status)) as [
    ReturnType<typeof v.literal>, ReturnType<typeof v.literal>, ...ReturnType<typeof v.literal>[],
  ],
);

export const customerInputValidator = v.object({
  type: v.union(v.literal("business"), v.literal("consumer")),
  fullName: v.string(),
  companyName: v.optional(v.string()),
  companyOib: v.optional(v.string()),
  contactPerson: v.optional(v.string()),
  email: v.string(),
  billingAddress: v.string(),
  postalCode: v.string(),
  city: v.string(),
  country: v.string(),
});

export type CustomerInput = {
  type: "business" | "consumer";
  fullName: string;
  companyName?: string;
  companyOib?: string;
  contactPerson?: string;
  email: string;
  billingAddress: string;
  postalCode: string;
  city: string;
  country: string;
};

export const PACKAGE_PRICES_CENTS = { plugin: 3900, setup: 7900 } as const;

export const BACKEND_RELEASE_GATES = {
  commercialTermsConfirmed: false,
  billingPolicyConfirmed: false,
  eposlovanjeProductionEnabled: false,
  aisProductionEnabled: false,
  deliveryEnabled: false,
} as const;

export function requireBridgeSecret(provided: string) {
  const expected = process.env.CJENIK_HR_ORDER_ENGINE_BRIDGE_SECRET;
  if (!expected || expected.length < 24 || provided !== expected) {
    throw new ConvexError({ code: "UNAUTHORIZED_BRIDGE" });
  }
}

export function validateHash(value: string, name: string) {
  if (!/^[a-f0-9]{64}$/i.test(value)) {
    throw new ConvexError({ code: "INVALID_HASH", field: name });
  }
}

export function validateCustomer(input: CustomerInput) {
  if (input.country !== "HR") throw new ConvexError({ code: "COUNTRY_NOT_SUPPORTED" });
  if (!/^\S+@\S+\.\S+$/.test(input.email) || input.email.length > 254) {
    throw new ConvexError({ code: "INVALID_CUSTOMER", field: "email" });
  }
  for (const [field, value, max] of [
    ["fullName", input.fullName, 120], ["billingAddress", input.billingAddress, 160],
    ["postalCode", input.postalCode, 12], ["city", input.city, 80],
  ] as const) {
    if (!value.trim() || value.length > max) throw new ConvexError({ code: "INVALID_CUSTOMER", field });
  }
  if (input.type === "business") {
    if (!input.companyName?.trim() || !input.contactPerson?.trim() || !input.companyOib) {
      throw new ConvexError({ code: "INVALID_BUSINESS_CUSTOMER" });
    }
    if (!isValidOib(input.companyOib)) throw new ConvexError({ code: "INVALID_OIB" });
  }
}

export function isValidOib(oib: string) {
  if (!/^\d{11}$/.test(oib)) return false;
  let remainder = 10;
  for (let index = 0; index < 10; index += 1) {
    remainder = (remainder + Number(oib[index])) % 10;
    if (remainder === 0) remainder = 10;
    remainder = (remainder * 2) % 11;
  }
  const control = 11 - remainder;
  return Number(oib[10]) === (control === 10 ? 0 : control);
}

export async function transitionOrder(
  ctx: MutationCtx,
  orderId: Id<"orders">,
  nextStatus: OrderStatus,
  actor: string,
  reason: string,
  providerReference?: string,
) {
  const order = await ctx.db.get(orderId);
  if (!order) throw new ConvexError({ code: "ORDER_NOT_FOUND" });
  const previousStatus = order.status as OrderStatus;
  if (previousStatus === nextStatus) return order;
  if (!canTransitionCjenikHrOrder(previousStatus, nextStatus)) {
    throw new ConvexError({ code: "INVALID_ORDER_TRANSITION", previousStatus, nextStatus });
  }
  const now = Date.now();
  await ctx.db.patch(orderId, { status: nextStatus, updatedAt: now });
  await ctx.db.insert("orderEvents", {
    orderId, previousStatus, nextStatus, actor, reason,
    ...(providerReference ? { providerReference } : {}), createdAt: now,
  });
  return { ...order, status: nextStatus, updatedAt: now };
}

export async function nextSequence(ctx: MutationCtx, name: string) {
  const current = await ctx.db.query("sequences").withIndex("by_name", (q) => q.eq("name", name)).unique();
  const value = (current?.value ?? 0) + 1;
  const updatedAt = Date.now();
  if (current) await ctx.db.patch(current._id, { value, updatedAt });
  else await ctx.db.insert("sequences", { name, value, updatedAt });
  return value;
}

export function formatSequence(prefix: string, year: number, value: number) {
  return `${prefix}-${year}-${String(value).padStart(6, "0")}`;
}
