import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Github, Loader2, Sparkles, Check, AlertCircle, Plus, Terminal, FileText, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/AppSidebar";
import { parseGitHubUrl, fetchRepoInfo, fetchReadme, fetchFileTree } from "@/lib/github-api";
import { generateProjectEntry, type AIGeneratedProject } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";
import { createProject } from "@/server/functions";

export const Route = createFileRoute("/import-project")({
  component: ImportProject,
});

function ImportProject() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "fetching" | "processing" | "preview" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<AIGeneratedProject | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate({ to: "/signin" });
        return;
      }
      setUser(session.user);
    });
  }, [navigate]);

  const handleImport = async () => {
    setError(null);
    const parsed = parseGitHubUrl(url);
    
    if (!parsed) {
      setError("Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)");
      return;
    }

    try {
      setStatus("fetching");
      const repoInfo = await fetchRepoInfo(parsed.owner, parsed.repo);
      const readme = await fetchReadme(parsed.owner, parsed.repo);
      const fileTree = await fetchFileTree(parsed.owner, parsed.repo, repoInfo.default_branch);

      setStatus("processing");
      const generated = await generateProjectEntry(repoInfo.name, readme, fileTree);
      
      setProject(generated);
      setStatus("preview");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setStatus("idle");
    }
  };

  const handleSave = async () => {
    if (!project || !user) return;
    setStatus("saving");
    
    try {
      await createProject({
        data: {
          user_id: user.id,
          title: project.title,
          description: project.description,
          techStack: project.techStack,
          repoUrl: url || undefined,
        },
      });
      navigate({ to: "/library" });
    } catch (err) {
      console.error("Failed to save project:", err);
      setError("Failed to save project. Please try again.");
      setStatus("preview");
    }
  };

  return (
    <AppShell>
      <div className="relative min-h-screen pb-20">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.95_0.08_145)_0%,transparent_70%)] opacity-60 pointer-events-none" />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-3 w-3" /> Back to Dashboard
        </Link>
        
        <div className="mt-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2"><span className="pill-green"><Sparkles className="h-3 w-3" /> AI Powered</span></div>
          <h1 className="text-3xl font-extrabold tracking-tight">Import GitHub Project</h1>
          <p className="text-sm text-muted-foreground">Turn any repository into a professional resume project entry in seconds.</p>
        </div>

        {status === "idle" || status === "fetching" || status === "processing" ? (
          <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`card-soft relative overflow-hidden p-12 text-center transition-all shadow-sm hover:shadow-glow group ${status !== 'idle' ? 'opacity-50 pointer-events-none' : ''}`}>
               <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
               <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary transition-transform group-hover:scale-110 shadow-sm group-hover:shadow-glow">
                  <Github className="h-10 w-10" />
               </div>
               <h2 className="text-lg font-bold">Paste Repository URL</h2>
               <p className="mt-1 text-xs text-muted-foreground">Public repositories only. We'll analyze the code and content.</p>
               
               <div className="mt-8 flex flex-col gap-4 max-w-xl mx-auto">
                  <div className="relative group">
                    <input 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://github.com/facebook/react" 
                      className="w-full rounded-2xl border border-border bg-surface px-6 py-5 text-base font-mono shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10" 
                    />
                    <Terminal className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  </div>
                  
                  {error && (
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-destructive animate-in shake duration-300">
                      <AlertCircle className="h-3.5 w-3.5" /> {error}
                    </div>
                  )}

                  <button 
                    onClick={handleImport}
                    disabled={!url || status !== 'idle'} 
                    className="w-full rounded-full gradient-emerald py-4 text-sm font-bold mt-2 text-white shadow-glow hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" /> Generate Resume Entry
                  </button>
               </div>
            </div>

            {(status === "fetching" || status === "processing") && (
              <div className="mt-8 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                 <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow-soft">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                 </div>
                 <div className="text-center">
                    <p className="text-sm font-bold uppercase tracking-widest text-primary">
                       {status === "fetching" ? "Accessing Repository..." : "Analyzing with AI..."}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                        {status === "fetching" ? "Validating visibility and reading README" : "Generating ATS-optimized descriptions and tech stack"}
                    </p>
                 </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-sm">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight">Generated Project</h2>
                        <p className="text-xs text-muted-foreground mt-1">Review and edit before saving to your library.</p>
                    </div>
                </div>
                <button onClick={() => setStatus("idle")} className="btn-ghost text-xs hover:bg-muted font-bold"><X className="h-4 w-4" /> Start Over</button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
                <div className="space-y-6">
                    <div className="card-soft p-8 space-y-8 ring-1 ring-border shadow-sm">
                        <div>
                            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Project Title</label>
                            <input 
                              value={project?.title} 
                              onChange={(e) => setProject(p => p ? {...p, title: e.target.value} : null)}
                              className="w-full rounded-xl border border-transparent bg-muted/50 text-xl font-extrabold focus:border-primary focus:bg-transparent focus:outline-none focus:ring-4 focus:ring-primary/10 py-3 px-4 transition-all" 
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Resume Descriptions (Bullet Points)</label>
                            <div className="space-y-3">
                                {project?.description.map((bullet, idx) => (
                                    <div key={idx} className="relative group">
                                        <textarea 
                                          value={bullet} 
                                          rows={2}
                                          onChange={(e) => {
                                            const newBullets = [...(project?.description || [])];
                                            newBullets[idx] = e.target.value;
                                            setProject(p => p ? {...p, description: newBullets} : null);
                                          }}
                                          className="input-base pr-10 py-3 resize-none bg-surface hover:bg-muted/30 focus:bg-surface focus:ring-2 focus:ring-primary/20 transition-all text-sm leading-relaxed" 
                                        />
                                        <button 
                                          onClick={() => {
                                            const newBullets = project?.description.filter((_, i) => i !== idx) || [];
                                            setProject(p => p ? {...p, description: newBullets} : null);
                                          }}
                                          className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                                <button 
                                  onClick={() => setProject(p => p ? {...p, description: [...p.description, ""]} : null)}
                                  className="flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed border-border rounded-xl text-xs font-bold text-muted-foreground hover:border-primary hover:text-primary transition-all"
                                >
                                    <Plus className="h-3 w-3" /> Add bullet point
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tech Stack</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {project?.techStack.map((tag, idx) => (
                                    <span key={idx} className="pill-green py-1.5 px-3">
                                        {tag}
                                        <button onClick={() => setProject(p => p ? {...p, techStack: p.techStack.filter((_, i) => i !== idx)} : null)} className="ml-1.5 hover:text-destructive"><X className="h-3 w-3" /></button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input id="new-tag" placeholder="Add technology..." className="input-base text-xs py-2" onKeyDown={(e) => {
                                    if(e.key === 'Enter') {
                                        const val = (e.currentTarget as HTMLInputElement).value;
                                        if(val) {
                                            setProject(p => p ? {...p, techStack: [...p.techStack, val]} : null);
                                            (e.currentTarget as HTMLInputElement).value = "";
                                        }
                                    }
                                }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="card-soft p-8 bg-gradient-to-br from-surface-2 to-surface border-primary/20 ring-1 ring-primary/10 shadow-soft">
                        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-primary uppercase tracking-widest">
                            <FileText className="h-4 w-4" /> Entry Summary
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            This entry will be saved to your reusable project library. You can insert it into any future resume with one click.
                        </p>
                        <div className="mt-8 space-y-3">
                            <button 
                              onClick={handleSave}
                              disabled={status === 'saving'}
                              className="w-full rounded-full gradient-emerald py-4 text-sm font-bold text-white shadow-glow hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                            >
                                {status === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4" /> Save to Library</>}
                            </button>
                            <button disabled={status === 'saving'} onClick={() => setStatus("idle")} className="btn-outline w-full py-3 text-xs font-bold">Discard</button>
                        </div>
                    </div>

                    <div className="card-soft p-6 border-amber-500/20 bg-amber-50/20">
                         <h3 className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">Pro Tip</h3>
                         <p className="text-[11px] text-amber-600/80 leading-relaxed">
                            ATS systems love action verbs. Start your descriptions with words like "Led", "Developed", or "Optimized".
                         </p>
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </AppShell>
  );
}
