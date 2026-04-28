import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Cloud, Sparkles, Upload, Star, Shield, FileText, Layout, Users, MessageCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ResumeThumb } from "@/components/ResumeThumb";
import { motion } from "framer-motion";

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

function FadeIn({ children, delay = 0, className = "", direction = "up" }: { children: React.ReactNode, delay?: number, className?: string, direction?: "up" | "left" | "right" }) {
  const y = direction === "up" ? 30 : 0;
  const x = direction === "left" ? -30 : direction === "right" ? 30 : 0;
  return (
    <motion.div
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.95_0.08_145)_0%,transparent_70%)]" />
        <div className="mx-auto max-w-6xl px-5 pt-20 pb-16 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 p-1 pr-4 text-sm font-semibold text-emerald-950"
          >
            <span className="rounded-full bg-white px-3 py-1 text-emerald-950">
              New
            </span>
            <span className="flex items-center gap-1.5">
              ✨ Gemini-powered AI optimizer
            </span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto max-w-4xl text-5xl font-extrabold leading-[1.05] text-foreground md:text-6xl"
          >
            Build Your Perfect Resume with <span className="text-primary">AI</span> — in Minutes.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground"
          >
            OwlCV uses AI to create, optimize, and beautify your resume. Upload your existing one or start fresh.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link to="/signup" className="btn-primary px-6 py-3 text-base">Create My Resume <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/upload" className="btn-outline px-6 py-3 text-base"><Upload className="h-4 w-4" /> Upload & Optimize</Link>
          </motion.div>

          {/* Hero Owl Mascot */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative mt-12 flex justify-center"
          >
            <div className="absolute -inset-16 rounded-full bg-primary/15 blur-[100px]" />
            <img 
              src="/assets/hero_owl_mascot.png" 
              alt="OwlCV Hero Mascot" 
              className="relative w-full max-w-[320px] h-auto drop-shadow-2xl"
            />
          </motion.div>

          {/* Actual Editor Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="relative mx-auto mt-16 max-w-5xl"
          >
            <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-primary/20 via-amber/15 to-teal/20 blur-2xl opacity-60" />
            <div className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl">
              <img 
                src="/assets/editor_preview.png" 
                alt="OwlCV AI Editor Preview" 
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Free to start</span>
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> No credit card</span>
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> AI-powered</span>
          </motion.div>
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
          <div className="relative flex justify-center items-center p-4">
            <div className="absolute -inset-12 rounded-full bg-primary/15 blur-3xl opacity-60" />
            <img 
              src="/assets/create_resume_owl.png" 
              alt="Create Resume with OwlCV" 
              className="relative w-full max-w-[320px] h-auto drop-shadow-xl"
            />
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
          <div className="relative flex justify-center items-center p-4">
            <div className="absolute -inset-16 rounded-full bg-primary/20 blur-[100px] animate-pulse" />
            <img 
              src="/assets/owl_ai.png" 
              alt="Owl AI Core" 
              className="relative w-full max-w-[380px] h-auto drop-shadow-2xl"
            />
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
          <div className="relative flex justify-center items-center p-4">
            <div className="absolute -inset-20 rounded-full bg-emerald/25 blur-[100px] opacity-80" />
            <img 
              src="/assets/upload_optimise_owl.png" 
              alt="Upload and Enhance" 
              className="relative w-full max-w-[320px] h-auto drop-shadow-xl"
            />
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
          <div className="relative flex justify-center items-center p-4">
            <div className="absolute -inset-16 rounded-full bg-amber/15 blur-[80px]" />
            <img 
              src="/assets/bg_remove_owl.png" 
              alt="AI Background Removal Comparison" 
              className="relative w-full max-w-[550px] h-auto drop-shadow-2xl"
            />
          </div>
        }
      />

      {/* FEATURE 5 — Share Section */}
      <section className="bg-primary-soft/40 py-24 relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-5 text-center relative z-10">
          <FadeIn>
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-6 rounded-full bg-primary/5 blur-2xl" />
                <img 
                  src="/assets/share_resume_owl.png" 
                  alt="Share your resume" 
                  className="relative w-full max-w-[280px] h-auto drop-shadow-xl"
                />
              </div>
            </div>
            <span className="pill-green mb-4 inline-flex">Share</span>
            <h2 className="text-4xl font-extrabold md:text-5xl">Share your resume as a live link</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Every resume gets its own beautiful public URL. Send it to recruiters, paste it on LinkedIn, share it anywhere.</p>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-border bg-surface px-4 py-3 shadow-soft">
              <span className="text-sm">🔗</span>
              <code className="flex-1 text-left text-sm font-mono text-foreground">owlcv.app/r/john-doe-software-engineer</code>
              <button className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow-sm hover:brightness-110 active:scale-95 transition-all">Copy</button>
            </div>
            <Link to="/r/$username" params={{ username: "sarah-johnson" }} className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">See live preview example <ArrowRight className="h-4 w-4" /></Link>
          </FadeIn>
        </div>
      </section>

      {/* OWL CALLOUTS */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { img: "/assets/job_offer_owl.png", text: "We're making job applications easier for everyone", sub: "Built by humans, powered by AI." },
            { img: "/assets/templates_owl.png", text: "Multiple resume templates — pick your style", sub: "Modern, classic, creative or minimal." },
            { img: "/assets/privacy_security_owl.png", text: "Your data stays yours", sub: "Private, secure, and downloadable any time." },
          ].map((o, i) => (
            <FadeIn key={o.text} delay={i * 0.1}>
              <div className="card-soft flex flex-col items-start gap-4 p-8 transition-transform hover:-translate-y-1 h-full">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-soft overflow-hidden">
                  <img src={o.img} alt="Owl icon" className="w-full h-full object-contain p-2" />
                </div>
                <p className="text-lg font-bold leading-snug">{o.text}</p>
                <p className="text-sm text-muted-foreground">{o.sub}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="mx-auto max-w-7xl px-5">
        <FadeIn>
          <div className="rounded-3xl gradient-emerald px-8 py-14 text-white shadow-glow">
            <div className="grid gap-8 text-center md:grid-cols-3">
              {[
                { k: "AI-Optimized", v: "Resumes" },
                { k: "10+", v: "Professional Templates" },
                { k: "Built-in", v: "Background Removal" },
              ].map((s, i) => (
                <motion.div 
                  key={s.v}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <p className="text-4xl font-extrabold">{s.k}</p>
                  <p className="mt-2 text-sm text-white/85">{s.v}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* TEMPLATES PREVIEW */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <FadeIn className="text-center">
          <span className="pill-green mb-4 inline-flex">Templates</span>
          <h2 className="text-4xl font-extrabold">Choose from beautiful templates</h2>
          <p className="mt-3 text-muted-foreground">Hand-crafted designs for every industry.</p>
        </FadeIn>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Jake's Template", template: "latex", img: "/assets/Jake.jpg", accent: "slate" as const },
            { name: "IIITA Template", template: "iiita", img: "/assets/IIITA.jpg", accent: "emerald" as const },
            { name: "Modern", template: "modern", accent: "emerald" as const },
            { name: "Minimal", template: "minimal", accent: "teal" as const },
          ].map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.1}>
              <Link to="/editor/$id" params={{ id: "new" }} search={`template=${t.template}`} className="group relative block cursor-pointer h-full">
                <div className="transition-all group-hover:-translate-y-1 group-hover:ring-2 group-hover:ring-primary rounded-xl">
                  {t.img ? (
                    <div className="relative aspect-[1/1.414] overflow-hidden rounded-xl border border-border bg-muted">
                      <img src={t.img} alt={t.name} className="absolute inset-0 h-full w-full object-cover object-top" />
                    </div>
                  ) : (
                    <ResumeThumb accent={t.accent} className="!aspect-[1/1.414]" />
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="font-bold text-foreground group-hover:text-primary transition-colors">{t.name}</p>
                  <span className="pill-muted">Free</span>
                </div>
                <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-full bg-primary py-2 text-center text-xs font-bold text-white opacity-0 shadow-glow transition-opacity group-hover:opacity-100">Use Template</div>
              </Link>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={0.4} className="mt-10 text-center">
          <Link to="/templates" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">View all templates <ArrowRight className="h-4 w-4" /></Link>
        </FadeIn>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-surface-2/60 py-24">
        <div className="mx-auto max-w-7xl px-5">
          <FadeIn className="text-center">
            <h2 className="text-4xl font-extrabold">Loved by job seekers worldwide</h2>
          </FadeIn>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { name: "Maya Patel", role: "Product Designer @ Stripe", q: "I built my resume in 15 minutes and got 3 callbacks the same week. The AI rewrites are unreal." },
              { name: "Daniel Kim", role: "Software Engineer @ Vercel", q: "OwlCV's templates are the cleanest I've seen. My recruiter literally said 'who designed this?'" },
              { name: "Jess Carter", role: "Marketing Lead @ Notion", q: "The shareable link feature is a game-changer. I just paste one URL and recruiters love it." },
            ].map((t, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="card-soft p-6 h-full">
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
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <FadeIn>
          <div className="rounded-3xl gradient-emerald px-8 py-16 text-center text-white shadow-glow relative overflow-hidden">
            <div className="mb-6 flex justify-center">
              <img 
                src="/assets/job_search_owl.png" 
                alt="Land your next job" 
                className="w-full max-w-[200px] h-auto drop-shadow-lg animate-bounce-slow"
              />
            </div>
            <h2 className="mt-4 text-4xl font-extrabold md:text-5xl">Ready to land your next job?</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/90">Join thousands of job seekers building beautiful, AI-optimized resumes with OwlCV.</p>
            <Link to="/signup" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-base font-bold text-primary shadow-soft hover:scale-[1.02] transition-transform">
              Create My Free Resume <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </FadeIn>
      </section>

      <Footer />
    </div>
  );
}

function FeatureRow({ eyebrow, title, body, link, toLink, reverse, visual }: { eyebrow: string; title: string; body: string; link: string; toLink: string; reverse: boolean; visual: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 overflow-hidden">
      <div className={`grid items-center gap-12 md:grid-cols-2 ${reverse ? "md:[&>div:first-child]:order-2" : ""}`}>
        <FadeIn direction={reverse ? "left" : "right"}>
          <span className="pill-green mb-4 inline-flex">{eyebrow}</span>
          <h2 className="text-4xl font-extrabold leading-tight md:text-5xl">{title}</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{body}</p>
          <Link to={toLink as "/"} className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">{link} <ArrowRight className="h-4 w-4" /></Link>
        </FadeIn>
        <FadeIn direction={reverse ? "right" : "left"} delay={0.2}>
          {visual}
        </FadeIn>
      </div>
    </section>
  );
}

