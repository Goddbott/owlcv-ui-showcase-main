import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { LayoutDashboard, Github, BookOpen, Zap, LayoutTemplate, Sparkles, Settings, LogOut, Menu, X } from "lucide-react";
import { Logo } from "./Logo";

const items = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "GitHub Import", to: "/import-project", icon: Github },
  { label: "My Library", to: "/library", icon: BookOpen },
  { label: "ATS Optimizer", to: "/optimizer", icon: Zap },
  { label: "Resources", to: "/resources", icon: Sparkles },
  { label: "Templates", to: "/templates", icon: LayoutTemplate },
  { label: "Settings", to: "/settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border bg-surface px-4 md:hidden">
        <Logo />
        <button onClick={() => setOpen(!open)} className="rounded-full p-2" aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link to="/"><Logo /></Link>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((item) => {
            const active = pathname === item.to || (item.to === "/dashboard" && pathname.startsWith("/editor"));
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-primary-soft text-[color:var(--accent-foreground)]" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                <Icon className="h-4 w-4" /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">SJ</div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold">Sarah Johnson</p>
              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive">
                <LogOut className="h-3 w-3" /> Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-black/30 md:hidden" />}

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
