const footerLink = "inline-flex min-h-11 items-center font-bold text-teal-dark underline underline-offset-4 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-3 focus-visible:outline-orange-dark";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-[#f5f9fa] py-8">
      <div className="mx-auto grid w-[min(100%-36px,1120px)] gap-6">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
          <div className="text-sm">
            <p className="m-0 font-extrabold text-ink">deweb j.d.o.o.</p>
            <p className="mb-1 mt-3 leading-6 text-muted">Web-stranice i poslovni alati po mjeri</p>
            <a className={footerLink} href="mailto:dinko@deweb.hr">dinko@deweb.hr</a>
          </div>
          <nav aria-label="Pravne i informativne stranice" className="flex flex-wrap items-center gap-x-3 text-sm">
            <a className={footerLink} href="/privatnost">Politika privatnosti</a>
            <span aria-hidden="true" className="text-muted">·</span>
            <a className={footerLink} href="/uvjeti">Uvjeti korištenja</a>
            <span aria-hidden="true" className="text-muted">·</span>
            <a className={footerLink} href="/pravna-obavijest">Podaci o društvu</a>
          </nav>
        </div>
        <p className="m-0 text-xs leading-5 text-muted">© 2026 deweb j.d.o.o.</p>
      </div>
    </footer>
  );
}
