import Image from "next/image";
import type { Metadata } from "next";
import { SiteFooter } from "../site-footer";
import { CjenikHrRequestForm } from "./cjenik-hr-request-form";
import { cjenikHrProduct, formatCjenikHrPrice } from "../../lib/cjenik-hr-product";
import { deploymentRobots, SITE_ORIGIN } from "../../lib/seo-policy";

const title = "Cjenik HR za WordPress | Sidrena cijena i CSV cjenik | deweb";
const description = "Cjenik HR je WordPress dodatak za sidrene cijene, dnevni CSV cjenik, javnu objavu, naljepnice i WooCommerce. Dostupan samostalno ili uz deweb postavljanje.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_ORIGIN}/cjenik-hr` },
  robots: deploymentRobots(process.env.VERCEL_ENV),
  openGraph: {
    title,
    description,
    url: `${SITE_ORIGIN}/cjenik-hr`,
    siteName: "deweb",
    images: [{ url: "/og-deweb.png", width: 1200, height: 630, alt: "Cjenik HR — WordPress dodatak tvrtke deweb" }],
    locale: "hr_HR",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

const frame = "mx-auto w-[min(100%-36px,1160px)]";
const eyebrow = "text-xs font-black uppercase tracking-[0.16em] text-teal-dark";
const heading = "text-[2rem] font-black leading-[1.12] tracking-[-0.035em] text-ink sm:text-[2.65rem] lg:text-[3.1rem]";
const button = "inline-flex min-h-[52px] items-center justify-center rounded-lg bg-teal px-6 py-3 text-center text-sm font-extrabold text-white shadow-[0_12px_25px_rgba(0,77,88,0.17)] transition hover:bg-teal-dark focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-3 focus-visible:outline-orange-dark";

const capabilities = [
  ["Sidrene cijene", "Evidencija, potvrda i povijest korekcija bez tihog prepisivanja."],
  ["Javni CSV", "Verzionirane objave, aktualni pokazivač i čuvanje najmanje 35 dana."],
  ["Naljepnice", "A4 PDF s djelomično iskorištenim arkom i provjerom prije ispisa."],
  ["WooCommerce", "Jednostavni proizvodi i javne varijacije s vlastitim sidrima."],
] as const;

const useCases = [
  ["Trgovina s WordPress webom", "Vodite katalog i javni cjenik na webu, neovisno o tome koristite li WooCommerce."],
  ["WooCommerce trgovina", "Povežite aktualne cijene, dostupnost i sidrene cijene jednostavnih proizvoda i javnih varijacija."],
  ["Uvoz iz poslovnog sustava", "Uvezite generički CSV, XLSX ili podržani XLS izvoz nakon pregleda podataka."],
] as const;

const featureGroups = [
  {
    number: "01",
    title: "Od izvora do provjerenog kataloga",
    copy: "Uvoz prolazi kroz pregled prije potvrde. Puni katalog, djelomična izmjena, sidrene cijene i dokument za naljepnice imaju odvojene namjene.",
    points: ["CSV UTF-8 i CP1250", "XLSX i podržani binarni XLS", "Pregled i podudaranje stupaca", "Izvorno i vrijeme uvoza vode se odvojeno"],
  },
  {
    number: "02",
    title: "Sidrena cijena s tragom odluke",
    copy: "Sidro se potvrđuje kao poseban poslovni podatak. Izmjena stvara korekciju i ostavlja revizijski trag umjesto prepisivanja povijesti.",
    points: ["Potvrda prije uporabe", "Korekcije bez gubitka povijesti", "Upozorenja i blokatori", "Audit zapisi po prodajnom objektu"],
  },
  {
    number: "03",
    title: "Objava za ljude i automatizirano preuzimanje",
    copy: "Svaka potvrđena objava dobiva nepromjenjivu CSV datoteku. Javni indeks i REST sučelje daju aktualnu reviziju bez izlaganja privatnih uvoznih redaka.",
    points: ["Kanonski CSV s 11 stupaca", "Aktualna i povijesne objave", "Javni REST pod /wp-json/cjenik-hr/v1", "ETag i stabilno straničenje"],
  },
  {
    number: "04",
    title: "Operativni rad u WordPressu",
    copy: "Statusni pregled povezuje raspored, kvalitetu podataka, objavu i ispis. Sustav razlikuje PASS, WARNING, FAIL i NOT_TESTED kako upozorenje ne bi izgledalo kao dokaz.",
    points: ["Pokušaji objave od 06:00 do 07:30", "Čišćenje zadržanih objava u 08:15", "A4 naljepnice i djelomični arci", "Pregled prije generiranja PDF-a"],
  },
] as const;

const screenshots = [
  ["/cjenik-hr/import.png", "Uvoz i pregled", "Odaberite namjenu uvoza, prodajni objekt, kodiranje i izvor podataka prije pregleda.", 1264, 1105],
  ["/cjenik-hr/objave.png", "Kontrolirana javna objava", "Upozorenja i blokatori vidljivi su prije stvaranja nove, nepromjenjive verzije cjenika.", 1440, 1111],
  ["/cjenik-hr/naljepnice.png", "Naljepnice za prodajno mjesto", "Odabir artikala, količina, profila i zauzetih mjesta prethodi PDF-u za ispis.", 1440, 2707],
  ["/cjenik-hr/woocommerce.png", "WooCommerce prikaz", "Sidrena cijena prikazana je uz jednostavan proizvod; varijacije traže odabir prije prikaza pripadajuće cijene.", 1440, 1966],
] as const;

const faq = [
  ["Je li Cjenik HR gotov proizvod?", `Verzija ${cjenikHrProduct.pluginVersion} ima dovršenu jezgru i provjerene glavne tokove. Proizvod je trenutačno u predprodajnom statusu; prije isporuke provjeravamo vaš WordPress, izvor podataka i očekivani način rada.`],
  ["Moram li imati WooCommerce?", "Ne. Cjenik HR ima vlastiti katalog i bez WooCommercea. WooCommerce povezivanje je dodatna mogućnost za kompatibilne trgovine."],
  ["Povezuje li se izravno sa Synesisom?", "Ne. Podržan je generički uvoz iz CSV, XLSX i podržanog XLS izvoza. Kompatibilnost konkretnog Synesis izvoza provjerava se na uzorku, bez tvrdnje o izravnoj integraciji."],
  ["Hoće li plugin sam osigurati pravnu usklađenost?", "Ne. Plugin daje tehničke alate za evidenciju, objavu i ispis. Trgovac i dalje odgovara za točnost podataka, primjenjive obveze i konačnu pravnu procjenu."],
  ["Što uključuje postavljanje?", "Instalaciju plugina, početno podešavanje i provjeru osnovnog toka na postojećem kompatibilnom WordPressu. Migracija podataka, prilagodba izvoza ili razvoj za drugi sustav procjenjuju se zasebno."],
  ["Mogu li koristiti drugi sustav umjesto WordPressa?", "Da, pošaljite upit za drugi sustav. Najprije provjeravamo postojeći izvor podataka i mogućnost zasebnog rješenja; WordPress plugin se ne prodaje kao dodatak za nekompatibilnu platformu."],
] as const;

export default function CjenikHrPage() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className={`${frame} flex min-h-[72px] items-center justify-between gap-4`}>
          <a href="/" aria-label="deweb — početna stranica" className="inline-flex min-h-11 items-center focus-visible:outline focus-visible:outline-4 focus-visible:outline-orange-dark">
            <Image src="/deweb-logo.svg" alt="deweb" width={126} height={29} priority />
          </a>
          <nav aria-label="Navigacija Cjenik HR" className="hidden items-center gap-5 md:flex">
            <a href="#mogucnosti" className="inline-flex min-h-11 items-center text-sm font-bold text-ink hover:text-teal-dark">Mogućnosti</a>
            <a href="#kako-radi" className="inline-flex min-h-11 items-center text-sm font-bold text-ink hover:text-teal-dark">Kako radi</a>
            <a href="#cijene" className="inline-flex min-h-11 items-center text-sm font-bold text-ink hover:text-teal-dark">Cijene</a>
          </nav>
          <a href="#upit" className="inline-flex min-h-11 items-center rounded-lg bg-teal px-4 text-sm font-black text-white hover:bg-teal-dark focus-visible:outline focus-visible:outline-4 focus-visible:outline-orange-dark">Pošaljite upit</a>
        </div>
      </header>

      <main>
        <section className="hero-surface overflow-hidden border-b border-line" aria-labelledby="cjenik-hero-title">
          <div className={`${frame} grid gap-12 py-14 md:py-20 lg:min-h-[690px] lg:grid-cols-[1.03fr_0.97fr] lg:items-center`}>
            <div>
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-[#e8c6b4] bg-[#fff5ec] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#8c390f]">Predprodaja</span>
                <span className="text-xs font-bold text-muted">WordPress plugin · verzija {cjenikHrProduct.pluginVersion}</span>
              </div>
              <p className={`${eyebrow} mb-4`}>Cjenik HR</p>
              <h1 id="cjenik-hero-title" className="max-w-[720px] text-[clamp(2.35rem,5vw,4.55rem)] font-black leading-[1.02] tracking-[-0.055em] text-ink">
                Sidrena cijena i javni cjenik, <span className="text-teal-dark">u jednom WordPress toku.</span>
              </h1>
              <p className="mt-7 max-w-[680px] text-lg leading-8 text-[#536579] md:text-xl md:leading-9">Uvezite katalog, potvrdite sidrene cijene, objavite strojno čitljiv CSV i pripremite naljepnice. Cjenik HR povezuje operativne korake koji se inače vode u više datoteka.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href="#cijene" className={button}>Pogledajte cijene <span aria-hidden="true" className="ml-2">↓</span></a>
                <a href="#izvori" className="inline-flex min-h-[52px] items-center justify-center rounded-lg border-2 border-teal bg-white px-6 py-3 text-sm font-extrabold text-teal-dark hover:bg-teal-soft focus-visible:outline focus-visible:outline-4 focus-visible:outline-orange-dark">Provjerite regulatorni kontekst</a>
              </div>
              <p className="mt-5 text-sm font-semibold leading-6 text-muted">Za trgovce i pružatelje usluga u Hrvatskoj koji imaju WordPress web. Dostupnost se potvrđuje nakon provjere sustava.</p>
            </div>

            <div className="relative rounded-3xl border border-[#b9d4d8] bg-[#f7fbfb] p-4 shadow-[0_28px_70px_rgba(8,42,61,0.13)] sm:p-6" aria-label="Sažetak mogućnosti proizvoda">
              <div className="flex items-center justify-between rounded-2xl bg-ink px-5 py-4 text-white">
                <div><span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9ed9de]">Operativni pregled</span><p className="mt-1 font-black">Od uvoza do javne objave</p></div>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-teal text-lg font-black">✓</span>
              </div>
              <div className="my-3 grid grid-cols-4 gap-2" aria-hidden="true">
                {["Uvoz", "Provjera", "Objava", "Ispis"].map((item, index) => <div key={item} className="text-center"><span className={`mx-auto block h-2 w-2 rounded-full ${index === 3 ? "bg-orange" : "bg-teal"}`} /><span className="mt-2 block text-[10px] font-black uppercase tracking-wide text-muted">{item}</span></div>)}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {capabilities.map(([name, copy], index) => <div key={name} className="rounded-xl border border-line bg-white p-4"><div className="flex items-center justify-between"><span className="text-xs font-black text-teal-dark">0{index + 1}</span><span className="h-2 w-2 rounded-full bg-[#d3e7e9]" /></div><h2 className="mt-3 text-base font-black text-ink">{name}</h2><p className="mt-2 text-xs leading-5 text-muted">{copy}</p></div>)}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#ead6c9] bg-[#fff8f3] px-4 py-3 text-xs"><span className="font-black text-ink">Raspored pokušaja</span><span className="font-bold text-[#8c390f]">06:00 → 07:30</span></div>
            </div>
          </div>
        </section>

        <section id="izvori" className="border-b border-line bg-[#f5f9fa] py-14 md:py-18" aria-labelledby="reg-title">
          <div className={`${frame} grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-14`}>
            <div><p className={`${eyebrow} mb-3`}>Regulatorni kontekst</p><h2 id="reg-title" className={heading}>Dvije obveze, jedan operativni problem.</h2><p className="mt-5 leading-7 text-muted">Odluke su objavljene 11. rujna 2026. i stupaju na snagu 1. listopada 2026. Ovdje ih sažimamo radi razumijevanja proizvoda.</p></div>
            <div className="grid gap-4">
              <article className="rounded-2xl border border-line bg-white p-6"><span className="text-xs font-black uppercase tracking-widest text-teal-dark">NN 101/2026, br. 1212</span><h3 className="mt-3 text-xl font-black text-ink">Dodatna cijena uz maloprodajnu cijenu</h3><p className="mt-3 leading-7 text-muted">Odluka propisuje jasno isticanje dodatne cijene primjenjive 10. rujna 2026. Posebno navedene skupine koje su već bile obuhvaćene ranijom odlukom zadržavaju cijenu od 2. svibnja 2025.</p><a className="mt-4 inline-flex min-h-11 items-center font-black text-teal-dark underline underline-offset-4" href="https://narodne-novine.nn.hr/clanci/sluzbeni/2026_09_101_1212.html" target="_blank" rel="noreferrer">Otvorite službeni tekst <span aria-hidden="true" className="ml-2">↗</span></a></article>
              <article className="rounded-2xl border border-line bg-white p-6"><span className="text-xs font-black uppercase tracking-widest text-teal-dark">NN 101/2026, br. 1213</span><h3 className="mt-3 text-xl font-black text-ink">Javni, strojno čitljiv i ažuran cjenik</h3><p className="mt-3 leading-7 text-muted">Odluka traži XML ili CSV na mrežnoj stranici, ažuriranje do 8:00, dostupnost objava 30 dana i tehničko rješenje za automatizirano dohvaćanje cijena u stvarnom vremenu.</p><a className="mt-4 inline-flex min-h-11 items-center font-black text-teal-dark underline underline-offset-4" href="https://narodne-novine.nn.hr/clanci/sluzbeni/full/2026_09_101_1213.html" target="_blank" rel="noreferrer">Otvorite službeni tekst <span aria-hidden="true" className="ml-2">↗</span></a></article>
            </div>
          </div>
        </section>

        <section className={`${frame} py-16 md:py-20`} aria-labelledby="for-title">
          <p className={`${eyebrow} mb-3`}>Za koga je</p><h2 id="for-title" className={`${heading} max-w-3xl`}>Za postojeći WordPress i različite izvore podataka.</h2>
          <div className="mt-9 grid gap-4 md:grid-cols-3">{useCases.map(([title, copy], index) => <article key={title} className="rounded-2xl border border-line bg-white p-6 shadow-[0_14px_38px_rgba(8,42,61,0.06)]"><span className="text-sm font-black text-orange-dark">0{index + 1}</span><h3 className="mt-5 text-xl font-black text-ink">{title}</h3><p className="mt-3 leading-7 text-muted">{copy}</p></article>)}</div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <aside className="rounded-2xl border border-[#bcd7da] bg-[#edf8f8] p-6"><p className="text-xs font-black uppercase tracking-widest text-teal-dark">Nemate WordPress?</p><h3 className="mt-3 text-xl font-black text-ink">Plugin tada nije pravi paket.</h3><p className="mt-3 leading-7 text-muted">Možemo prvo pregledati vaš sustav i izvor podataka te procijeniti zasebno rješenje. Obrazac će vas automatski usmjeriti na tu opciju.</p></aside>
            <aside className="rounded-2xl border border-[#ead6c9] bg-[#fff8f3] p-6"><p className="text-xs font-black uppercase tracking-widest text-[#8c390f]">Koristite Synesis?</p><h3 className="mt-3 text-xl font-black text-ink">Uvoz datoteke, bez izravne integracije.</h3><p className="mt-3 leading-7 text-muted">Provjeravamo može li se vaš izvoz pouzdano mapirati u generički CSV, XLSX ili podržani XLS tok. Cjenik HR se ne predstavlja kao Synesis dodatak.</p></aside>
          </div>
        </section>

        <section id="mogucnosti" className="border-y border-line bg-[#f5f9fa] py-16 md:py-20" aria-labelledby="features-title">
          <div className={frame}><p className={`${eyebrow} mb-3`}>Mogućnosti</p><h2 id="features-title" className={`${heading} max-w-4xl`}>Kontrole za podatke koji završavaju pred kupcem.</h2>
            <div className="mt-10 grid gap-5 lg:grid-cols-2">{featureGroups.map(group => <article key={group.number} className="rounded-2xl border border-line bg-white p-6 md:p-8"><span className="text-sm font-black text-orange-dark">{group.number}</span><h3 className="mt-4 text-2xl font-black tracking-tight text-ink">{group.title}</h3><p className="mt-4 leading-7 text-muted">{group.copy}</p><ul className="mt-6 grid gap-3 text-sm font-semibold leading-6 text-ink">{group.points.map(point => <li key={point} className="relative pl-6 before:absolute before:left-0 before:text-teal-dark before:content-['✓']">{point}</li>)}</ul></article>)}</div>
          </div>
        </section>

        <section id="kako-radi" className={`${frame} py-16 md:py-20`} aria-labelledby="flow-title">
          <p className={`${eyebrow} mb-3`}>Kako radi</p><h2 id="flow-title" className={`${heading} max-w-3xl`}>Jasan put od datoteke do objave.</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-4">{[
            ["01", "Uvezite", "Odaberite objekt, način uvoza i datoteku."],
            ["02", "Pregledajte", "Mapirajte podatke i riješite upozorenja."],
            ["03", "Potvrdite", "Zaključajte sidra i pregledajte javni skup."],
            ["04", "Objavite", "Stvorite novu CSV reviziju i po potrebi naljepnice."],
          ].map(([number, label, copy]) => <li key={number} className="border-t-2 border-teal pt-5"><span className="text-sm font-black text-teal-dark">{number}</span><h3 className="mt-4 text-xl font-black text-ink">{label}</h3><p className="mt-3 text-sm leading-6 text-muted">{copy}</p></li>)}</ol>
          <p className="mt-8 rounded-xl border border-line bg-[#f5f9fa] px-5 py-4 text-sm leading-6 text-muted"><strong className="text-ink">Raspored objave:</strong> lokalni pokušaji u 06:00, 06:30, 07:00 i 07:30 prema Europe/Zagreb. Pouzdanost vanjskog cron okidača mora se potvrditi na konkretnom hostingu.</p>
        </section>

        <section className="border-y border-line bg-[#f5f9fa] py-16 md:py-20" aria-labelledby="proof-title">
          <div className={frame}><p className={`${eyebrow} mb-3`}>Stvarni proizvod</p><h2 id="proof-title" className={`${heading} max-w-3xl`}>Sučelje iz provjerenog razvojnog checkpointa.</h2><p className="mt-5 max-w-3xl leading-7 text-muted">Prikazi su iz verzije {cjenikHrProduct.pluginVersion}. Sadrže sintetičke testne podatke, bez klijentskih podataka i bez uljepšanih maketa.</p>
            <div className="mt-10 grid gap-6 lg:grid-cols-2">{screenshots.map(([src, title, copy, width, height]) => <figure key={src} className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_16px_42px_rgba(8,42,61,0.07)]"><div className="h-[280px] overflow-hidden border-b border-line bg-[#eef1f2] sm:h-[360px]"><Image src={src} alt={`${title} u Cjenik HR WordPress dodatku`} width={width} height={height} sizes="(min-width: 1024px) 560px, 100vw" className="h-full w-full object-cover object-top" /></div><figcaption className="p-6"><h3 className="text-xl font-black text-ink">{title}</h3><p className="mt-3 leading-7 text-muted">{copy}</p></figcaption></figure>)}</div>
          </div>
        </section>

        <section id="cijene" className={`${frame} py-16 md:py-20`} aria-labelledby="pricing-title">
          <div className="grid gap-9 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14"><div><p className={`${eyebrow} mb-3`}>Cijene</p><h2 id="pricing-title" className={heading}>Odaberite koliko pomoći trebate.</h2><p className="mt-5 leading-7 text-muted">Oba paketa su jednokratna. Prije potvrde provjeravamo osnovnu kompatibilnost i jasno navodimo svaku dodatnu prilagodbu.</p></div>
            <div className="grid gap-5 sm:grid-cols-2">
              <article className="flex flex-col rounded-2xl border border-line bg-white p-6"><span className="text-xs font-black uppercase tracking-widest text-teal-dark">Samo plugin</span><p className="mt-4 text-5xl font-black tracking-tight text-ink">{formatCjenikHrPrice(cjenikHrProduct.pluginPrice)}</p><p className="mt-2 text-sm font-bold text-muted">Jednokratno</p><ul className="my-6 grid gap-3 text-sm leading-6 text-muted"><li>Plugin Cjenik HR {cjenikHrProduct.pluginVersion}</li><li>Dokumentirane funkcije proizvoda</li><li>Provjera osnovne kompatibilnosti prije isporuke</li></ul><a href="#upit" className="mt-auto inline-flex min-h-[50px] items-center justify-center rounded-lg border-2 border-teal px-5 text-sm font-black text-teal-dark hover:bg-teal-soft">Zatražite plugin</a></article>
              <article className="flex flex-col rounded-2xl border-2 border-teal bg-[#edf8f8] p-6 shadow-[0_22px_55px_rgba(0,77,88,0.12)]"><span className="text-xs font-black uppercase tracking-widest text-teal-dark">Plugin + postavljanje</span><p className="mt-4 text-5xl font-black tracking-tight text-ink">{formatCjenikHrPrice(cjenikHrProduct.setupPrice)}</p><p className="mt-2 text-sm font-bold text-muted">Jednokratno</p><ul className="my-6 grid gap-3 text-sm leading-6 text-muted"><li>Sve iz paketa Plugin</li><li>Instalacija i početno podešavanje</li><li>Provjera osnovnog toka na vašem WordPressu</li></ul><a href="#upit" className={`${button} mt-auto`}>Zatražite postavljanje</a></article>
            </div>
          </div>
          <p className="mt-6 rounded-xl border border-[#ead6c9] bg-[#fff8f3] px-5 py-4 text-sm leading-6 text-muted">Prilagodba datoteka, migracija podataka, posebne teme i razvoj za drugi sustav nisu automatski uključeni. Za njih prvo šaljemo zasebnu procjenu.</p>
        </section>

        <section id="upit" className="border-y border-line bg-[#f5f9fa] py-16 md:py-20" aria-labelledby="request-title">
          <div className={`${frame} grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-14`}><div><p className={`${eyebrow} mb-3`}>Upit bez obveze</p><h2 id="request-title" className={heading}>Provjerimo vaš sustav prije isporuke.</h2><p className="mt-5 leading-8 text-muted">Opišite osnovno okruženje. Odgovorit ćemo što je primjenjivo, treba li provjera izvoza i koji paket ima smisla.</p><div className="mt-7 rounded-xl border border-line bg-white p-5"><p className="text-sm font-black text-ink">Ne trebamo pristupe za prvi razgovor.</p><p className="mt-2 text-sm leading-6 text-muted">Domena i opis sustava su dovoljni. Lozinke i poslovne datoteke razmjenjuju se samo naknadno, ako se dogovori siguran postupak.</p></div></div><CjenikHrRequestForm /></div>
        </section>

        <section className={`${frame} py-16 md:py-20`} aria-labelledby="faq-title"><div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14"><div><p className={`${eyebrow} mb-3`}>Česta pitanja</p><h2 id="faq-title" className={heading}>Prije odluke.</h2></div><div className="grid gap-3">{faq.map(([question, answer]) => <details key={question} className="group rounded-xl border border-line bg-white px-5 py-4"><summary className="flex min-h-9 cursor-pointer list-none items-center justify-between gap-4 font-extrabold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-dark">{question}<span aria-hidden="true" className="text-xl text-teal-dark group-open:rotate-45">+</span></summary><p className="mb-1 mt-4 border-t border-line pt-4 leading-7 text-muted">{answer}</p></details>)}</div></div>
          <aside className="mt-12 rounded-2xl border border-[#d4dde5] bg-[#f7f9fb] p-6 text-sm leading-7 text-muted"><strong className="text-ink">Pravna napomena:</strong> Cjenik HR je tehnički alat za vođenje, objavu i prikaz podataka. Ne predstavlja pravni savjet, ne određuje koje se obveze primjenjuju na pojedinog korisnika i ne jamči usklađenost bez točnih podataka, pravilne konfiguracije i odgovarajuće poslovne primjene.</aside>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
