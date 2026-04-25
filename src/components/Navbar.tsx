import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

const links = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Calculator", to: "/calculator" },
  { label: "Skill Gap Scanner", to: "/optimizer" },
  { label: "Resources", to: "/resources" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { session } = useAuth();
  
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link to="/"><Logo /></Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.label} to={l.to} className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {!session ? (
            <>
              <Link to="/signin" className="btn-outline px-4 py-2">Sign In</Link>
              <Link to="/signup" className="btn-primary px-4 py-2">Get Started Free</Link>
            </>
          ) : (
            <button 
              onClick={async () => await supabase.auth.signOut()} 
              className="btn-outline px-4 py-2"
            >
              Sign Out
            </button>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="rounded-full p-2 md:hidden" aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-surface px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.label} to={l.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                {l.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              {!session ? (
                <>
                  <Link to="/signin" className="btn-outline">Sign In</Link>
                  <Link to="/signup" className="btn-primary">Get Started Free</Link>
                </>
              ) : (
                <button 
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setOpen(false);
                  }} 
                  className="btn-outline text-left px-3"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
