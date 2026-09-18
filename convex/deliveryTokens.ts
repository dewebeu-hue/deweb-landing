"use node";

import { createHash, randomBytes } from "node:crypto";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const createDeliveryToken = internalAction({
  args: { orderId: v.id("orders"), expiresAt: v.number(), maxDownloads: v.number() },
  returns: v.object({ token: v.string(), deliveryId: v.id("deliveries") }),
  handler: async (ctx, args) => {
    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token, "utf8").digest("hex");
    const deliveryId = await ctx.runMutation(internal.deliveries.issueDeliveryInternal, {
      ...args, tokenHash,
    });
    return { token, deliveryId };
  },
});
