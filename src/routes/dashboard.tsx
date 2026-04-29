import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Plus, Edit, Eye, Share2, Trash2, Upload, FileText, Eye as EyeIcon, Download, Sparkles, Github, BookOpen, Zap, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppSidebar";
import { ResumeThumb } from "@/components/ResumeThumb";
import { supabase } from "@/lib/supabase";
import { getResumes, deleteResume } from "@/server/functions";
import { ShareModal } from "@/components/ShareModal";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — OwlCV" }, { name: "description", content: "Manage your resumes and track activity." }] }),
  component: Dashboard,
});

function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareLink, setShareLink] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const fetchSessionAndData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.navigate({ to: "/signin" });
        return;
      }

      setUser(session.user);

      // Fetch resumes for this user
      try {
        const resumesData = await getResumes({ data: session.user.id });
        if (resumesData) {
          setResumes(resumesData);
        }
      } catch (error) {
        console.error("Failed to fetch resumes:", error);
      }
      
      setLoading(false);
    };

    fetchSessionAndData();
  }, [router]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </AppShell>
    );
  }

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  return (
    <AppShell>
      <div className="relative min-h-screen pb-20">
        {/* Global Gradient Background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.95_0.08_145)_0%,transparent_70%)] opacity-60 pointer-events-none" />
        
        <div className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-12">
          
          {/* Welcome Header */}
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div>
              <span className="pill-green mb-4 inline-flex"><Sparkles className="h-3 w-3" /> Your Workspace</span>
              <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Good morning, <span className="text-primary">{firstName}</span> 👋</h1>
              <p className="mt-3 text-lg text-muted-foreground">Here's what's happening with your resumes today.</p>
            </div>
            <Link to="/editor/$id" params={{ id: "new" }} className="btn-primary shadow-glow hidden md:inline-flex px-6 py-3 text-sm"><Plus className="h-4 w-4" /> Create New Resume</Link>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-14">
            <Stat icon={<FileText className="h-5 w-5" />} label="Total Resumes" value={resumes.length.toString()} color="primary" />
            <Stat icon={<EyeIcon className="h-5 w-5" />} label="Profile Views" value={resumes.reduce((acc, r) => acc + (r.views || 0), 0).toString()} color="indigo" />
            <Stat icon={<Download className="h-5 w-5" />} label="Downloads" value={resumes.reduce((acc, r) => acc + (r.downloads || 0), 0).toString()} color="amber" />
            <div className="card-soft relative overflow-hidden p-6 ring-1 ring-border shadow-soft transition-transform hover:-translate-y-1">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                  <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-emerald-500" /> Profile Strength</span>
                  <span className="pill-green">Great</span>
                </div>
                <div>
                  <p className="text-4xl font-extrabold text-foreground">80%</p>
                  <div className="mt-3 h-2.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[80%] rounded-full bg-emerald-500 shadow-glow" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* My Resumes Section */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold flex items-center gap-2">My Resumes <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">{resumes.length}</span></h2>
            <Link to="/templates" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">Browse templates <ArrowRight className="h-4 w-4" /></Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-16">
            
            {/* Create new card */}
            <Link to="/editor/$id" params={{ id: "new" }} className="group relative flex min-h-[340px] flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-border bg-surface p-8 text-center transition-all hover:ring-2 hover:ring-primary shadow-soft">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-glow transition-transform group-hover:scale-110"><Plus className="h-6 w-6" /></div>
              <div>
                <p className="font-extrabold text-lg">Start from scratch</p>
                <p className="mt-1 text-xs text-muted-foreground">Pick a template and start fresh</p>
              </div>
            </Link>

            {/* Existing Resumes */}
            {resumes.map((r) => (
              <div key={r.id} className="card-soft group overflow-hidden p-5 transition-all hover:-translate-y-1 hover:ring-2 hover:ring-primary">
                <ResumeThumb accent={r.content?.accent || "emerald"} className="!aspect-[1/1.414]" data={r.content} />
                <div className="mt-5 flex items-start justify-between">
                  <div>
                    <p className="font-bold text-base truncate pr-2">{r.title}</p>
                    <p className="mt-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Updated {new Date(r.updated_at).toLocaleDateString()}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><EyeIcon className="h-3.5 w-3.5" /> {r.views || 0}</span>
                      <span className="flex items-center gap-1"><Download className="h-3.5 w-3.5" /> {r.downloads || 0}</span>
                    </div>
                  </div>
                  <span className="pill-green whitespace-nowrap">{r.content?.template || "Modern"}</span>
                </div>
                <div className="mt-5 grid grid-cols-4 gap-2">
                  <Link to="/editor/$id" params={{ id: r.id }} className="flex h-10 items-center justify-center rounded-xl bg-muted text-foreground transition-colors hover:bg-primary hover:text-white" title="Edit"><Edit className="h-4 w-4" /></Link>
                  <Link to="/preview/$id" params={{ id: r.id }} className="flex h-10 items-center justify-center rounded-xl bg-muted text-foreground transition-colors hover:bg-primary hover:text-white" title="Preview"><Eye className="h-4 w-4" /></Link>
                  <button 
                    onClick={() => {
                      setShareLink(`${window.location.origin}/preview/${r.id}`);
                      setIsShareModalOpen(true);
                    }}
                    className="flex h-10 items-center justify-center rounded-xl bg-muted text-foreground transition-colors hover:bg-primary hover:text-white" title="Share"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={async () => {
                      if (confirm("Are you sure you want to delete this resume?")) {
                        await deleteResume({ data: r.id });
                        setResumes(resumes.filter(res => res.id !== r.id));
                      }
                    }}
                    className="flex h-10 items-center justify-center rounded-xl bg-muted text-foreground transition-colors hover:bg-red-500 hover:text-white" title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tools Hub */}
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold flex items-center gap-2">Power Tools <span className="pill-amber bg-amber-100 text-amber-700">Premium</span></h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            
            {/* GitHub Import */}
            <Link to="/import-project" className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-soft transition-all hover:-translate-y-1 hover:ring-2 hover:ring-emerald-500">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl transition-colors group-hover:bg-emerald-500/20" />
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 ring-1 ring-emerald-500/20 shadow-sm transition-transform group-hover:scale-110 group-hover:shadow-glow">
                 <Github className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-lg">AI Project Import</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">Paste a GitHub URL and let AI generate your resume entry automatically.</p>
            </Link>

            {/* Library */}
            <Link to="/library" className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-soft transition-all hover:-translate-y-1 hover:ring-2 hover:ring-indigo-500">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl transition-colors group-hover:bg-indigo-500/20" />
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 ring-1 ring-indigo-500/20 shadow-sm transition-transform group-hover:scale-110 group-hover:shadow-glow">
                 <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-lg">Project Library</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">Manage your imported GitHub projects and custom assets in one place.</p>
            </Link>

            {/* Optimizer */}
            <Link to="/optimizer" className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-soft transition-all hover:-translate-y-1 hover:ring-2 hover:ring-amber-500">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl transition-colors group-hover:bg-amber-500/20" />
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 ring-1 ring-amber-500/20 shadow-sm transition-transform group-hover:scale-110 group-hover:shadow-glow">
                 <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-lg">Skill Gap Scanner</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">Get an instant match score for your resume against any job description.</p>
            </Link>

            {/* Upload */}
            <Link to="/upload" className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-soft transition-all hover:-translate-y-1 hover:ring-2 hover:ring-primary">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-colors group-hover:bg-primary/20" />
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary ring-1 ring-primary/20 shadow-sm transition-transform group-hover:scale-110 group-hover:shadow-glow">
                 <Upload className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-lg">Upload & Optimize</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">Drop your existing PDF/DOCX and let AI improve it instantly.</p>
            </Link>

          </div>

          {/* Mobile FAB */}
          <Link to="/editor/$id" params={{ id: "new" }} className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-glow md:hidden z-50 hover:scale-105 transition-transform">
            <Plus className="h-6 w-6" />
          </Link>
        </div>
      </div>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        link={shareLink} 
      />
    </AppShell>
  );
}

function Stat({ icon, label, value, trend, color = "primary" }: { icon: React.ReactNode; label: string; value: string; trend?: string; color?: "primary" | "indigo" | "amber" }) {
  const colorMap = {
    primary: { bg: "bg-primary-soft", text: "text-primary", pill: "pill-green" },
    indigo: { bg: "bg-indigo-100", text: "text-indigo-600", pill: "bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5 text-[10px] font-bold" },
    amber: { bg: "bg-amber-100", text: "text-amber-600", pill: "bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 text-[10px] font-bold" },
  };
  const c = colorMap[color];

  return (
    <div className="card-soft relative overflow-hidden p-6 ring-1 ring-border shadow-soft transition-transform hover:-translate-y-1">
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
          <span className="flex items-center gap-3">
             <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg} ${c.text}`}>{icon}</div>
             {label}
          </span>
          {trend && <span className={c.pill}>{trend}</span>}
        </div>
        <p className="text-4xl font-extrabold text-foreground ml-1">{value}</p>
      </div>
    </div>
  );
}
