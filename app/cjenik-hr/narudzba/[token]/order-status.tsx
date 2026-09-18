"use client";

import { useCallback, useEffect, useState } from "react";

type PublicOrder = {
  orderNumber: string;
  status: string;
  packageType: "plugin" | "setup";
  updatedAt: number;
};

const confirmed = new Set([
  "payment_verified", "invoice_pending", "invoice_review_required", "invoice_processing",
  "invoice_fiscalized", "invoice_sent", "delivery_ready", "setup_pending", "completed",
]);

export function OrderStatus({ token, returnState }: { token: string; returnState?: string }) {
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const response = await fetch(`/api/cjenik-hr/status/${encodeURIComponent(token)}`, { cache: "no-store" });
    const result: { ok?: boolean; order?: PublicOrder } = await response.json().catch(() => ({}));
    if (response.ok && result.order) setOrder(result.order);
    else setError("Status narudžbe trenutačno nije dostupan.");
    setLoading(false);
  }, [token]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 3000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  async function retry() {
    setRetrying(true); setError("");
    try {
      const response = await fetch("/api/cjenik-hr/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicOrderToken: token }),
      });
      const result: { ok?: boolean; checkoutUrl?: string; error?: string } = await response.json().catch(() => ({}));
      if (!response.ok || !result.checkoutUrl) throw new Error(result.error ?? "Plaćanje nije dostupno.");
      window.location.assign(result.checkoutUrl);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Plaćanje nije dostupno.");
      setRetrying(false);
    }
  }

  const isConfirmed = order ? confirmed.has(order.status) : false;
  const awaiting = order?.status === "awaiting_payment";
  return (
    <div className="mt-8 rounded-2xl border border-line bg-white p-6 shadow-[0_18px_50px_rgba(8,42,61,0.08)] sm:p-8" aria-live="polite">
      {loading ? <p className="font-bold text-muted">Provjeravamo status plaćanja…</p> : isConfirmed ? <>
        <p className="text-xs font-black uppercase tracking-widest text-teal-dark">Plaćanje potvrđeno</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-ink">Plaćanje je potvrđeno. Račun se priprema.</h1>
        <p className="mt-4 leading-7 text-muted">Narudžba {order?.orderNumber}. Račun još nije izdan; obrada računa vodi se zasebno.</p>
      </> : <>
        <p className="text-xs font-black uppercase tracking-widest text-orange-dark">{returnState === "cancelled" ? "Plaćanje prekinuto" : "Provjera plaćanja"}</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-ink">{returnState === "cancelled" ? "Plaćanje nije dovršeno." : "Plaćanje se provjerava."}</h1>
        <p className="mt-4 leading-7 text-muted">Povratak sa Stripea nije potvrda uplate. Status će se osvježiti nakon sigurnog webhook zapisa.</p>
        {awaiting && <button type="button" onClick={retry} disabled={retrying} className="mt-6 inline-flex min-h-[50px] items-center justify-center rounded-lg bg-teal px-6 text-sm font-black text-white hover:bg-teal-dark disabled:opacity-70">{retrying ? "Otvaramo…" : "Ponovno pokušaj plaćanje"}</button>}
      </>}
      {error && <p className="mt-4 rounded-lg bg-[#fff5ec] px-4 py-3 text-sm font-bold text-[#7d340f]" role="alert">{error}</p>}
    </div>
  );
}
