import { createFileRoute, Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/r/$username")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.username.replace(/-/g, " ")} — Resume on OwlCV` },
      { name: "description", content: "View this resume built with OwlCV." },
      { property: "og:title", content: `${params.username.replace(/-/g, " ")} — Resume` },
    ],
  }),
  component: PublicResume,
});

function PublicResume() {
  return (
    <div className="min-h-screen bg-surface-2/40">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-5">
          <span className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">🦉 Made with <span className="font-extrabold text-primary">OwlCV</span></span>
          <Link to="/signup" className="btn-primary px-3 py-1.5 text-xs">Create Your Own Free Resume →</Link>
        </div>
      </header>

      <div className="relative mx-auto max-w-3xl px-4 py-10">
        <button className="absolute right-6 top-12 z-10 hidden md:flex btn-primary"><Download className="h-4 w-4" /> Download PDF</button>

        <div className="rounded-2xl bg-white p-10 text-slate-900 shadow-card ring-1 ring-border md:p-14">
          <header className="flex items-start gap-6 border-b-2 border-primary pb-5">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-extrabold text-white">SJ</div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Sarah Johnson</h1>
              <p className="mt-1 text-lg font-semibold text-primary">Senior UX Designer</p>
              <p className="mt-2 text-xs text-slate-600">sarah@example.com · +1 (555) 123-4567 · San Francisco, CA · linkedin.com/in/sarah</p>
            </div>
          </header>

          <Section title="Summary">
            <p className="text-sm leading-relaxed text-slate-700">
              Senior UX Designer with 6+ years crafting intuitive products at scale. Led design systems at Acme Corp and shipped features used by 2M+ users monthly. Passionate about accessible, performant, and delightful interfaces.
            </p>
          </Section>

          <Section title="Experience">
            <Job role="Senior UX Designer" company="Acme Corp" date="Jan 2022 — Present" bullets={[
              "Led redesign of core product, increasing user retention by 32%",
              "Built and maintained 80+ component design system used across 6 product teams",
              "Mentored 5 junior designers and ran weekly design critique sessions",
              "Partnered with research to validate features with 200+ user interviews",
            ]} />
            <Job role="Product Designer" company="Beta Inc" date="2020 — 2021" bullets={[
              "Designed onboarding flow that improved activation rate by 24%",
              "Shipped 12 customer-facing features end-to-end with engineering",
            ]} />
          </Section>

          <Section title="Education">
            <Job role="B.S. Computer Science" company="Stanford University" date="2016 — 2020" bullets={["3.9 GPA · Focus on Human-Computer Interaction · Dean's List"]} />
          </Section>

          <Section title="Skills">
            <div className="flex flex-wrap gap-1.5">
              {["Figma", "Design Systems", "Prototyping", "User Research", "Webflow", "React", "TypeScript", "Accessibility", "Motion Design"].map((s) => (
                <span key={s} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{s}</span>
              ))}
            </div>
          </Section>

          <Section title="Projects">
            <Job role="OwlCV — Open-source resume builder" company="github.com/sarah/owlcv" date="2024" bullets={["Built AI-powered resume builder with React + TypeScript. 1.2K GitHub stars."]} />
            <Job role="Component Library — Hoot UI" company="hoot-ui.dev" date="2023" bullets={["Designed and shipped accessible React component library used by 30+ teams."]} />
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-primary">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Job({ role, company, date, bullets }: { role: string; company: string; date: string; bullets: string[] }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-bold">{role} · <span className="font-semibold text-slate-700">{company}</span></p>
        <p className="text-xs text-slate-500">{date}</p>
      </div>
      <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-700">
        {bullets.map((b) => <li key={b}>{b}</li>)}
      </ul>
    </div>
  );
}
