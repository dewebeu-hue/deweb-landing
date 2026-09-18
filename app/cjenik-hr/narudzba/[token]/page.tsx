import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "../../../site-footer";
import { OrderStatus } from "./order-status";

export const metadata: Metadata = { title: "Status narudžbe Cjenik HR | deweb", robots: { index: false, follow: false } };

export default async function CjenikHrOrderPage({
  params, searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ stripe?: string }>;
}) {
  const [{ token }, query] = await Promise.all([params, searchParams]);
  return <>
    <main className="min-h-[72vh] bg-[#f5f9fa] px-5 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/cjenik-hr" className="text-sm font-black text-teal-dark underline underline-offset-4">← Cjenik HR</Link>
        <OrderStatus token={token} returnState={query.stripe} />
        <p className="mt-5 text-sm leading-6 text-muted">Kartične podatke obrađuje Stripe. deweb ne prima niti sprema puni broj kartice ili CVC.</p>
      </div>
    </main>
    <SiteFooter />
  </>;
}
