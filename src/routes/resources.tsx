import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppSidebar";
import { BookOpen, Search, ArrowRight, Star, ExternalLink, Sparkles, Files, Terminal } from "lucide-react";

export const Route = createFileRoute("/resources")({
  component: Resources,
});

const articles = [
  {
    title: "How to Build a Portfolio that Gets You Hired",
    category: "Career Growth",
    icon: <Star className="h-5 w-5 text-amber-500" />,
    readTime: "8 min read",
    color: "amber"
  },
  {
    title: "10 AI Prompts for Better Resume Bullet Points",
    category: "AI & Resume",
    icon: <Sparkles className="h-5 w-5 text-primary" />,
    readTime: "5 min read",
    color: "emerald"
  },
  {
    title: "Mastering the Technical Interview in 2024",
    category: "Interview Prep",
    icon: <Terminal className="h-5 w-5 text-indigo-500" />,
    readTime: "12 min read",
    color: "indigo"
  },
  {
    title: "ATS Optimization: The Complete Checklist",
    category: "Resume Tips",
    icon: <Files className="h-5 w-5 text-teal-500" />,
    readTime: "10 min read",
    color: "teal"
  },
  {
    title: "Soft Skills: The Missing Piece of Your CV",
    category: "Career Growth",
    icon: <Star className="h-5 w-5 text-rose-500" />,
    readTime: "7 min read",
    color: "rose"
  },
  {
    title: "Remote Work: Navigating the Global Market",
    category: "Job Search",
    icon: <Terminal className="h-5 w-5 text-slate-500" />,
    readTime: "6 min read",
    color: "slate"
  }
];

function Resources() {
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-6 py-6 md:px-10 md:py-10">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
            <h1 className="text-4xl font-black tracking-tight">Resource Hub</h1>
            <p className="mt-3 text-lg text-muted-foreground">Expert guides, curated tips, and AI strategies to level up your career journey.</p>
            
            <div className="mt-8 relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="What are you looking to learn today?" 
                  className="input-base pl-12 py-4 h-14 text-base shadow-soft" 
                />
            </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
           {articles.map((article, idx) => (
             <div key={idx} className="card-soft group flex flex-col p-6 transition-all hover:-translate-y-1 hover:shadow-card">
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface transition-all group-hover:scale-110 shadow-soft`}>
                    {article.icon}
                </div>
                
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <span className={`h-1.5 w-1.5 rounded-full bg-${article.color}-500`} style={{ backgroundColor: `var(--color-${article.color})` }} /> {article.category}
                </div>
                
                <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">{article.title}</h3>
                <p className="mt-4 text-xs font-semibold text-muted-foreground">{article.readTime}</p>

                <div className="mt-auto pt-6 flex items-center justify-between">
                   <button className="text-sm font-bold text-foreground flex items-center gap-1 group-hover:text-primary transition-all">
                      Read Article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                   </button>
                   <button className="p-2 rounded-full hover:bg-muted text-muted-foreground">
                      <ExternalLink className="h-4 w-4" />
                   </button>
                </div>
             </div>
           ))}
        </div>

        <div className="mt-20 card-soft p-12 overflow-hidden relative bg-gradient-to-r from-primary to-indigo-600 text-white shadow-glow">
            <div className="relative z-10 max-w-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md mb-6">
                    <BookOpen className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-black leading-tight">Apply with Confidence. Build with OwlCV.</h2>
                <p className="mt-4 text-lg text-white/80">
                   Join 50,000+ professionals who use OwlCV to create resumes that actually get results.
                </p>
                <div className="mt-8 flex gap-4">
                    <button className="btn-primary bg-white text-primary hover:bg-white/90">Sign Up Free</button>
                    <button className="btn-outline border-white/30 bg-transparent text-white hover:border-white">Explore Templates</button>
                </div>
            </div>
            
            {/* Background elements */}
            <div className="absolute top-0 right-0 h-full w-1/3 bg-white/5 opacity-40 blur-3xl transform rotate-12" />
        </div>
      </div>
    </AppShell>
  );
}
