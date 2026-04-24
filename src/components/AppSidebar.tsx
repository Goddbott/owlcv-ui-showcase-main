import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { LayoutDashboard, Github, BookOpen, Zap, LayoutTemplate, Sparkles, Settings, LogOut, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Logo } from "./Logo";
import { supabase } from "@/lib/supabase";

const items = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "GitHub Import", to: "/import-project", icon: Github },
  { label: "My Library", to: "/library", icon: BookOpen },
  { label: "ATS Calculator", to: "/calculator", icon: Zap },
  { label: "ATS Optimizer", to: "/optimizer", icon: Sparkles },
  { label: "Resources", to: "/resources", icon: LayoutTemplate },
  { label: "Templates", to: "/templates", icon: LayoutTemplate },
  { label: "Settings", to: "/settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar-collapsed") === "true";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(isCollapsed));
  }, [isCollapsed]);
  const { pathname } = useLocation();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/signin" });
  };

  const fullName = user?.user_metadata?.full_name || "User";
  const initials = fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2);

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
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-sidebar transition-all duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0 
          ${open ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "md:w-20" : "md:w-64"}
          w-64
        `}
      >
        <div className={`flex h-16 items-center border-b border-border px-5 ${isCollapsed ? "justify-center px-0" : "justify-between"}`}>
          <Link to="/">{!isCollapsed ? <Logo /> : <Logo type="icon" className="h-6 mx-auto" />}</Link>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
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
                className={`flex items-center rounded-xl p-2.5 text-sm font-medium transition-colors 
                  ${isCollapsed ? "justify-center" : "gap-3 px-3"}
                  ${active ? "bg-primary-soft text-[color:var(--accent-foreground)]" : "text-muted-foreground hover:bg-muted hover:text-foreground"}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" /> 
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div className={`flex items-center gap-3 rounded-xl p-2 ${isCollapsed ? "justify-center" : ""}`}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm">{initials}</div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 transition-all duration-300">
                <p className="truncate text-sm font-semibold">{fullName}</p>
                <button onClick={handleSignOut} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive">
                  <LogOut className="h-3 w-3" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-black/30 md:hidden" />}

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
