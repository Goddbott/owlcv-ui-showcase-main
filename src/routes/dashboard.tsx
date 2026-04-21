import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Plus, Edit, Eye, Share2, Trash2, Upload, FileText, Eye as EyeIcon, Download, Sparkles, Github, BookOpen, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppSidebar";
import { ResumeThumb } from "@/components/ResumeThumb";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — OwlCV" }, { name: "description", content: "Manage your resumes and track activity." }] }),
  component: Dashboard,
});

function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionAndData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.navigate({ to: "/signin" });
        return;
      }

      setUser(session.user);

      // Fetch resumes for this user
      const { data: resumesData, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", session.user.id)
        .order("updated_at", { ascending: false });

      if (!error && resumesData) {
        setResumes(resumesData);
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
      <div className="px-6 py-6 md:px-10 md:py-10">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">Good morning, {firstName} 👋</h1>
            <p className="mt-1 text-sm text-muted-foreground">Here's what's happening with your resumes today.</p>
          </div>
          <Link to="/editor/$id" params={{ id: "new" }} className="btn-primary"><Plus className="h-4 w-4" /> Create New Resume</Link>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={<FileText className="h-4 w-4" />} label="Total Resumes" value={resumes.length.toString()} />
          <Stat icon={<EyeIcon className="h-4 w-4" />} label="Profile Views" value="128" trend="+12%" />
          <Stat icon={<Download className="h-4 w-4" />} label="Downloads" value="24" trend="+4" />
          <div className="card-soft p-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Profile Strength</span>
              <span className="pill-green">Great</span>
            </div>
            <p className="mt-3 text-3xl font-extrabold">80%</p>
            <div className="mt-3 h-2 rounded-full bg-muted">
              <div className="h-full w-[80%] rounded-full bg-primary" />
            </div>
          </div>
        </div>

        {/* My Resumes */}
        <div className="mt-12 flex items-center justify-between">
          <h2 className="text-xl font-extrabold">My Resumes</h2>
          <Link to="/templates" className="text-sm font-semibold text-primary hover:underline">Browse templates →</Link>
        </div>

        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((r) => (
            <div key={r.id} className="card-soft group overflow-hidden p-4 transition-transform hover:-translate-y-1">
              <ResumeThumb accent={r.content?.accent || "emerald"} className="!aspect-[4/5]" />
              <div className="mt-4 flex items-start justify-between">
                <div>
                  <p className="font-bold">{r.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Updated {new Date(r.updated_at).toLocaleDateString()}</p>
                </div>
                <span className="pill-green">{r.content?.template || "Modern"}</span>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                <Link to="/editor/$id" params={{ id: r.id }} className="flex items-center justify-center rounded-lg bg-muted py-2 text-foreground hover:bg-primary-soft hover:text-primary" title="Edit"><Edit className="h-4 w-4" /></Link>
                <Link to="/r/$username" params={{ username: user?.user_metadata?.username || "user" }} className="flex items-center justify-center rounded-lg bg-muted py-2 hover:bg-primary-soft hover:text-primary" title="Preview"><Eye className="h-4 w-4" /></Link>
                <button className="flex items-center justify-center rounded-lg bg-muted py-2 hover:bg-primary-soft hover:text-primary" title="Share"><Share2 className="h-4 w-4" /></button>
                <button 
                  onClick={async () => {
                    if (confirm("Are you sure you want to delete this resume?")) {
                      await supabase.from("resumes").delete().eq("id", r.id);
                      setResumes(resumes.filter(res => res.id !== r.id));
                    }
                  }}
                  className="flex items-center justify-center rounded-lg bg-muted py-2 hover:bg-red-50 hover:text-destructive" title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Create new card */}
          <Link to="/editor/$id" params={{ id: "new" }} className="card-soft flex min-h-[380px] flex-col items-center justify-center gap-3 border-2 border-dashed border-primary/40 bg-primary-soft/20 p-8 text-center transition-colors hover:bg-primary-soft/40">
            <span className="text-5xl">🦉</span>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-glow"><Plus className="h-5 w-5" /></div>
            <p className="font-bold">Start from scratch</p>
            <p className="text-xs text-muted-foreground">Pick a template and start fresh</p>
          </Link>

          {/* GitHub Import */}
          <Link to="/import-project" className="card-soft flex min-h-[380px] flex-col items-center justify-center gap-3 border-2 border-emerald-500/30 bg-emerald-500/5 p-8 text-center transition-all hover:bg-emerald-500/10 hover:border-emerald-500/50">
            <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-glow animate-pulse">
               <Github className="h-10 w-10" />
            </div>
            <p className="font-extrabold text-lg">AI Project Import</p>
            <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">Paste a GitHub URL and let AI generate your resume entry automatically.</p>
            <div className="mt-4 pill-green py-1.5 px-4 bg-emerald-100 text-emerald-700">New Feature</div>
          </Link>

          {/* Library */}
          <Link to="/library" className="card-soft flex min-h-[380px] flex-col items-center justify-center gap-3 border-2 border-indigo-500/30 bg-indigo-500/5 p-8 text-center transition-all hover:bg-indigo-500/10 hover:border-indigo-500/50">
            <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-glow">
               <BookOpen className="h-10 w-10" />
            </div>
            <p className="font-extrabold text-lg">Project Library</p>
            <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">Manage your imported GitHub projects and custom assets in one place.</p>
            <div className="mt-4 pill-green py-1.5 px-4 bg-indigo-100 text-indigo-700">Manage Assets</div>
          </Link>

          {/* Optimizer */}
          <Link to="/optimizer" className="card-soft flex min-h-[380px] flex-col items-center justify-center gap-3 border-2 border-amber-500/30 bg-amber-500/5 p-8 text-center transition-all hover:bg-amber-500/10 hover:border-amber-500/50">
            <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-glow">
               <Zap className="h-10 w-10" />
            </div>
            <p className="font-extrabold text-lg">ATS Optimizer</p>
            <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">Get an instant match score for your resume against any job description.</p>
            <div className="mt-4 pill-green py-1.5 px-4 bg-amber-100 text-amber-700">Check Score</div>
          </Link>

          {/* Upload */}
          <Link to="/upload" className="card-soft flex min-h-[380px] flex-col items-center justify-center gap-3 p-8 text-center transition-colors hover:border-primary">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-soft text-amber"><Upload className="h-5 w-5" /></div>
            <p className="font-bold">Upload & Optimize</p>
            <p className="text-xs text-muted-foreground">Drop your existing PDF/DOCX and let AI improve it</p>
            <button className="btn-primary mt-2"><Upload className="h-4 w-4" /> Upload Now</button>
          </Link>
        </div>

        {/* Mobile FAB */}
        <Link to="/editor/$id" params={{ id: "new" }} className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-glow md:hidden">
          <Plus className="h-6 w-6" />
        </Link>
      </div>
    </AppShell>
  );
}

function Stat({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string; trend?: string }) {
  return (
    <div className="card-soft p-5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-2 text-primary">{icon} {label}</span>
        {trend && <span className="pill-green">{trend}</span>}
      </div>
      <p className="mt-3 text-3xl font-extrabold">{value}</p>
    </div>
  );
}
