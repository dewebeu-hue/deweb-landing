export const cjenikHrOrderStatuses = [
  "lead", "quote_pending", "quote_created", "quote_sent", "awaiting_payment",
  "payment_detected", "payment_review_required", "payment_verified", "invoice_pending",
  "invoice_review_required", "invoice_processing", "invoice_fiscalized", "invoice_failed",
  "invoice_sent", "delivery_ready", "setup_pending", "completed", "refund_pending",
  "refunded", "expired", "cancelled", "failed",
] as const;

export type CjenikHrOrderStatus = (typeof cjenikHrOrderStatuses)[number];

const transitions: Record<CjenikHrOrderStatus, ReadonlySet<CjenikHrOrderStatus>> = {
  lead: new Set(["quote_pending", "cancelled", "failed"]),
  quote_pending: new Set(["quote_created", "failed", "cancelled"]),
  quote_created: new Set(["quote_sent", "failed", "cancelled"]),
  quote_sent: new Set(["awaiting_payment", "failed", "cancelled"]),
  awaiting_payment: new Set(["payment_detected", "payment_review_required", "expired", "cancelled"]),
  payment_detected: new Set(["payment_verified", "payment_review_required"]),
  payment_review_required: new Set(["payment_verified", "cancelled", "refund_pending"]),
  payment_verified: new Set(["invoice_pending", "invoice_review_required", "refund_pending"]),
  invoice_pending: new Set(["invoice_processing", "invoice_review_required", "invoice_failed"]),
  invoice_review_required: new Set(["invoice_pending", "invoice_processing", "refund_pending", "cancelled"]),
  invoice_processing: new Set(["invoice_fiscalized", "invoice_failed", "invoice_review_required"]),
  invoice_fiscalized: new Set(["invoice_sent", "invoice_review_required"]),
  invoice_failed: new Set(["invoice_pending", "invoice_review_required", "refund_pending"]),
  invoice_sent: new Set(["delivery_ready", "setup_pending", "completed"]),
  delivery_ready: new Set(["setup_pending", "completed", "refund_pending"]),
  setup_pending: new Set(["completed", "refund_pending", "failed"]),
  completed: new Set(["refund_pending"]),
  refund_pending: new Set(["refunded", "completed"]),
  refunded: new Set(),
  expired: new Set(["payment_review_required", "cancelled"]),
  cancelled: new Set(),
  failed: new Set(["quote_pending", "invoice_review_required", "cancelled"]),
};

export function canTransitionCjenikHrOrder(from: CjenikHrOrderStatus, to: CjenikHrOrderStatus) {
  return transitions[from].has(to);
}
