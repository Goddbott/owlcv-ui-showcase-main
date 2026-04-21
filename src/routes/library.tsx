import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppSidebar";
import { Github, Search, Filter, Trash2, Edit3, ExternalLink, Plus, BookOpen, Clock, Tag } from "lucide-react";

export const Route = createFileRoute("/library")({
  component: Library,
});

interface SavedProject {
  id: string;
  title: string;
  description: string[];
  techStack: string[];
  repoUrl?: string;
  importedAt: string;
}

function Library() {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("owlcv_imported_projects");
    if (saved) {
      setProjects(JSON.parse(saved));
    }
  }, []);

  const handleDelete = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem("owlcv_imported_projects", JSON.stringify(updated));
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.techStack.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
             <button className="btn-primary text-xs"><Plus className="h-3.5 w-3.5" /> Add Manual Entry</button>
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
              <Link to="/import-project" className="btn-primary mt-6"><Github className="h-4 w-4" /> Import First Project</Link>
           </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <div key={project.id} className="card-soft group flex flex-col p-6 transition-all hover:shadow-card hover:border-primary/30">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Github className="h-5 w-5" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:text-primary transition-colors"><Edit3 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(project.id)} className="p-2 hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{project.title}</h3>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {project.description[0]}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="pill-green py-0.5 px-2 text-[10px]">{tech}</span>
                  ))}
                </div>

                <div className="mt-auto pt-6 flex items-center justify-between border-t border-border mt-6">
                   <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> Imported {new Date(project.importedAt).toLocaleDateString()}
                   </div>
                   {project.repoUrl && (
                      <a href={`https://${project.repoUrl}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">
                        Repo <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
