import { Link } from "@tanstack/react-router";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`flex items-center gap-2 font-mono text-xs font-semibold tracking-[0.18em] uppercase text-foreground ${className ?? ""}`}
    >
      <span className="grid size-6 place-items-center rounded-sm bg-foreground text-background">
        <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 4h12M2 8h12M2 12h12M4 2v12M8 2v12M12 2v12" />
        </svg>
      </span>
      ThreadCounty
    </Link>
  );
}
