import { ConvexError, v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { BACKEND_RELEASE_GATES, requireBridgeSecret, transitionOrder, validateHash } from "./model";

const RELEASE = {
  pluginVersion: "1.0.0",
  schemaVersion: 7,
  checkpoint: "194783813ee3ae647939ddf5d093b9baffdcec15",
  sha256: "8ae3b6ad3834a5bb2bb5c7defb3c63477f5788936e66bdfd1d735a9a267a0898",
} as const;

function deliveryAllowed() {
  if (process.env.CJENIK_HR_DELIVERY_MODE === "sandbox" && process.env.CJENIK_HR_DELIVERY_SANDBOX_ENABLED === "true") return true;
  return BACKEND_RELEASE_GATES.commercialTermsConfirmed &&
    BACKEND_RELEASE_GATES.billingPolicyConfirmed &&
    BACKEND_RELEASE_GATES.deliveryEnabled;
}

export const createArtifactUploadUrl = mutation({
  args: { bridgeSecret: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret);
    if (process.env.CJENIK_HR_DELIVERY_MODE !== "sandbox") throw new ConvexError({ code: "ARTIFACT_UPLOAD_DISABLED" });
    return await ctx.storage.generateUploadUrl();
  },
});

export const registerArtifact = mutation({
  args: {
    bridgeSecret: v.string(), storageId: v.id("_storage"),
    packageType: v.union(v.literal("plugin"), v.literal("setup")),
    pluginVersion: v.string(), schemaVersion: v.number(), checkpoint: v.string(), sha256: v.string(), sizeBytes: v.number(),
  },
  returns: v.id("deliveryArtifacts"),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret);
    validateHash(args.sha256, "sha256");
    if (!Number.isInteger(args.sizeBytes) || args.sizeBytes < 1) throw new ConvexError({ code: "INVALID_ARTIFACT_SIZE" });
    if (args.pluginVersion !== RELEASE.pluginVersion || args.schemaVersion !== RELEASE.schemaVersion ||
        args.checkpoint !== RELEASE.checkpoint || args.sha256.toLowerCase() !== RELEASE.sha256) {
      throw new ConvexError({ code: "ARTIFACT_METADATA_MISMATCH" });
    }
    const existing = await ctx.db.query("deliveryArtifacts").withIndex("by_sha256", (q) => q.eq("sha256", RELEASE.sha256)).take(10);
    const samePackage = existing.find((item) => item.packageType === args.packageType);
    if (samePackage) return samePackage._id;
    const prior = await ctx.db.query("deliveryArtifacts")
      .withIndex("by_package_active", (q) => q.eq("packageType", args.packageType).eq("active", true)).take(20);
    for (const artifact of prior) await ctx.db.patch(artifact._id, { active: false });
    return await ctx.db.insert("deliveryArtifacts", {
      packageType: args.packageType, pluginVersion: RELEASE.pluginVersion,
      schemaVersion: RELEASE.schemaVersion, checkpoint: RELEASE.checkpoint,
      sha256: RELEASE.sha256, sizeBytes: args.sizeBytes,
      storageId: args.storageId, active: true, createdAt: Date.now(),
    });
  },
});

async function issueDeliveryRecord(ctx: MutationCtx, args: {
  orderId: Id<"orders">; tokenHash: string; expiresAt: number; maxDownloads: number;
}) {
  if (!deliveryAllowed()) throw new ConvexError({ code: "DELIVERY_DISABLED" });
  validateHash(args.tokenHash, "tokenHash");
  if (!Number.isInteger(args.maxDownloads) || args.maxDownloads < 1 || args.maxDownloads > 5 ||
      args.expiresAt <= Date.now() || args.expiresAt > Date.now() + 30 * 24 * 60 * 60_000) {
    throw new ConvexError({ code: "INVALID_DELIVERY_POLICY" });
  }
  const order = await ctx.db.get(args.orderId);
  if (!order) throw new ConvexError({ code: "ORDER_NOT_FOUND" });
  if (order.status !== "invoice_sent" && order.status !== "delivery_ready") {
    throw new ConvexError({ code: "ORDER_NOT_DELIVERY_READY" });
  }
  const artifact = await ctx.db.query("deliveryArtifacts")
    .withIndex("by_package_active", (q) => q.eq("packageType", order.packageType).eq("active", true)).unique();
  if (!artifact) throw new ConvexError({ code: "DELIVERY_ARTIFACT_MISSING" });
  const existingToken = await ctx.db.query("deliveries")
    .withIndex("by_token_hash", (q) => q.eq("tokenHash", args.tokenHash.toLowerCase())).unique();
  if (existingToken) {
    if (existingToken.orderId !== args.orderId) throw new ConvexError({ code: "DELIVERY_TOKEN_COLLISION" });
    return existingToken._id;
  }
  if (order.status === "invoice_sent") {
    await transitionOrder(ctx, args.orderId, "delivery_ready", "delivery_workflow", "secure_delivery_issued");
  }
  return await ctx.db.insert("deliveries", {
    orderId: args.orderId, artifactId: artifact._id, tokenHash: args.tokenHash.toLowerCase(),
    expiresAt: args.expiresAt, maxDownloads: args.maxDownloads, downloadCount: 0, createdAt: Date.now(),
  });
}

export const issueDeliveryInternal = internalMutation({
  args: { orderId: v.id("orders"), tokenHash: v.string(), expiresAt: v.number(), maxDownloads: v.number() },
  returns: v.id("deliveries"),
  handler: async (ctx, args) => await issueDeliveryRecord(ctx, args),
});

export const consumeDelivery = mutation({
  args: { bridgeSecret: v.string(), tokenHash: v.string(), orderNumber: v.string() },
  returns: v.object({ storageUrl: v.string(), filename: v.string(), sha256: v.string(), remainingDownloads: v.number() }),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret);
    if (!deliveryAllowed()) throw new ConvexError({ code: "DELIVERY_DISABLED" });
    validateHash(args.tokenHash, "tokenHash");
    const delivery = await ctx.db.query("deliveries")
      .withIndex("by_token_hash", (q) => q.eq("tokenHash", args.tokenHash.toLowerCase())).unique();
    if (!delivery) throw new ConvexError({ code: "DELIVERY_NOT_FOUND" });
    const now = Date.now();
    if (delivery.revokedAt || delivery.expiresAt <= now || delivery.downloadCount >= delivery.maxDownloads) {
      throw new ConvexError({ code: "DELIVERY_TOKEN_UNAVAILABLE" });
    }
    const [order, artifact] = await Promise.all([ctx.db.get(delivery.orderId), ctx.db.get(delivery.artifactId)]);
    if (!order || !artifact || !artifact.active || order.orderNumber !== args.orderNumber) {
      throw new ConvexError({ code: "DELIVERY_BINDING_MISMATCH" });
    }
    const storageUrl = await ctx.storage.getUrl(artifact.storageId);
    if (!storageUrl) throw new ConvexError({ code: "DELIVERY_FILE_MISSING" });
    const downloadCount = delivery.downloadCount + 1;
    await ctx.db.patch(delivery._id, { downloadCount, lastDownloadedAt: now });
    if (order.packageType === "plugin" && order.status === "delivery_ready") {
      await transitionOrder(ctx, order._id, "completed", "delivery_workflow", "plugin_download_consumed");
    } else if (order.packageType === "setup" && order.status === "delivery_ready") {
      await transitionOrder(ctx, order._id, "setup_pending", "delivery_workflow", "plugin_downloaded_setup_pending");
    }
    return {
      storageUrl, filename: `cjenik-hr-${artifact.pluginVersion}.zip`, sha256: artifact.sha256,
      remainingDownloads: delivery.maxDownloads - downloadCount,
    };
  },
});

export const revokeDelivery = mutation({
  args: { bridgeSecret: v.string(), deliveryId: v.id("deliveries"), actor: v.string(), reason: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret);
    if (!args.actor.trim() || !args.reason.trim()) throw new ConvexError({ code: "AUDIT_FIELDS_REQUIRED" });
    const delivery = await ctx.db.get(args.deliveryId);
    if (!delivery) throw new ConvexError({ code: "DELIVERY_NOT_FOUND" });
    await ctx.db.patch(args.deliveryId, { revokedAt: Date.now() });
    await ctx.db.insert("orderEvents", {
      orderId: delivery.orderId, nextStatus: "delivery_ready", actor: args.actor,
      reason: `delivery_revoked:${args.reason}`, createdAt: Date.now(),
    });
    return null;
  },
});
