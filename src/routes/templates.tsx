import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { AppShell } from "@/components/AppSidebar";
import { ResumeThumb } from "@/components/ResumeThumb";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/templates")({
  head: () => ({ meta: [{ title: "Resume Templates — OwlCV" }, { name: "description", content: "Choose from beautiful, ATS-friendly resume templates." }] }),
  component: Templates,
});

const filters = ["All", "Modern", "Classic", "Creative", "Minimal"] as const;

const templates = [
  { name: "Jake's Template", category: "Classic", template: "latex", accent: "slate" as const },
  { name: "IIITA Template", category: "College", template: "iiita", accent: "emerald" as const },
];

function Templates() {
  const { session } = useAuth();
  const [active, setActive] = useState<typeof filters[number]>("All");
  const visible = templates.filter((t) => active === "All" || t.category === active);

  return (
    <AppShell>
      <div className="px-6 py-8 md:px-10">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-extrabold">Resume Templates</h1>
          <p className="mt-2 text-muted-foreground">Choose a design that fits your style — every template is free to try.</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active === f ? "bg-primary text-white shadow-soft" : "bg-muted text-muted-foreground hover:bg-primary-soft hover:text-primary"}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((t, i) => {
            const selected = i === 0;
            return (
              <div key={t.name} className="group relative">
                <div className={`card-soft overflow-hidden p-4 transition-all ${selected ? "ring-2 ring-primary" : "group-hover:ring-2 group-hover:ring-primary"}`}>
                  <ResumeThumb accent={t.accent} />
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.category}</p>
                    </div>
                    {selected ? (
                      <span className="pill-green"><Check className="h-3 w-3" /> Selected</span>
                    ) : (
                      <span className="pill-muted">Free</span>
                    )}
                  </div>
                </div>
                {!selected && (
                  <button className="absolute inset-x-10 top-1/3 rounded-full bg-primary py-2 text-xs font-bold text-white opacity-0 shadow-glow transition-opacity group-hover:opacity-100">
                    Use This Template
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-16 rounded-3xl bg-primary-soft/60 p-10 text-center">
          <h3 className="text-xl font-extrabold">Not sure which one to pick?</h3>
          <p className="mt-2 text-sm text-muted-foreground">All templates are free to try — switch anytime in the editor.</p>
          {!session ? (
            <Link to="/signup" className="btn-primary mt-5">Get Started</Link>
          ) : (
            <Link to="/dashboard" className="btn-primary mt-5">Go to Dashboard</Link>
          )}
        </div>
      </div>
    </AppShell>
  );
}
