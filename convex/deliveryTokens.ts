"use node";

import { createHash, randomBytes } from "node:crypto";
import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { requireBridgeSecret } from "./model";

async function issueToken(
  ctx: ActionCtx,
  args: { orderId: Id<"orders">; expiresAt: number; maxDownloads: number },
): Promise<{ token: string; deliveryId: Id<"deliveries"> }> {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token, "utf8").digest("hex");
  const deliveryId: Id<"deliveries"> = await ctx.runMutation(internal.deliveries.issueDeliveryInternal, {
    ...args, tokenHash,
  });
  return { token, deliveryId };
}

export const createDeliveryToken = internalAction({
  args: { orderId: v.id("orders"), expiresAt: v.number(), maxDownloads: v.number() },
  returns: v.object({ token: v.string(), deliveryId: v.id("deliveries") }),
  handler: async (ctx: ActionCtx, args): Promise<{ token: string; deliveryId: Id<"deliveries"> }> => {
    return await issueToken(ctx, args);
  },
});

export const createDeliveryTokenForBridge = action({
  args: {
    bridgeSecret: v.string(), orderId: v.id("orders"), expiresAt: v.number(), maxDownloads: v.number(),
  },
  returns: v.object({ token: v.string(), deliveryId: v.id("deliveries") }),
  handler: async (ctx: ActionCtx, args): Promise<{ token: string; deliveryId: Id<"deliveries"> }> => {
    requireBridgeSecret(args.bridgeSecret);
    const { bridgeSecret: _, ...delivery } = args;
    return await issueToken(ctx, delivery);
  },
});
