const links = [
  { href: "#sisterhood", label: "Sisterhood" },
  { href: "#translator", label: "Translator" },
  { href: "#free-money", label: "Free Money" },
  { href: "#my-portfolio", label: "My Portfolio" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-blush-deep/40 bg-cream/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <a href="#" className="flex items-baseline gap-1.5">
          <span className="font-display text-2xl font-semibold italic tracking-tight text-plum">girl math</span>
          <span className="chip bg-gold-soft text-gold">stocks</span>
        </a>
        <nav aria-label="Sections" className="hidden gap-1 sm:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-plum-soft transition-colors hover:bg-blush hover:text-plum"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
