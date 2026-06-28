import { Link, useRouter } from "@tanstack/react-router";
import { type ReactNode, useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { AIChatbot } from "@/components/AIChatbot";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV = [
  { to: "/", label: "Platform" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

export function PublicLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [router]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className={`sticky top-0 z-40 transition-all duration-500 ease-in-out ${
        isScrolled 
          ? "border-b border-border bg-background/95 py-2 shadow-sm backdrop-blur-md" 
          : "border-b border-transparent bg-background/0 py-4 backdrop-blur-none"
      }`}>
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-10">
            <Logo />
            <nav className="hidden items-center gap-7 md:flex">
              {NAV.map((n, i) => (
                <Link
                  key={n.to}
                  to={n.to}
                  activeOptions={{ exact: n.to === "/" }}
                  style={{ animationDelay: `${i * 80}ms` }}
                  className="relative text-[11px] font-mono tracking-[0.14em] uppercase text-muted-foreground transition-all duration-300 hover:text-foreground data-[status=active]:text-foreground py-1.5 group animate-fade-in-up"
                >
                  {n.label}
                  <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-brand transition-all duration-300 group-hover:w-full group-data-[status=active]:w-full" />
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <ThemeToggle className="size-8" />
            {loading ? null : user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex text-[11px] font-semibold uppercase tracking-[0.14em] h-8"
                  onClick={() => router.navigate({ to: "/dashboard" })}
                >
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  search={{ mode: "login" }}
                  className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground sm:inline-block"
                >
                  Sign In
                </Link>
                <Button
                  size="sm"
                  className="hidden sm:inline-flex bg-foreground text-background hover:bg-foreground/90 rounded-sm text-[11px] font-semibold uppercase tracking-[0.14em] h-8"
                  onClick={() => router.navigate({ to: "/auth", search: { mode: "signup" } })}
                >
                  Open Instrument
                </Button>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="ml-2 flex md:hidden flex-col justify-center items-center size-8 gap-1.5 rounded-sm hover:bg-accent transition-colors"
            >
              <span className={`block h-px w-5 bg-foreground transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[3px]" : ""}`} />
              <span className={`block h-px w-5 bg-foreground transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[3.5px]" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer Panel */}
      <div className={`fixed top-0 right-0 z-40 h-full w-72 bg-card border-l border-border shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
        mobileOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="flex h-14 items-center justify-between border-b border-border px-5">
          <Logo />
          <button
            onClick={() => setMobileOpen(false)}
            className="grid size-8 place-items-center rounded-sm text-muted-foreground hover:bg-accent"
            aria-label="Close menu"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <nav className="flex flex-col p-4 gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              onClick={() => setMobileOpen(false)}
              className="flex items-center rounded-sm px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground data-[status=active]:text-foreground data-[status=active]:bg-accent transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4 space-y-2">
          {loading ? null : user ? (
            <Button
              className="w-full rounded-sm bg-foreground text-background hover:bg-foreground/90 text-[11px] font-semibold uppercase tracking-wider h-10"
              onClick={() => { router.navigate({ to: "/dashboard" }); setMobileOpen(false); }}
            >
              Dashboard
            </Button>
          ) : (
            <>
              <Link
                to="/auth"
                search={{ mode: "login" }}
                onClick={() => setMobileOpen(false)}
                className="flex h-10 items-center justify-center rounded-sm border border-border text-sm font-medium hover:bg-accent transition-colors"
              >
                Sign In
              </Link>
              <Button
                className="w-full rounded-sm bg-foreground text-background hover:bg-foreground/90 text-[11px] font-semibold uppercase tracking-wider h-10"
                onClick={() => { router.navigate({ to: "/auth", search: { mode: "signup" } }); setMobileOpen(false); }}
              >
                Open Instrument
              </Button>
            </>
          )}
        </div>
      </div>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Computer vision for textile measurement. Automated thread density, warp/weft
              validation and weave identification — engineered for the global textile supply chain.
            </p>
          </div>
          <div>
            <span className="tag mb-4 block">Product</span>
            <ul className="space-y-2 text-sm">
              <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link></li>
              <li><Link to="/faq" className="text-muted-foreground hover:text-foreground">FAQ</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
            </ul>
          </div>
          <div>
            <span className="tag mb-4 block">Company</span>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-foreground">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              © {new Date().getFullYear()} ThreadCounty Labs
            </span>
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Network: Optimal
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Textile AI Chatbot */}
      <AIChatbot />
    </div>
  );
}
