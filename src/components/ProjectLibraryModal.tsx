import React, { useState, useEffect } from "react";
import { X, BookOpen, Loader2, Slider, Check, Github } from "lucide-react";
import { summarizeProjectForResume } from "@/lib/gemini";

interface SavedProject {
  id: string;
  title: string;
  description: string[];
  techStack: string[];
  repoUrl?: string;
  importedAt: string;
}

interface ProjectLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (project: any) => void;
}

export function ProjectLibraryModal({ isOpen, onClose, onImport }: ProjectLibraryModalProps) {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<SavedProject | null>(null);
  const [bulletCount, setBulletCount] = useState<number>(3);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem("owlcv_imported_projects");
      if (saved) {
        setProjects(JSON.parse(saved));
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImport = async () => {
    if (!selectedProject) return;
    
    setIsProcessing(true);
    try {
      const bullets = await summarizeProjectForResume(selectedProject, bulletCount);
      
      onImport({
        name: selectedProject.title,
        url: selectedProject.repoUrl ? (selectedProject.repoUrl.startsWith('http') ? selectedProject.repoUrl : `https://${selectedProject.repoUrl}`) : "",
        description: bullets.join(". "), // The resume preview expects a string separated by newlines or periods depending on the parser. 
        // Wait, the Resume Preview `Job` component splits by '.' but the editor has a textarea that takes a single string.
        // Actually, we should just join them with newlines or periods so the user can edit them in the textarea.
        // The Job component splits by '.' and trims. So let's join with '.' and space.
        // Or better, let's look at `AIEnhanceButton.tsx` or how `Job` works. 
        // `Job` component in editor.$id.tsx: `bullets={exp.description.split('.').filter(b => b.trim()).map(b => b.trim())}`
        // So joining with '.' is correct.
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-border w-full max-w-2xl rounded-2xl shadow-card overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-surface-2/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Import from Library</h2>
              <p className="text-xs text-muted-foreground">Select a project and let AI optimize it for your resume.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {projects.length === 0 ? (
            <div className="text-center py-12">
               <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
               <p className="text-sm font-semibold">Your library is empty</p>
               <p className="text-xs text-muted-foreground mt-1">Go to the GitHub Import tab to add projects.</p>
            </div>
          ) : (
            <div className="space-y-4">
               {projects.map(proj => (
                 <div 
                   key={proj.id} 
                   onClick={() => setSelectedProject(proj)}
                   className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedProject?.id === proj.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-surface-2/30'}`}
                 >
                   <div className="flex items-start gap-3">
                      <Github className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <h3 className="text-sm font-bold">{proj.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{proj.description[0]}</p>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {proj.techStack.slice(0, 4).map(t => <span key={t} className="text-[10px] bg-muted px-2 py-0.5 rounded-md text-muted-foreground">{t}</span>)}
                          {proj.techStack.length > 4 && <span className="text-[10px] bg-muted px-2 py-0.5 rounded-md text-muted-foreground">+{proj.techStack.length - 4}</span>}
                        </div>
                      </div>
                   </div>
                 </div>
               ))}
            </div>
          )}
        </div>

        {/* Footer Settings & Action */}
        {selectedProject && (
          <div className="p-6 border-t border-border bg-surface-2/30 space-y-5 animate-in slide-in-from-bottom-4">
             <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-foreground">Bullet Points: {bulletCount}</label>
                  <span className="text-[10px] text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">ATS Optimized</span>
                </div>
                <input 
                  type="range" 
                  min={1} 
                  max={6} 
                  value={bulletCount} 
                  onChange={(e) => setBulletCount(parseInt(e.target.value))}
                  className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                   <span>Concise (1)</span>
                   <span>Detailed (6)</span>
                </div>
             </div>

             <button 
               onClick={handleImport} 
               disabled={isProcessing}
               className="btn-primary w-full py-3.5 text-sm font-bold shadow-glow"
             >
                {isProcessing ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin inline" /> Generating ATS Bullets...</>
                ) : (
                  <><Check className="h-4 w-4 mr-2 inline" /> Import & Optimize Project</>
                )}
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
