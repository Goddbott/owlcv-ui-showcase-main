import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppSidebar";
import { Github, Search, Filter, Trash2, Edit3, ExternalLink, Plus, BookOpen, Clock, Tag, X, Loader2, FolderOpen, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getProjects, deleteProject, createProject, updateProject } from "@/server/functions";

export const Route = createFileRoute("/library")({
  component: Library,
});

/** Extract a short label from a GitHub URL, e.g. "owner/repo" */
function repoTag(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    const parts = u.pathname.replace(/^\//, "").replace(/\.git$/, "").split("/");
    if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
    if (parts.length === 1 && parts[0]) return parts[0];
  } catch { /* ignore */ }
  return "Repo";
}

function Library() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);

  useEffect(() => {
    const fetchSessionAndData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.navigate({ to: "/signin" });
        return;
      }

      setUser(session.user);

      try {
        const projectsData = await getProjects({ data: session.user.id });
        if (projectsData) {
          setProjects(projectsData);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }

      setLoading(false);
    };

    fetchSessionAndData();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject({ data: id });
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const handleProjectCreated = (newProject: any) => {
    setProjects([newProject, ...projects]);
    setShowAddModal(false);
  };

  const handleProjectUpdated = (updated: any) => {
    setProjects(projects.map(p => p.id === updated.id ? updated : p));
    setEditingProject(null);
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (Array.isArray(p.techStack) && p.techStack.some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-6 py-6 md:px-10 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Project Library</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your imported GitHub projects and custom entries.</p>
          </div>
          <div className="flex gap-2">
             <Link to="/import-project" className="btn-outline text-xs"><Github className="h-3.5 w-3.5" /> Import from GitHub</Link>
             <button onClick={() => setShowAddModal(true)} className="btn-primary text-xs"><Plus className="h-3.5 w-3.5" /> Add Manual Entry</button>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search by title or tech stack..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-base pl-10" 
              />
           </div>
           <button className="btn-outline px-4 py-2 text-xs"><Filter className="h-3.5 w-3.5" /> Filter</button>
        </div>

        {filteredProjects.length === 0 ? (
           <div className="mt-12 text-center py-20 card-soft bg-surface-2/30 border-dashed">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                 <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold">No projects found</h3>
              <p className="text-sm text-muted-foreground mt-1">Start by importing a project from GitHub or add one manually.</p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link to="/import-project" className="btn-outline text-xs"><Github className="h-4 w-4" /> Import from GitHub</Link>
                <button onClick={() => setShowAddModal(true)} className="btn-primary text-xs"><Plus className="h-4 w-4" /> Add Manual Entry</button>
              </div>
           </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <div key={project.id} className="card-soft group flex flex-col p-6 transition-all hover:shadow-card hover:border-primary/30">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {project.repoUrl ? <Github className="h-5 w-5" /> : <FolderOpen className="h-5 w-5" />}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingProject(project)} className="p-2 hover:text-primary transition-colors"><Edit3 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(project.id)} className="p-2 hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{project.title}</h3>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {Array.isArray(project.description) ? project.description[0] : ""}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {Array.isArray(project.techStack) && project.techStack.map((tech: string) => (
                    <span key={tech} className="pill-green py-0.5 px-2 text-[10px]">{tech}</span>
                  ))}
                </div>

                <div className="mt-auto pt-6 flex items-center justify-between border-t border-border mt-6">
                   <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> {new Date(project.imported_at).toLocaleDateString()}
                   </div>
                   {project.repoUrl && (
                      <a
                        href={project.repoUrl.startsWith('http') ? project.repoUrl : `https://${project.repoUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#24292f] px-2.5 py-1 text-[10px] font-bold text-white hover:bg-[#3a3f47] transition-colors"
                      >
                        <Github className="h-3 w-3" />
                        {repoTag(project.repoUrl)}
                      </a>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Manual Entry Modal */}
      {showAddModal && user && (
        <ProjectFormModal
          mode="add"
          userId={user.id}
          onClose={() => setShowAddModal(false)}
          onSaved={handleProjectCreated}
        />
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <ProjectFormModal
          mode="edit"
          userId={user?.id}
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSaved={handleProjectUpdated}
        />
      )}
    </AppShell>
  );
}

/* ─── Shared Add / Edit Project Modal ──────────────────────────── */

interface ProjectFormModalProps {
  mode: "add" | "edit";
  userId: string;
  project?: any;
  onClose: () => void;
  onSaved: (project: any) => void;
}

function ProjectFormModal({ mode, userId, project, onClose, onSaved }: ProjectFormModalProps) {
  const [title, setTitle] = useState(project?.title ?? "");
  const [bullets, setBullets] = useState<string[]>(
    project?.description && Array.isArray(project.description) && project.description.length > 0
      ? project.description
      : [""]
  );
  const [techInput, setTechInput] = useState("");
  const [techStack, setTechStack] = useState<string[]>(
    project?.techStack && Array.isArray(project.techStack) ? project.techStack : []
  );
  const [repoUrl, setRepoUrl] = useState(project?.repoUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEdit = mode === "edit";
  const heading = isEdit ? "Edit Project" : "Add Manual Project";
  const subtext = isEdit ? "Update your project details below." : "Enter your project details below.";
  const saveLabel = isEdit ? "Save Changes" : "Save Project";
  const savingLabel = "Saving...";

  const handleAddBullet = () => setBullets([...bullets, ""]);

  const handleRemoveBullet = (idx: number) => {
    if (bullets.length <= 1) return;
    setBullets(bullets.filter((_, i) => i !== idx));
  };

  const handleBulletChange = (idx: number, value: string) => {
    const updated = [...bullets];
    updated[idx] = value;
    setBullets(updated);
  };

  const handleAddTech = (value: string) => {
    const tag = value.trim();
    if (tag && !techStack.includes(tag)) {
      setTechStack([...techStack, tag]);
    }
    setTechInput("");
  };

  const handleRemoveTech = (tag: string) => {
    setTechStack(techStack.filter(t => t !== tag));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Project title is required.");
      return;
    }
    const description = bullets.filter(b => b.trim());
    if (description.length === 0) {
      setError("At least one description bullet is required.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      if (isEdit && project) {
        const updated = await updateProject({
          data: {
            id: project.id,
            title: title.trim(),
            description,
            techStack,
          },
        });
        onSaved(updated);
      } else {
        const created = await createProject({
          data: {
            user_id: userId,
            title: title.trim(),
            description,
            techStack,
            repoUrl: repoUrl.trim() || undefined,
          },
        });
        onSaved(created);
      }
    } catch (err) {
      console.error(`Failed to ${isEdit ? "update" : "create"} project:`, err);
      setError(`Failed to ${isEdit ? "update" : "save"} project. Please try again.`);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 rounded-2xl border border-border bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/95 backdrop-blur-sm px-8 py-5 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">{heading}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{subtext}</p>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-7">

          {/* Project Title */}
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Project Title <span className="text-destructive">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. E-Commerce Dashboard"
              className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-base font-bold placeholder:font-normal placeholder:text-muted-foreground/50 focus:border-primary focus:bg-transparent focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </div>

          {/* Description Bullets */}
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Description (Bullet Points) <span className="text-destructive">*</span>
            </label>
            <div className="space-y-3">
              {bullets.map((bullet, idx) => (
                <div key={idx} className="relative group">
                  <textarea
                    value={bullet}
                    rows={2}
                    onChange={(e) => handleBulletChange(idx, e.target.value)}
                    placeholder={idx === 0 ? "e.g. Developed a full-stack dashboard with real-time analytics..." : "Add another detail..."}
                    className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 pr-10 text-sm leading-relaxed resize-none placeholder:text-muted-foreground/50 focus:border-primary focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                  {bullets.length > 1 && (
                    <button
                      onClick={() => handleRemoveBullet(idx)}
                      className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddBullet}
                className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-border rounded-xl text-xs font-bold text-muted-foreground hover:border-primary hover:text-primary transition-all"
              >
                <Plus className="h-3 w-3" /> Add bullet point
              </button>
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Tech Stack
            </label>
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {techStack.map((tag) => (
                  <span key={tag} className="pill-green py-1.5 px-3 flex items-center gap-1.5">
                    {tag}
                    <button onClick={() => handleRemoveTech(tag)} className="hover:text-destructive transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTech(techInput);
                }
              }}
              placeholder="Type a technology and press Enter (e.g. React, Node.js)"
              className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>

          {/* Repository URL (optional) — only shown for new projects or projects that have one */}
          {(!isEdit || repoUrl) && (
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Repository URL <span className="text-[10px] font-medium normal-case tracking-normal text-muted-foreground/60">(optional)</span>
              </label>
              <input
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/project"
                disabled={isEdit}
                className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm font-mono placeholder:font-sans placeholder:text-muted-foreground/50 focus:border-primary focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-xs font-bold text-destructive bg-destructive/5 rounded-xl px-4 py-3">
              <X className="h-3.5 w-3.5 shrink-0" /> {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-surface/95 backdrop-blur-sm px-8 py-5 rounded-b-2xl">
          <button onClick={onClose} disabled={saving} className="btn-outline px-5 py-2.5 text-xs font-bold">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 shadow-glow disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {saving ? savingLabel : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
