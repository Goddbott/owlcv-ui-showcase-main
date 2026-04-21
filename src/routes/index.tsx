import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Cloud, Sparkles, Upload, Star, Shield, FileText, Layout, Users, MessageCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ResumeThumb } from "@/components/ResumeThumb";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OwlCV — Build Your Perfect Resume with AI in Minutes" },
      { name: "description", content: "OwlCV uses AI to create, optimize, and beautify your resume. Upload your existing one or start fresh." },
      { property: "og:title", content: "OwlCV — Build Your Perfect Resume with AI" },
      { property: "og:description", content: "AI-powered resume builder with templates, optimization, and shareable links." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.95_0.08_145)_0%,transparent_70%)]" />
        <div className="mx-auto max-w-6xl px-5 pt-20 pb-16 text-center">
          <span className="pill-amber mx-auto mb-6 inline-flex"><Sparkles className="h-3 w-3" /> New ✨ Gemini-powered AI optimizer</span>
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-[1.05] text-foreground md:text-6xl">
            Build Your Perfect Resume with <span className="text-primary">AI</span> — in Minutes.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            OwlCV uses AI to create, optimize, and beautify your resume. Upload your existing one or start fresh.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/signup" className="btn-primary px-6 py-3 text-base">Create My Resume <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/upload" className="btn-outline px-6 py-3 text-base"><Upload className="h-4 w-4" /> Upload & Optimize</Link>
          </div>

          {/* Mock UI Frame */}
          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-primary/20 via-amber/15 to-teal/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
              <div className="flex items-center gap-2 border-b border-border bg-surface-2 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-amber" />
                  <span className="h-3 w-3 rounded-full bg-primary" />
                </div>
                <div className="ml-3 rounded-md bg-muted px-3 py-1 text-xs font-mono text-muted-foreground">owlcv.app/editor/sarah-johnson</div>
              </div>
              <div className="grid gap-6 p-8 md:grid-cols-[1fr_1.4fr]">
                <div className="space-y-3">
                  <div className="rounded-xl bg-muted/60 p-3">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Personal</p>
                    <div className="mt-2 space-y-2">
                      <div className="h-7 rounded-md bg-white" />
                      <div className="h-7 rounded-md bg-white" />
                    </div>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-3">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Experience</p>
                    <div className="mt-2 space-y-2">
                      <div className="h-7 rounded-md bg-white" />
                      <div className="h-14 rounded-md bg-white" />
                    </div>
                  </div>
                  <button className="btn-primary w-full"><Sparkles className="h-3.5 w-3.5" /> AI Optimize</button>
                </div>
                <div className="rounded-xl bg-white p-6 shadow-soft ring-1 ring-border">
                  <div className="border-b border-primary/30 pb-3">
                    <p className="text-xl font-extrabold">Sarah Johnson</p>
                    <p className="text-sm text-primary">Senior UX Designer</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">sarah@example.com · San Francisco · linkedin.com/in/sarah</p>
                  </div>
                  <div className="mt-3 space-y-3">
                    <div>
                      <p className="text-xs font-bold text-primary">EXPERIENCE</p>
                      <div className="mt-1 space-y-1">
                        <div className="resume-line w-11/12" />
                        <div className="resume-line w-10/12" />
                        <div className="resume-line w-9/12" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary">SKILLS</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {["Figma", "Design Systems", "Research", "Prototyping", "Webflow"].map((s) => (
                          <span key={s} className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-[color:var(--accent-foreground)]">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Free to start</span>
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> No credit card</span>
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> AI-powered</span>
          </div>
        </div>
      </section>

      {/* FEATURE 1 */}
      <FeatureRow
        eyebrow="Editor"
        title="Create a resume in minutes"
        body="Pick a template, fill in your details, and watch your resume come to life with a real-time live preview. Export to PDF in one click."
        link="See templates"
        toLink="/templates"
        reverse={false}
        visual={
          <div className="card-soft overflow-hidden">
            <div className="flex border-b border-border bg-surface-2 px-3 py-2 text-xs font-mono text-muted-foreground">editor.owlcv.app</div>
            <div className="grid grid-cols-2 gap-3 p-4">
              <div className="space-y-2">
                <div className="h-6 rounded bg-muted" />
                <div className="h-6 rounded bg-muted" />
                <div className="h-16 rounded bg-muted" />
                <div className="rounded bg-primary py-1.5 text-center text-[10px] font-bold text-white">+ Add Section</div>
              </div>
              <div className="rounded-lg bg-white p-3 ring-1 ring-border">
                <div className="h-3 w-3/4 rounded bg-foreground/80" />
                <div className="mt-1 h-2 w-1/2 rounded bg-primary/60" />
                <div className="mt-3 space-y-1">
                  <div className="resume-line w-full" />
                  <div className="resume-line w-11/12" />
                  <div className="resume-line w-10/12" />
                  <div className="resume-line w-9/12" />
                </div>
              </div>
            </div>
          </div>
        }
      />

      {/* FEATURE 2 */}
      <FeatureRow
        eyebrow="AI"
        title="AI-powered optimization"
        body="Our Gemini-powered AI rewrites your bullet points, adds quantified achievements, and surfaces ATS-friendly keywords tailored to your role."
        link="Learn more"
        toLink="/"
        reverse
        visual={
          <div className="card-soft p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">🦉</span>
              <p className="text-sm font-bold">AI Suggestions</p>
              <span className="pill-green ml-auto">Live</span>
            </div>
            <div className="space-y-2">
              {[
                "Added quantified achievements",
                "Improved summary clarity",
                "Added 12 industry keywords",
                "Shortened long bullet points",
                "Improved ATS readability",
              ].map((s) => (
                <div key={s} className="flex items-center gap-2 rounded-lg bg-primary-soft px-3 py-2 text-sm font-medium text-[color:var(--accent-foreground)]">
                  <Check className="h-4 w-4 text-primary" /> {s}
                </div>
              ))}
            </div>
          </div>
        }
      />

      {/* FEATURE 3 */}
      <FeatureRow
        eyebrow="Upload"
        title="Upload & enhance your existing resume"
        body="Drop in a PDF or DOCX. Our AI reads it, rewrites it, and gives you back a polished, modern version ready to download."
        link="Try it free"
        toLink="/upload"
        reverse={false}
        visual={
          <div className="card-soft flex flex-col items-center justify-center gap-3 border-2 border-dashed border-primary/40 bg-primary-soft/30 p-12 text-center">
            <Cloud className="h-10 w-10 text-primary" />
            <p className="text-sm font-bold">Drop your PDF or DOCX</p>
            <p className="text-xs text-muted-foreground">or click to browse</p>
            <div className="flex gap-2"><span className="pill-muted">PDF</span><span className="pill-muted">DOCX</span></div>
          </div>
        }
      />

      {/* FEATURE 4 */}
      <FeatureRow
        eyebrow="Photo"
        title="Profile photo with background removal"
        body="Upload your photo and our AI cleanly removes the background — instantly professional, ready to drop into your resume header."
        link="Try the AI"
        toLink="/editor/sarah"
        reverse
        visual={
          <div className="grid grid-cols-2 gap-4">
            <div className="card-soft overflow-hidden p-4">
              <div className="aspect-square rounded-xl bg-gradient-to-br from-amber/40 to-teal/30" />
              <p className="mt-3 text-center text-xs font-semibold text-muted-foreground">Before</p>
            </div>
            <div className="card-soft overflow-hidden p-4">
              <div className="aspect-square rounded-xl bg-[conic-gradient(from_45deg,_oklch(0.96_0.005_250),_oklch(0.99_0.005_250))]" />
              <p className="mt-3 text-center text-xs font-semibold text-primary">After ✨</p>
            </div>
          </div>
        }
      />

      {/* FEATURE 5 — green tinted full width */}
      <section className="bg-primary-soft/60 py-24">
        <div className="mx-auto max-w-5xl px-5 text-center">
          <span className="pill-green mb-4 inline-flex">Share</span>
          <h2 className="text-4xl font-extrabold md:text-5xl">Share your resume as a live link</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Every resume gets its own beautiful public URL. Send it to recruiters, paste it on LinkedIn, share it anywhere.</p>
          <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-border bg-surface px-4 py-3 shadow-soft">
            <span className="text-sm">🔗</span>
            <code className="flex-1 text-left text-sm font-mono text-foreground">owlcv.app/r/john-doe-software-engineer</code>
            <button className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">Copy</button>
          </div>
          <Link to="/r/$username" params={{ username: "sarah-johnson" }} className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">See live preview example <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      {/* OWL CALLOUTS */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: "🦉", text: "We're making job applications easier for everyone", sub: "Built by humans, powered by AI." },
            { icon: "🦉", text: "Multiple resume templates — pick your style", sub: "Modern, classic, creative or minimal." },
            { icon: "🦉", text: "Your data stays yours", sub: "Private, secure, and downloadable any time." },
          ].map((o) => (
            <div key={o.text} className="card-soft flex flex-col items-start gap-4 p-8 transition-transform hover:-translate-y-1">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-4xl">{o.icon}</div>
              <p className="text-lg font-bold leading-snug">{o.text}</p>
              <p className="text-sm text-muted-foreground">{o.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="mx-auto max-w-7xl px-5">
        <div className="rounded-3xl gradient-emerald px-8 py-14 text-white shadow-glow">
          <div className="grid gap-8 text-center md:grid-cols-3">
            {[
              { k: "AI-Optimized", v: "Resumes" },
              { k: "10+", v: "Professional Templates" },
              { k: "Built-in", v: "Background Removal" },
            ].map((s) => (
              <div key={s.v}>
                <p className="text-4xl font-extrabold">{s.k}</p>
                <p className="mt-2 text-sm text-white/85">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEMPLATES PREVIEW */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="text-center">
          <span className="pill-green mb-4 inline-flex">Templates</span>
          <h2 className="text-4xl font-extrabold">Choose from beautiful templates</h2>
          <p className="mt-3 text-muted-foreground">Hand-crafted designs for every industry.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Modern", accent: "emerald" as const },
            { name: "Classic", accent: "slate" as const },
            { name: "Creative", accent: "amber" as const },
            { name: "Minimal", accent: "teal" as const },
          ].map((t) => (
            <div key={t.name} className="group relative cursor-pointer">
              <div className="transition-all group-hover:-translate-y-1 group-hover:ring-2 group-hover:ring-primary rounded-xl">
                <ResumeThumb accent={t.accent} />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="font-bold">{t.name}</p>
                <span className="pill-muted">Free</span>
              </div>
              <button className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white opacity-0 shadow-glow transition-opacity group-hover:opacity-100">Use Template</button>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/templates" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">View all templates <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-surface-2/60 py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold">Loved by job seekers worldwide</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { name: "Maya Patel", role: "Product Designer @ Stripe", q: "I built my resume in 15 minutes and got 3 callbacks the same week. The AI rewrites are unreal." },
              { name: "Daniel Kim", role: "Software Engineer @ Vercel", q: "OwlCV's templates are the cleanest I've seen. My recruiter literally said 'who designed this?'" },
              { name: "Jess Carter", role: "Marketing Lead @ Notion", q: "The shareable link feature is a game-changer. I just paste one URL and recruiters love it." },
            ].map((t, i) => (
              <div key={i} className="card-soft p-6">
                <div className="flex gap-0.5 text-amber">
                  {Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-foreground">"{t.q}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">{t.name.split(" ").map(n => n[0]).join("")}</div>
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="rounded-3xl gradient-emerald px-8 py-16 text-center text-white shadow-glow">
          <span className="text-5xl">🦉</span>
          <h2 className="mt-4 text-4xl font-extrabold md:text-5xl">Ready to land your next job?</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/90">Join thousands of job seekers building beautiful, AI-optimized resumes with OwlCV.</p>
          <Link to="/signup" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-base font-bold text-primary shadow-soft hover:scale-[1.02] transition-transform">
            Create My Free Resume <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FeatureRow({ eyebrow, title, body, link, toLink, reverse, visual }: { eyebrow: string; title: string; body: string; link: string; toLink: string; reverse: boolean; visual: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20">
      <div className={`grid items-center gap-12 md:grid-cols-2 ${reverse ? "md:[&>div:first-child]:order-2" : ""}`}>
        <div>
          <span className="pill-green mb-4 inline-flex">{eyebrow}</span>
          <h2 className="text-4xl font-extrabold leading-tight md:text-5xl">{title}</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{body}</p>
          <Link to={toLink as "/"} className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">{link} <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div>{visual}</div>
      </div>
    </section>
  );
}
