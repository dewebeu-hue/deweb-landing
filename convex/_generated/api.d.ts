/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as crons from "../crons.js";
import type * as deliveries from "../deliveries.js";
import type * as deliveryTokens from "../deliveryTokens.js";
import type * as emails from "../emails.js";
import type * as invoices from "../invoices.js";
import type * as model from "../model.js";
import type * as notoSansLatinExt from "../notoSansLatinExt.js";
import type * as orders from "../orders.js";
import type * as payments from "../payments.js";
import type * as quoteRecords from "../quoteRecords.js";
import type * as quotes from "../quotes.js";
import type * as stripePayments from "../stripePayments.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  deliveries: typeof deliveries;
  deliveryTokens: typeof deliveryTokens;
  emails: typeof emails;
  invoices: typeof invoices;
  model: typeof model;
  notoSansLatinExt: typeof notoSansLatinExt;
  orders: typeof orders;
  payments: typeof payments;
  quoteRecords: typeof quoteRecords;
  quotes: typeof quotes;
  stripePayments: typeof stripePayments;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
