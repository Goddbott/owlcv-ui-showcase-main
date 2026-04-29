import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Camera, Sparkles, Plus, Download, Share2, ChevronRight, ChevronLeft, X, Trash2, Save, BookOpen, ZoomIn, ZoomOut, Edit } from "lucide-react";
import { AppShell } from "@/components/AppSidebar";
import { ResumeThumb } from "@/components/ResumeThumb";
import { useResume, ResumeData, Experience, Project, Education, Certification, SkillCategory } from "@/hooks/use-resume";

import { AIEnhanceButton } from "@/components/AIEnhanceButton";
import { ProjectLibraryModal } from "@/components/ProjectLibraryModal";
import { supabase } from "@/lib/supabase";
import { getResume, createResume, updateResume } from "@/server/functions";
import { ShareModal } from "@/components/ShareModal";
import { formatDateRange } from "@/lib/date";

export const Route = createFileRoute("/editor/$id")({
  head: () => ({ meta: [{ title: "Resume Editor — OwlCV" }, { name: "description", content: "Edit your resume with AI suggestions." }] }),
  component: Editor,
});

const sections = ["Personal Info", "Education", "Work Experience", "Positions of Responsibility", "Certifications", "Coding Profiles", "Projects", "Skills", "Achievements"] as const;
type SectionType = typeof sections[number];

function Editor() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { 
    data, 
    setData, 
    updatePersonal, 
    addExperience, 
    updateExperience, 
    removeExperience, 
    addPor,
    updatePor,
    removePor,
    addEducation, 
    updateEducation, 
    removeEducation, 
    addCertification, 
    updateCertification, 
    removeCertification, 
    addSkillCategory, 
    updateSkillCategory, 
    removeSkillCategory, 
    addProject, 
    updateProject, 
    removeProject, 
    addAchievement, 
    updateAchievement, 
    removeAchievement, 
    addCodingProfile, 
    updateCodingProfile, 
    removeCodingProfile,
    setAccent,
    setTemplate,
    updateSettings
  } = useResume();
  const [activeSection, setActiveSection] = useState<SectionType>("Personal Info");
  const [skillInput, setSkillInput] = useState("");
  const [title, setTitle] = useState("Software Engineer Resume");
  const [saving, setSaving] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [splitPercent, setSplitPercent] = useState(38);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewPaneRef = useRef<HTMLDivElement>(null);
  const [baseScale, setBaseScale] = useState(1);
  const [userZoom, setUserZoom] = useState(1);
  const previewScale = baseScale * userZoom;

  useEffect(() => {
    if (!previewPaneRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      // A4 width is ~794px. We subtract some padding to ensure it fits comfortably.
      const targetScale = Math.min(1, (width - 64) / 794);
      setBaseScale(targetScale);
    });
    observer.observe(previewPaneRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.min(70, Math.max(20, pct)));
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, []);

  useEffect(() => {
    async function loadResume() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.navigate({ to: "/signin" });
        return;
      }
      if (id !== "new") {
        try {
          const resume = await getResume({ data: id });
          if (resume && resume.content) {
            setData({
              ...(resume.content as any),
              settings: (resume.content as any).settings || {
                fontSize: 11,
                lineHeight: 1.5,
                letterSpacing: 0,
                fontFamily: "Inter",
                padding: 32,
              }
            });
            setTitle(resume.title);
          }
        } catch (error) {
          console.error("Failed to load resume:", error);
        }
      } else {
        const searchParams = new URLSearchParams(window.location.search);
        const templateParam = searchParams.get("template");
        if (templateParam) {
           setData(prev => ({ ...prev, template: templateParam as any }));
        }
      }
    }
    loadResume();
  }, [id, router, setData]);

  const handleSave = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    let thumbnail = data.thumbnail;
    try {
      const element = document.getElementById('resume-preview-root');
      if (element) {
        const html2canvasModule = await import('html2canvas');
        const html2canvas = html2canvasModule.default || html2canvasModule;
        const canvas = await html2canvas(element, { scale: 0.3, useCORS: true, logging: false });
        thumbnail = canvas.toDataURL('image/jpeg', 0.5);
      }
    } catch (e) {
      console.error("Failed to generate thumbnail", e);
    }

    // Strip out local logo object URL before saving to database
    const dataToSave = {
      ...data,
      thumbnail,
      personal: {
        ...data.personal,
        collegeLogo: undefined
      }
    };

    if (id === "new") {
      try {
        const inserted = await createResume({
          data: {
            user_id: session.user.id,
            title,
            content: dataToSave
          }
        });
        if (inserted) {
          router.navigate({ to: `/editor/${inserted.id}` });
        }
      } catch (error) {
        console.error("Failed to save resume:", error);
      }
    } else {
      try {
        await updateResume({
          data: {
            id,
            title,
            content: dataToSave,
          }
        });
      } catch (error) {
        console.error("Failed to update resume:", error);
      }
    }
    setSaving(false);
  };

  const currentIndex = sections.indexOf(activeSection);
  const nextSection = () => {
    if (currentIndex < sections.length - 1) setActiveSection(sections[currentIndex + 1]);
  };
  const prevSection = () => {
    if (currentIndex > 0) setActiveSection(sections[currentIndex - 1]);
  };

  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('resume-preview-root');
    if (!element) return;
    setDownloading(true);

    try {
      // We use a hidden iframe to print seamlessly without opening a new tab or freezing the page with html2canvas.
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const contentWindow = iframe.contentWindow;
      if (!contentWindow) throw new Error('Iframe failed to load');

      // Get all current styles to ensure it looks identical
      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(s => s.outerHTML).join('\n');

      contentWindow.document.open();
      contentWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title.replace(/[^a-zA-Z0-9]/g, '_')}</title>
            ${styles}
            <style>
              @page { size: A4; margin: 0; }
              body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .resume-preview-container { box-shadow: none !important; border: none !important; }
            </style>
          </head>
          <body>${element.innerHTML}</body>
        </html>
      `);
      contentWindow.document.close();

      // Wait a tiny bit for the browser to render the styles inside the iframe
      await new Promise(resolve => setTimeout(resolve, 300));
      
      contentWindow.focus();
      contentWindow.print();
      
      // Clean up after print dialog closes
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    } catch (err) {
      console.error('Print failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleLibraryImport = (importedProject: any) => {
    const newProject = {
      id: Math.random().toString(36).substr(2, 9),
      name: importedProject.name,
      url: importedProject.url,
      description: importedProject.description,
      techStack: importedProject.techStack || ""
    };
    
    if (data.projects.length === 1 && data.projects[0].name === "") {
      setData({ ...data, projects: [newProject] });
    } else {
      setData({ ...data, projects: [...data.projects, newProject] });
    }
  };

  return (
    <AppShell>
      <div ref={containerRef} className="flex min-h-[calc(100vh-3.5rem)] md:min-h-screen">
        {/* LEFT FORM PANEL */}
        <div className="relative border-b border-border md:border-b-0 md:overflow-y-auto md:h-screen bg-surface/80 backdrop-blur z-10" style={{ width: `${splitPercent}%`, minWidth: '280px' }}>
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.95_0.08_145)_0%,transparent_70%)] opacity-50 pointer-events-none" />
          <div className="px-6 py-6 pb-24">
            <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-3 w-3" /> My Resumes
            </Link>
            <div className="flex items-center justify-between mt-4">
               <div className="relative flex-1 mr-4 flex items-center group">
                 <input 
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                   className="w-full rounded-xl border border-transparent bg-transparent text-2xl font-black focus:border-primary focus:bg-white/50 focus:outline-none hover:bg-white/50 focus:px-3 py-1.5 pl-2 pr-8 transition-all peer shadow-sm" 
                   title="Click to edit title"
                 />
                 <Edit className="h-4 w-4 text-primary absolute right-3 pointer-events-none transition-transform peer-focus:scale-110" />
               </div>
               <div className="flex gap-2">
                 <button onClick={handleSave} disabled={saving} className="btn-primary py-2 px-4 text-xs font-bold disabled:opacity-70 whitespace-nowrap shadow-glow hover:scale-105 transition-all">
                   <Save className="h-4 w-4 mr-1.5" /> {saving ? "Saving..." : "Save Resume"}
                 </button>
               </div>
            </div>

            {/* Quick Navigation Tabs */}
            <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar sticky top-0 bg-surface/95 backdrop-blur z-20 -mx-6 px-6 pt-4 border-b border-border/50">
              {sections.map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`whitespace-nowrap px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded-full transition-all border ${
                    activeSection === section 
                      ? 'border-primary bg-primary text-white shadow-glow' 
                      : 'border-transparent text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
            
            {/* Section Stepper Header */}
            <div className="mt-8">
              <nav className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-extrabold flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-sm font-black text-primary ring-1 ring-primary/20 shadow-sm">
                    {currentIndex + 1}
                  </span>
                  {activeSection}
                </h2>
                <div className="flex gap-1">
                   <button onClick={prevSection} disabled={currentIndex === 0} className="p-2 rounded-full border border-border bg-surface hover:bg-muted disabled:opacity-30 transition-all">
                     <ChevronLeft className="h-4 w-4" />
                   </button>
                   <button onClick={nextSection} disabled={currentIndex === sections.length - 1} className="p-2 rounded-full border border-border bg-surface hover:bg-muted disabled:opacity-30 transition-all">
                     <ChevronRight className="h-4 w-4" />
                   </button>
                </div>
              </nav>

              <div className="animate-in fade-in slide-in-from-right-4 duration-500 ease-out">
                {activeSection === "Personal Info" && (
                    <div className="space-y-6">
                      <PersonalInfo personal={data.personal} updatePersonal={updatePersonal} accentColor={data.accentColor} template={data.template} />
                    </div>
                )}
                {activeSection === "Work Experience" && <WorkExperienceList experience={data.experience} updateExperience={updateExperience} addExperience={addExperience} removeExperience={removeExperience} />}
                {activeSection === "Education" && <EducationSection education={data.education} updateEducation={updateEducation} addEducation={addEducation} removeEducation={removeEducation} />}
                {activeSection === "Positions of Responsibility" && <PorSection por={data.por} updatePor={updatePor} addPor={addPor} removePor={removePor} />}
                {activeSection === "Skills" && <SkillsSection skills={data.skills} addSkillCategory={addSkillCategory} updateSkillCategory={updateSkillCategory} removeSkillCategory={removeSkillCategory} />}
                {activeSection === "Projects" && <ProjectsSection projects={data.projects} updateProject={updateProject} addProject={addProject} removeProject={removeProject} openLibraryModal={() => setIsLibraryModalOpen(true)} />}
                {activeSection === "Certifications" && <CertificationsSection certifications={data.certifications} updateCertification={updateCertification} addCertification={addCertification} removeCertification={removeCertification} />}
                {activeSection === "Achievements" && <AchievementsSection achievements={data.achievements} addAchievement={addAchievement} updateAchievement={updateAchievement} removeAchievement={removeAchievement} />}
                {activeSection === "Coding Profiles" && <CodingProfilesSection codingProfiles={data.codingProfiles} addCodingProfile={addCodingProfile} updateCodingProfile={updateCodingProfile} removeCodingProfile={removeCodingProfile} />}
              </div>
            </div>

            <div className="sticky bottom-0 mt-12 -mx-6 border-t border-border bg-surface/95 px-6 py-4 backdrop-blur flex gap-3 z-30">
              <button disabled={currentIndex === 0} onClick={prevSection} className="btn-outline flex-1 py-3 text-sm font-bold shadow-sm hover:bg-muted"><ChevronLeft className="mr-1 h-4 w-4" /> Previous</button>
              {currentIndex === sections.length - 1 ? (
                 <button className="flex-[2] rounded-full gradient-emerald px-6 py-3 text-sm font-bold text-white shadow-glow hover:scale-[1.02] transition-transform"><Sparkles className="mr-2 inline h-4 w-4" /> Finalize Resume</button>
              ) : (
                <button onClick={nextSection} className="btn-primary flex-[2] py-3 text-sm font-bold shadow-glow hover:scale-[1.02] transition-transform">Continue to {sections[currentIndex + 1]} <ChevronRight className="ml-1 h-4 w-4" /></button>
              )}
            </div>
          </div>
        </div>

        {/* DRAGGABLE DIVIDER */}
        <div
          onMouseDown={handleMouseDown}
          className="hidden md:flex w-2 cursor-col-resize items-center justify-center bg-border/50 hover:bg-primary/20 active:bg-primary/30 transition-colors group flex-shrink-0"
        >
          <div className="h-8 w-0.5 rounded-full bg-muted-foreground/30 group-hover:bg-primary group-active:bg-primary transition-colors" />
        </div>

        {/* RIGHT PREVIEW PANEL */}
        <div className="relative bg-surface-2/40 md:overflow-y-auto md:h-screen flex-1 min-w-[300px] flex flex-col">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-500/5 via-transparent to-amber-500/5 pointer-events-none" />
          <div className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
            <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live Preview</p>
                </div>
                <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    if (id === "new") {
                      alert("Please save the resume first to share it.");
                    } else {
                      setShareLink(`${window.location.origin}/preview/${id}`);
                      setIsShareModalOpen(true);
                    }
                  }}
                  className="btn-outline px-3 py-1.5 text-[11px]"
                >
                  <Share2 className="h-3.5 w-3.5" /> Share
                </button>
                <button onClick={handleDownloadPDF} disabled={downloading} className="btn-primary px-3 py-1.5 text-[11px] disabled:opacity-70"><Download className="h-3.5 w-3.5" /> {downloading ? 'Generating...' : 'Download PDF'}</button>
                </div>
            </div>
            
            {/* Styling Controls */}
            <div className="flex items-center gap-6 px-6 py-2 bg-surface-2/20 overflow-x-auto no-scrollbar border-t border-border/50">
                <div className="flex items-center gap-2">
                    <label className="text-[9px] font-bold uppercase text-muted-foreground whitespace-nowrap">Font Size</label>
                    <input type="range" min="8" max="16" value={data.settings?.fontSize || 11} onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })} className="w-20 accent-primary" />
                </div>
                <div className="flex items-center gap-2 border-l border-border/50 pl-4">
                    <label className="text-[9px] font-bold uppercase text-muted-foreground whitespace-nowrap">Line Height</label>
                    <input type="range" min="1" max="2" step="0.1" value={data.settings?.lineHeight || 1.5} onChange={(e) => updateSettings({ lineHeight: parseFloat(e.target.value) })} className="w-20 accent-primary" />
                </div>
                <div className="flex items-center gap-2 border-l border-border/50 pl-4">
                    <label className="text-[9px] font-bold uppercase text-muted-foreground whitespace-nowrap">Spacing</label>
                    <input type="range" min="-0.5" max="2" step="0.1" value={data.settings?.letterSpacing || 0} onChange={(e) => updateSettings({ letterSpacing: parseFloat(e.target.value) })} className="w-20 accent-primary" />
                </div>
                <div className="flex items-center gap-2 border-l border-border/50 pl-4">
                    <label className="text-[9px] font-bold uppercase text-muted-foreground whitespace-nowrap">Padding</label>
                    <input type="range" min="10" max="64" value={data.settings?.padding || 32} onChange={(e) => updateSettings({ padding: parseInt(e.target.value) })} className="w-20 accent-primary" />
                </div>
                <div className="flex items-center gap-2 border-l border-border/50 pl-4">
                    <label className="text-[9px] font-bold uppercase text-muted-foreground whitespace-nowrap font-sans">Font</label>
                    <select 
                        value={data.settings?.fontFamily || "Inter"} 
                        onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                        className="bg-transparent text-[10px] font-bold focus:outline-none"
                    >
                        <option value="Inter">Inter</option>
                        <option value="serif">Serif</option>
                        <option value="mono">Mono</option>
                        <option value="system-ui">System</option>
                    </select>
                </div>
                <div className="flex items-center gap-2 border-l border-border/50 pl-4">
                    <label className="text-[9px] font-bold uppercase text-muted-foreground whitespace-nowrap font-sans">Template</label>
                    <select 
                        value={data.template} 
                        onChange={(e) => setTemplate(e.target.value as any)}
                        className="bg-transparent text-[10px] font-bold focus:outline-none"
                    >
                        <option value="latex">Jake's Template</option>
                        <option value="iiita">IIITA Template</option>
                        <option value="professional">Professional</option>
                        <option value="classic">Classic</option>
                    </select>
                </div>
            </div>
          </div>

          <div className="p-6 md:p-10 origin-top flex justify-center" ref={previewPaneRef}>
            <div id="resume-preview-root" style={{ transform: `scale(${previewScale})`, transformOrigin: 'top center', transition: 'transform 0.1s ease-out' }}>
              <ResumePreview data={data} />
            </div>
          </div>
          
          <div className="sticky bottom-6 mt-auto flex justify-center items-center gap-4 pointer-events-none z-10">
             <div className="pointer-events-auto flex items-center gap-2 bg-surface/90 backdrop-blur border border-border rounded-full px-3 py-1.5 shadow-lg">
                <button onClick={() => setUserZoom(z => Math.max(0.5, z - 0.1))} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                   <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <input type="range" min="0.5" max="2" step="0.1" value={userZoom} onChange={(e) => setUserZoom(parseFloat(e.target.value))} className="w-24 accent-primary" />
                <button onClick={() => setUserZoom(z => Math.min(2, z + 0.1))} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                   <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <div className="w-[1px] h-3 bg-border mx-1" />
                <button onClick={() => setUserZoom(1)} className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors">Reset</button>
             </div>
             <div className="pointer-events-auto pill-muted bg-surface/90 backdrop-blur border border-border py-1.5 px-4 text-[10px] flex items-center gap-2 shadow-lg">
                <span className="flex h-1.5 w-1.5 rounded-full bg-primary" /> Changes sync in real-time
             </div>
          </div>
        </div>
      </div>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        link={shareLink} 
      />

      <ProjectLibraryModal 
        isOpen={isLibraryModalOpen} 
        onClose={() => setIsLibraryModalOpen(false)} 
        onImport={handleLibraryImport} 
      />
    </AppShell>
  );
}

function Field({ label, value, onChange, type = "text", className = "", placeholder }: { label: string; value: string; onChange: (val: string) => void; type?: string; className?: string, placeholder?: string }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-tight text-muted-foreground/70">{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="input-base" 
        placeholder={placeholder}
      />
    </div>
  );
}

function PersonalInfo({ personal, updatePersonal, accentColor, template }: { personal: ResumeData["personal"]; updatePersonal: any; accentColor: string; template: string }) {
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updatePersonal({ collegeLogo: url, photoUrl: url });
    }
  };

  return (
    <div className="card-soft p-6 border-l-4 border-l-sky-500/30 space-y-6">

      <div className="grid grid-cols-2 gap-4">
        <Field label="Full Name" value={personal.fullName} onChange={(v) => updatePersonal({ fullName: v })} />
        <Field label="Email" value={personal.email} onChange={(v) => updatePersonal({ email: v })} />
        <Field label="Email 2 (Optional)" value={personal.email2 || ""} onChange={(v) => updatePersonal({ email2: v })} />
        <Field label="Phone" value={personal.phone} onChange={(v) => updatePersonal({ phone: v })} />
        <Field label="Location" value={personal.location} onChange={(v) => updatePersonal({ location: v })} />
        <Field label="Roll No." value={personal.rollNo || ""} onChange={(v) => updatePersonal({ rollNo: v })} />
        <Field label="Course" value={personal.course || ""} onChange={(v) => updatePersonal({ course: v })} />
        <Field label="LinkedIn URL" value={personal.linkedin} onChange={(v) => updatePersonal({ linkedin: v })} />
        <Field label="GitHub URL" value={personal.github || ""} onChange={(v) => updatePersonal({ github: v })} />
        <Field label="Portfolio URL" value={personal.portfolio} className="col-span-2" onChange={(v) => updatePersonal({ portfolio: v })} />
        
        {(template === "iiita" || template === "classic") && (
          <div className="col-span-2 mt-2">
             <label className="mb-1 block text-[11px] font-bold uppercase tracking-tight text-muted-foreground/70">Image Upload (Local only)</label>
             <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
             {(personal.collegeLogo || personal.photoUrl) && <img src={personal.collegeLogo || personal.photoUrl} alt="Preview" className="mt-2 h-10 object-contain" />}
          </div>
        )}
      </div>
    </div>
  );
}

function PorSection({ por, updatePor, addPor, removePor }: { por: any[]; updatePor: any; addPor: any; removePor: any }) {
  return (
    <div className="space-y-6">
      {por.map((p, index) => (
        <div key={p.id} className="card-soft p-5 relative group border-l-4 border-l-amber-500/30">
          <button onClick={() => removePor(p.id)} className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Position / Role" value={p.role} onChange={(v) => updatePor(p.id, { role: v })} />
            <Field label="Club or Event" value={p.event} onChange={(v) => updatePor(p.id, { event: v })} />
            <Field label="Tenure Period" value={p.duration} className="col-span-2" onChange={(v) => updatePor(p.id, { duration: v })} />
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-tight text-muted-foreground/70">Description</label>
            <textarea 
              rows={3} 
              value={p.description || ""} 
              onChange={(e) => updatePor(p.id, { description: e.target.value })}
              className="input-base resize-y" 
              placeholder="Briefly describe your responsibilities..."
            />
          </div>
        </div>
      ))}
      <button onClick={addPor} className="btn-outline w-full py-4 border-dashed border-2 hover:bg-primary/5 transition-all">
        <Plus className="h-4 w-4" /> Add Position of Responsibility
      </button>
    </div>
  );
}

function WorkExperienceList({ experience, updateExperience, addExperience, removeExperience }: { experience: Experience[]; updateExperience: any; addExperience: any; removeExperience: any }) {
  return (
    <div className="space-y-6">
      {experience.map((exp, index) => (
        <div key={exp.id} className="card-soft p-5 relative group border-l-4 border-l-primary/30">
          <button onClick={() => removeExperience(exp.id)} className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Company" value={exp.company} onChange={(v) => updateExperience(exp.id, { company: v })} />
            <Field label="Location" value={exp.location} onChange={(v) => updateExperience(exp.id, { location: v })} placeholder="e.g. London, UK" />
            <Field label="Job Title" value={exp.role} onChange={(v) => updateExperience(exp.id, { role: v })} />
            <Field label="Start Date" value={exp.startDate} onChange={(v) => updateExperience(exp.id, { startDate: v })} />
            <Field label="End Date" value={exp.endDate} onChange={(v) => updateExperience(exp.id, { endDate: v })} />
          </div>
          <div className="mt-4">
             <label className="flex items-center gap-2 text-xs font-semibold mb-3 cursor-pointer">
               <input type="checkbox" checked={exp.isCurrent} onChange={(e) => updateExperience(exp.id, { isCurrent: e.target.checked })} className="accent-primary h-4 w-4 rounded" /> 
               I currently work here
             </label>
             <label className="mb-1 block text-[11px] font-bold uppercase tracking-tight text-muted-foreground/70">Description</label>
             <textarea 
               rows={5} 
               value={exp.description} 
               onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
               className="input-base resize-y" 
               placeholder="Briefly describe your key responsibilities and achievements..."
             />
             <AIEnhanceButton currentText={exp.description} onAccept={(text) => updateExperience(exp.id, { description: text })} />
          </div>
        </div>
      ))}
      <button onClick={addExperience} className="btn-outline w-full py-4 border-dashed border-2 hover:bg-primary/5 transition-all">
        <Plus className="h-4 w-4" /> Add Work Experience
      </button>
    </div>
  );
}

function EducationSection({ education, updateEducation, addEducation, removeEducation }: { education: Education[]; updateEducation: any; addEducation: any; removeEducation: any }) {
  return (
    <div className="space-y-6">
      {education.map((edu) => (
        <div key={edu.id} className="card-soft p-5 border-l-4 border-l-amber-500/30 relative group">
          <button onClick={() => removeEducation(edu.id)} className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Degree" value={edu.degree} onChange={(v) => updateEducation(edu.id, { degree: v })} />
            <Field label="Institution" value={edu.institution} onChange={(v) => updateEducation(edu.id, { institution: v })} />
            <Field label="Field of Study" value={edu.field} onChange={(v) => updateEducation(edu.id, { field: v })} />
            <Field label="Grade" value={edu.grade} onChange={(v) => updateEducation(edu.id, { grade: v })} />
            <Field label="Start Year" value={edu.startYear} onChange={(v) => updateEducation(edu.id, { startYear: v })} />
            <Field label="End Year" value={edu.endYear} onChange={(v) => updateEducation(edu.id, { endYear: v })} />
            <Field label="Location" value={edu.location} onChange={(v) => updateEducation(edu.id, { location: v })} className="col-span-2" />
          </div>
        </div>
      ))}
      <button onClick={addEducation} className="btn-outline w-full py-4 border-dashed border-2 hover:bg-primary/5 transition-all"><Plus className="h-4 w-4" /> Add Education</button>
    </div>
  );
}

function SkillsSection({ skills, addSkillCategory, updateSkillCategory, removeSkillCategory }: any) {
  return (
    <div className="space-y-6">
      {skills.map((cat: any) => (
        <div key={cat.id} className="card-soft p-5 border-l-4 border-l-rose-500/30 relative group">
          <button onClick={() => removeSkillCategory(cat.id)} className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="space-y-4">
            <Field label="Category Name" value={cat.name} onChange={(v) => updateSkillCategory(cat.id, { name: v })} placeholder="e.g. Languages, Web Development" />
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-tight text-muted-foreground/70">Skills</label>
              <textarea 
                rows={3} 
                value={cat.items} 
                onChange={(e) => updateSkillCategory(cat.id, { items: e.target.value })}
                placeholder="e.g. C++, C, Python, JavaScript"
                className="input-base resize-y" 
              />
            </div>
          </div>
        </div>
      ))}
      <button onClick={addSkillCategory} className="btn-outline w-full py-4 border-dashed border-2 hover:bg-primary/5 transition-all"><Plus className="h-4 w-4" /> Add Skill Category</button>
    </div>
  );
}

function ProjectsSection({ projects, updateProject, addProject, removeProject, openLibraryModal }: { projects: Project[]; updateProject: any; addProject: any; removeProject: any; openLibraryModal: () => void }) {
  return (
    <div className="space-y-6">
      {projects.map((proj) => (
        <div key={proj.id} className="card-soft p-5 border-l-4 border-l-teal-500/30 relative group">
          <button onClick={() => removeProject(proj.id)} className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Project Name" value={proj.name} onChange={(v) => updateProject(proj.id, { name: v })} />
            <Field label="Link / URL" value={proj.url} onChange={(v) => updateProject(proj.id, { url: v })} />
            <Field label="Tech Stack" value={proj.techStack} className="col-span-2" onChange={(v) => updateProject(proj.id, { techStack: v })} />
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-tight text-muted-foreground/70">Description</label>
            <textarea 
              rows={4} 
              value={proj.description} 
              onChange={(e) => updateProject(proj.id, { description: e.target.value })}
              className="input-base resize-y" 
            />
            <AIEnhanceButton currentText={proj.description} type="project" onAccept={(text) => updateProject(proj.id, { description: text })} />
          </div>
        </div>
      ))}
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={addProject} className="btn-outline flex-1 py-4 border-dashed border-2 hover:bg-primary/5 transition-all"><Plus className="h-4 w-4" /> Add Project</button>
        <button onClick={openLibraryModal} className="btn-primary flex-1 py-4 shadow-glow"><BookOpen className="h-4 w-4 mr-2 inline" /> Import from Library</button>
      </div>
    </div>
  );
}

function CertificationsSection({ certifications, updateCertification, addCertification, removeCertification }: { certifications: Certification[]; updateCertification: any; addCertification: any; removeCertification: any }) {
  return (
    <div className="space-y-6">
      {certifications.map((cert) => (
        <div key={cert.id} className="card-soft p-5 border-l-4 border-l-indigo-500/30 relative group">
          <button onClick={() => removeCertification(cert.id)} className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Certificate" value={cert.name} onChange={(v) => updateCertification(cert.id, { name: v })} />
            <Field label="Issuer" value={cert.issuer} onChange={(v) => updateCertification(cert.id, { issuer: v })} />
            <Field label="Date" value={cert.date} onChange={(v) => updateCertification(cert.id, { date: v })} />
          </div>
        </div>
      ))}
      <button onClick={addCertification} className="btn-outline w-full py-4 border-dashed border-2 hover:bg-primary/5 transition-all"><Plus className="h-4 w-4" /> Add Certification</button>
    </div>
  );
}

function AchievementsSection({ achievements, addAchievement, updateAchievement, removeAchievement }: { achievements: string[]; addAchievement: any; updateAchievement: any; removeAchievement: any }) {
  return (
    <div className="space-y-6">
      <div className="card-soft p-5 border-l-4 border-l-purple-500/30">
        <label className="mb-3 block text-[11px] font-bold uppercase tracking-tight text-muted-foreground/70">My Achievements</label>
        <div className="space-y-4">
          {achievements.map((ach, index) => (
            <div key={index} className="flex gap-2 group">
              <div className="flex-1">
                <textarea 
                  rows={2} 
                  value={ach} 
                  onChange={(e) => updateAchievement(index, e.target.value)}
                  placeholder="e.g. Winner of National Hackathon 2023"
                  className="input-base resize-y min-h-[40px]" 
                />
              </div>
              <button onClick={() => removeAchievement(index)} className="p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button onClick={addAchievement} className="mt-4 btn-outline w-full py-2 border-dashed border-2 hover:bg-primary/5 transition-all"><Plus className="h-3.5 w-3.5" /> Add Achievement</button>
      </div>
    </div>
  );
}

function CodingProfilesSection({ codingProfiles, addCodingProfile, updateCodingProfile, removeCodingProfile }: { codingProfiles: CodingProfile[]; addCodingProfile: any; updateCodingProfile: any; removeCodingProfile: any }) {
  return (
    <div className="space-y-6">
      {codingProfiles.map((profile) => (
        <div key={profile.id} className="card-soft p-5 border-l-4 border-l-blue-500/30 relative group">
          <button onClick={() => removeCodingProfile(profile.id)} className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Platform" value={profile.platform} onChange={(v) => updateCodingProfile(profile.id, { platform: v })} placeholder="e.g. CodeForces, LeetCode" />
            <Field label="Rating/Rank" value={profile.rating} onChange={(v) => updateCodingProfile(profile.id, { rating: v })} placeholder="e.g. Expert (1644)" />
            <Field label="Username/Handle" value={profile.username} onChange={(v) => updateCodingProfile(profile.id, { username: v })} />
            <Field label="Profile URL" value={profile.url} onChange={(v) => updateCodingProfile(profile.id, { url: v })} />
          </div>
        </div>
      ))}
      <button onClick={addCodingProfile} className="btn-outline w-full py-4 border-dashed border-2 hover:bg-primary/5 transition-all"><Plus className="h-4 w-4" /> Add Coding Profile</button>
    </div>
  );
}

export function ResumePreview({ data }: { data: ResumeData }) {
  const { personal, experience, education, skills, projects, accentColor, template, settings } = data;

  const accentStyles = useMemo(() => {
    const colors: Record<string, string> = {
      emerald: "#14B688",
      slate: "#475569",
      amber: "#F59E0B",
      teal: "#14B8A6",
      indigo: "#6366F1",
      rose: "#F43F5E",
    };
    return { color: colors[accentColor] || colors.emerald };
  }, [accentColor]);

  const s = settings || {
    fontSize: 11,
    lineHeight: 1.5,
    letterSpacing: 0,
    fontFamily: "Inter",
    padding: 32,
  };

  const fontStack = s.fontFamily === 'serif' ? 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' : 
                   s.fontFamily === 'mono' ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' :
                   s.fontFamily === 'system-ui' ? 'system-ui, -apple-system, sans-serif' :
                   '"Inter", system-ui, -apple-system, sans-serif';

  const wrapperStyles = {
    width: '210mm',
    minWidth: '210mm',
    height: '297mm',
    minHeight: '297mm',
    padding: `${s.padding}px`,
  };

  const globalStyles = `
    .resume-preview-container {
        font-family: ${fontStack} !important;
        font-size: ${s.fontSize}px !important;
        line-height: ${s.lineHeight} !important;
        letter-spacing: ${s.letterSpacing}px !important;
    }
    .resume-preview-container h1 { font-size: 2.5em !important; }
    .resume-preview-container h2 { font-size: 1.3em !important; }
    .resume-preview-container h3 { font-size: 1.1em !important; }
    .resume-preview-container p, 
    .resume-preview-container span, 
    .resume-preview-container li, 
    .resume-preview-container a,
    .resume-preview-container div:not(.resume-preview-container) { 
        font-size: 1em !important; 
    }
  `;

  // Different template layouts
  if (template === "latex") {
    return (
      <div className="resume-preview-container mx-auto bg-white shadow-2xl" style={wrapperStyles}>
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
        {/* HEADING */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-normal uppercase tracking-tight mb-2" style={{ fontVariant: 'small-caps' }}>{personal.fullName}</h1>
          {(personal.course || personal.rollNo) && (
             <div className="text-[12px] mb-2 font-medium">
                {personal.course && <span>{personal.course}</span>}
                {personal.course && personal.rollNo && <span> · </span>}
                {personal.rollNo && <span>Roll No: {personal.rollNo}</span>}
             </div>
          )}
          <div className="text-[11px] flex flex-wrap items-center justify-center gap-2">
            {personal.location && (
                <>
                    <span>{personal.location}</span>
                    <span>|</span>
                </>
            )}
            <span>{personal.phone}</span>
            <span>|</span>
            <a href={`mailto:${personal.email}`} className="border-b border-transparent hover:border-slate-900 transition-colors">{personal.email}</a>
            {personal.email2 && (
                <>
                    <span>|</span>
                    <a href={`mailto:${personal.email2}`} className="border-b border-transparent hover:border-slate-900 transition-colors">{personal.email2}</a>
                </>
            )}
            {personal.linkedin && (
                <>
                    <span>|</span>
                    <a href={personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`} className="border-b border-transparent hover:border-slate-900 transition-colors">{personal.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</a>
                </>
            )}
            {personal.github && (
                <>
                    <span>|</span>
                    <a href={personal.github.startsWith('http') ? personal.github : `https://${personal.github}`} className="border-b border-transparent hover:border-slate-900 transition-colors">{personal.github.replace(/^https?:\/\/(www\.)?/, '')}</a>
                </>
            )}
            {personal.portfolio && (
                <>
                    <span>|</span>
                    <a href={personal.portfolio.startsWith('http') ? personal.portfolio : `https://${personal.portfolio}`} className="border-b border-transparent hover:border-slate-900 transition-colors">{personal.portfolio.replace(/^https?:\/\/(www\.)?/, '')}</a>
                </>
            )}
          </div>
        </div>

        {/* SECTIONS */}
        <div className="space-y-4">
          {/* EDUCATION */}
          {education.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest border-b border-slate-900 mb-2 pb-0.5" style={{ fontVariant: 'small-caps' }}>Education</h2>
              <div className="space-y-3">
                {education.map(edu => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-[11px]">{edu.institution}</span>
                      <span className="text-[11px]">{edu.location}</span>
                    </div>
                    <div className="flex justify-between items-baseline italic text-[11px]">
                      <span>{edu.degree}{edu.field ? `, ${edu.field}` : ""} {edu.grade ? `(${edu.grade})` : ""}</span>
                      <span>{edu.startYear} — {edu.endYear}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* EXPERIENCE */}
          {experience.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest border-b border-slate-900 mb-2 pb-0.5" style={{ fontVariant: 'small-caps' }}>Experience</h2>
              <div className="space-y-3">
                {experience.map(exp => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-[11px]">{exp.role}</span>
                      <span className="text-[11px]">{formatDateRange(exp.startDate, exp.endDate)}</span>
                    </div>
                    <div className="flex justify-between items-baseline italic text-[11px] mb-1">
                      <span>{exp.company}</span>
                      <span>{exp.location}</span>
                    </div>
                    <ul className="list-disc pl-5 space-y-0.5 text-[10px] leading-snug text-slate-700">
                        {exp.description.split('\n').filter(b => b.trim()).map((bullet, i) => (
                            <li key={i}>{bullet.trim()}</li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CERTIFICATIONS */}
          {data.certifications?.length > 0 && (
            <section className="mt-4">
              <h2 className="text-sm font-bold uppercase tracking-widest border-b border-slate-900 mb-2 pb-0.5" style={{ fontVariant: 'small-caps' }}>Certifications</h2>
              <div className="space-y-1">
                {data.certifications.map(cert => (
                  <div key={cert.id} className="flex justify-between items-baseline text-[10px] text-slate-700">
                    <span className="font-bold">{cert.name}{cert.issuer ? ` · ${cert.issuer}` : ""}</span>
                    <span>{cert.date}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CODING PROFILES */}
          {data.codingProfiles?.length > 0 && (
            <section className="mt-4">
              <h2 className="text-sm font-bold uppercase tracking-widest border-b border-slate-900 mb-2 pb-0.5" style={{ fontVariant: 'small-caps' }}>Coding Profiles</h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-700">
                {data.codingProfiles.map((profile, i) => (
                  <div key={profile.id} className="flex items-center gap-1.5">
                    <span className="text-slate-900">•</span>
                    <span className="font-bold">{profile.rating} on {profile.platform}</span>
                    {profile.username && (
                      profile.url ? (
                        <a href={profile.url.startsWith('http') ? profile.url : `https://${profile.url}`} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:underline hover:text-slate-900 transition-colors">({profile.username})</a>
                      ) : (
                        <span className="text-slate-500">({profile.username})</span>
                      )
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* PROJECTS */}
          {projects.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest border-b border-slate-900 mb-2 pb-0.5" style={{ fontVariant: 'small-caps' }}>Projects</h2>
              <div className="space-y-3">
                {projects.map(proj => (
                  <div key={proj.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-[11px]">{proj.name}</span>
                      {proj.url && (
                        <a href={proj.url.startsWith('http') ? proj.url : `https://${proj.url}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-500 hover:underline">
                          Project Link
                        </a>
                      )}
                    </div>
                    {proj.techStack && (
                      <div className="text-[10px] mt-0.5">
                        <span className="font-bold">Technology Stack: </span>
                        <span>{proj.techStack}</span>
                      </div>
                    )}
                    <ul className="list-disc pl-5 space-y-0.5 text-[10px] leading-snug text-slate-700 mt-1">
                        {proj.description.split('\n').filter(b => b.trim()).map((bullet, i) => (
                            <li key={i}>{bullet.trim()}</li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* POR */}
          {data.por?.length > 0 && (
            <section className="mt-4">
              <h2 className="text-sm font-bold uppercase tracking-widest border-b border-slate-900 mb-2 pb-0.5" style={{ fontVariant: 'small-caps' }}>Positions of Responsibility</h2>
              <div className="space-y-1">
                {data.por.map(p => (
                  <div key={p.id}>
                    <div className="flex justify-between items-baseline text-[10px] text-slate-700">
                      <span className="font-bold">{p.role}{p.role && p.event ? ', ' : ''}{p.event}</span>
                      <span>{p.duration}</span>
                    </div>
                    {p.description && (
                      <ul className="list-disc pl-5 space-y-0.5 text-[10px] leading-snug text-slate-700 mt-0.5">
                        {p.description.split('\n').filter(b => b.trim()).map((bullet, i) => (
                          <li key={i}>{bullet.trim()}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SKILLS */}
          {skills.length > 0 && (
            <section className="mt-4">
              <h2 className="text-sm font-bold uppercase tracking-widest border-b border-slate-900 mb-2 pb-0.5" style={{ fontVariant: 'small-caps' }}>Technical Skills</h2>
              <div className="space-y-1">
                {skills.map(cat => (
                  <div key={cat.id} className="text-[10px] text-slate-700 leading-snug">
                    <span className="font-bold">{cat.name}: </span>
                    {cat.items}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ACHIEVEMENTS */}
          {data.achievements?.length > 0 && (
            <section className="mt-4">
              <h2 className="text-sm font-bold uppercase tracking-widest border-b border-slate-900 mb-2 pb-0.5" style={{ fontVariant: 'small-caps' }}>Achievements</h2>
              <ul className="list-disc pl-5 space-y-0.5 text-[10px] leading-snug text-slate-700">
                {data.achievements.filter(a => a.trim()).map((ach, i) => (
                  <li key={i}>{ach}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    );
  }

  if (template === "iiita") {
    return (
      <div className="resume-preview-container mx-auto bg-white shadow-2xl" style={wrapperStyles}>
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-3 pb-2">
          {personal.collegeLogo && (
            <div className="w-[2.35cm] shrink-0">
              <img src={personal.collegeLogo} className="w-full object-contain" alt="College Logo" />
            </div>
          )}
          <div className="flex-1 flex justify-between items-start text-[11px] leading-snug">
            <div className="flex flex-col gap-0.5">
              <span className="text-[20px] font-bold tracking-wide">{personal.fullName}</span>
              {personal.rollNo && <span>Roll No.: {personal.rollNo}</span>}
              {personal.course && <span>{personal.course}</span>}
              <span>Indian Institute Of Information Technology, Allahabad</span>
            </div>
            <div className="flex flex-col gap-0.5 text-right">
              {personal.phone && <span>+91-{personal.phone.replace('+91-', '')}</span>}
              {personal.email && <a href={`mailto:${personal.email}`}>{personal.email}</a>}
              {personal.email2 && <a href={`mailto:${personal.email2}`}>{personal.email2}</a>}
              {personal.github && <a href={personal.github.startsWith('http') ? personal.github : `https://${personal.github}`}>{personal.github.replace(/^https?:\/\/(www\.)?/, '')}</a>}
              {personal.linkedin && <a href={personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`}>{personal.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</a>}
              {personal.portfolio && <a href={personal.portfolio.startsWith('http') ? personal.portfolio : `https://${personal.portfolio}`}>{personal.portfolio.replace(/^https?:\/\/(www\.)?/, '')}</a>}
              {personal.location && <span>{personal.location}</span>}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {/* EDUCATION */}
          {education.length > 0 && (
            <section>
              <h2 className="text-[13px] font-bold uppercase tracking-widest border-b border-black mb-1 pb-0.5" style={{ fontVariant: 'small-caps' }}>Education</h2>
              <div className="space-y-1.5">
                {education.map(edu => (
                  <div key={edu.id} className="text-[11px] leading-tight">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold">{edu.institution}</span>
                      <span>{edu.grade && `CGPA/Percentage: ${edu.grade}`}</span>
                    </div>
                    <div className="flex justify-between items-baseline italic mb-0.5">
                      <span>{edu.degree}{edu.field ? `, ${edu.field}` : ""}</span>
                      <span>{formatDateRange(edu.startYear, edu.endYear)}</span>
                    </div>
                    {edu.location && <div className="text-[10px] italic text-slate-600">{edu.location}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* EXPERIENCE */}
          {experience.length > 0 && (
            <section>
              <h2 className="text-[13px] font-bold uppercase tracking-widest border-b border-black mb-1 pb-0.5" style={{ fontVariant: 'small-caps' }}>Experience</h2>
              <div className="space-y-2">
                {experience.map(exp => (
                  <div key={exp.id} className="text-[11px] leading-tight">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold">{exp.company}</span>
                      <span>{exp.location}</span>
                    </div>
                    <div className="flex justify-between items-baseline italic mb-0.5">
                      <span>{exp.role}</span>
                      <span>{formatDateRange(exp.startDate, exp.endDate)}</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {exp.description.split('\n').filter(b => b.trim()).map((b, i) => <li key={i}>{b.trim()}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CERTIFICATIONS */}
          {data.certifications?.length > 0 && (
            <section>
              <h2 className="text-[13px] font-bold uppercase tracking-widest border-b border-black mb-1 pb-0.5" style={{ fontVariant: 'small-caps' }}>Certifications</h2>
              <div className="space-y-0.5">
                {data.certifications.map(cert => (
                  <div key={cert.id} className="flex justify-between items-baseline text-[11px]">
                    <span className="font-bold">{cert.name}{cert.issuer ? ` · ${cert.issuer}` : ""}</span>
                    <span className="italic text-[10px]">{cert.date}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* PROJECTS */}
          {projects.length > 0 && (
            <section>
              <h2 className="text-[13px] font-bold uppercase tracking-widest border-b border-black mb-1 pb-0.5" style={{ fontVariant: 'small-caps' }}>Personal Projects</h2>
              <div className="space-y-2">
                {projects.map(proj => {
                  const descParts = proj.description.split('\n');
                  const subtitle = descParts[0]?.trim();
                  const bullets = descParts.slice(1).filter(b => b.trim());
                  return (
                    <div key={proj.id} className="text-[11px] leading-tight">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold">{proj.name}</span>
                        {proj.url && <a href={proj.url.startsWith('http') ? proj.url : `https://${proj.url}`} target="_blank" rel="noopener noreferrer" className="italic">Project Link</a>}
                      </div>
                      <div className="italic mb-0.5">{subtitle}</div>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {proj.techStack && <li>Tools & technologies used: {proj.techStack}</li>}
                        {bullets.map((b, i) => <li key={i}>{b.trim()}</li>)}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* SKILLS */}
          {skills.length > 0 && (
            <section>
              <h2 className="text-[13px] font-bold uppercase tracking-widest border-b border-black mb-1 pb-0.5" style={{ fontVariant: 'small-caps' }}>Technical Skills and Interests</h2>
              <ul className="text-[11px] leading-tight space-y-0.5">
                {skills.map(cat => (
                  <li key={cat.id}><span className="font-bold">{cat.name}:</span> {cat.items}</li>
                ))}
              </ul>
            </section>
          )}

          {/* CODING PROFILES */}
          {data.codingProfiles?.length > 0 && (
            <section>
              <h2 className="text-[13px] font-bold uppercase tracking-widest border-b border-black mb-1 pb-0.5" style={{ fontVariant: 'small-caps' }}>Coding Profiles</h2>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px]">
                {data.codingProfiles.map((profile, i) => (
                  <div key={profile.id} className="flex items-center gap-1">
                    <span className="font-bold">{profile.platform}:</span>
                    <span>{profile.rating}</span>
                    {profile.username && (
                      profile.url ? (
                        <a href={profile.url.startsWith('http') ? profile.url : `https://${profile.url}`} target="_blank" rel="noopener noreferrer" className="italic hover:underline text-blue-800 transition-colors">({profile.username})</a>
                      ) : (
                        <span className="italic">({profile.username})</span>
                      )
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* POR */}
          {data.por?.length > 0 && (
            <section>
              <h2 className="text-[13px] font-bold uppercase tracking-widest border-b border-black mb-1 pb-0.5" style={{ fontVariant: 'small-caps' }}>Positions of Responsibility</h2>
              <div className="space-y-0.5">
                {data.por.map(p => (
                  <div key={p.id} className="text-[11px]">
                    <div className="flex justify-between items-baseline">
                      <span><span className="font-bold">{p.role}{p.role && p.event ? ', ' : ''}</span>{p.event}</span>
                      <span className="italic text-[10px]">{p.duration}</span>
                    </div>
                    {p.description && (
                      <ul className="list-disc pl-4 space-y-0.5 mt-0.5">
                        {p.description.split('\n').filter(b => b.trim()).map((b, i) => <li key={i}>{b.trim()}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ACHIEVEMENTS */}
          {data.achievements?.length > 0 && (
            <section>
              <h2 className="text-[13px] font-bold uppercase tracking-widest border-b border-black mb-1 pb-0.5" style={{ fontVariant: 'small-caps' }}>Achievements</h2>
              <div className="space-y-0.5">
                {data.achievements.filter(a => a.trim()).map((ach, i) => {
                  const firstWord = ach.split(' ')[0];
                  const rest = ach.substring(ach.indexOf(' ') + 1);
                  return (
                    <div key={i} className="flex justify-between items-baseline text-[11px]">
                      <span><span className="font-bold">{firstWord} </span>{rest}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  if (template === "professional") {
    return (
      <div className="resume-preview-container mx-auto bg-white shadow-2xl" style={wrapperStyles}>
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
        {/* HEADER — Centered name + contact row with icons */}
        <div className="text-center mb-1">
          <h1 className="text-[28px] font-bold uppercase tracking-tight mb-1" style={{ fontVariant: 'small-caps' }}>{personal.fullName}</h1>
          <div className="text-[10px] flex flex-wrap items-center justify-center gap-1.5 text-slate-700">
            {[
              personal.phone && <span key="phone" className="inline-flex items-center gap-0.5">📞 {personal.phone}</span>,
              personal.email && <span key="email" className="inline-flex items-center gap-0.5">✉️ <a href={`mailto:${personal.email}`} className="underline">{personal.email}</a></span>,
              personal.email2 && <span key="email2" className="inline-flex items-center gap-0.5">✉️ <a href={`mailto:${personal.email2}`} className="underline">{personal.email2}</a></span>,
              personal.linkedin && <span key="linkedin" className="inline-flex items-center gap-0.5">🔗 <a href={personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`} className="underline">LinkedIn</a></span>,
              personal.github && <span key="github" className="inline-flex items-center gap-0.5">💻 <a href={personal.github.startsWith('http') ? personal.github : `https://${personal.github}`} className="underline">GitHub</a></span>,
            ].filter(Boolean).map((item, i, arr) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                {item}
                {i < arr.length - 1 && <span>|</span>}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {/* EDUCATION */}
          {education.length > 0 && (
            <section>
              <h2 className="text-[12px] font-bold uppercase tracking-widest border-b border-black mb-1 pb-0.5" style={{ fontVariant: 'small-caps' }}>Education</h2>
              <div className="space-y-1.5">
                {education.map(edu => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-[10.5px]">{edu.institution}</span>
                      <span className="font-bold text-[10px]">{formatDateRange(edu.startYear, edu.endYear)}</span>
                    </div>
                    <div className="flex justify-between items-baseline italic text-[10px] text-slate-700">
                      <span>{edu.degree}{edu.field ? `, ${edu.field}` : ""}{edu.grade ? ` — ${edu.grade}` : ""}</span>
                      <span>{edu.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* PROFESSIONAL EXPERIENCE */}
          {experience.length > 0 && (
            <section>
              <h2 className="text-[12px] font-bold uppercase tracking-widest border-b border-black mb-1 pb-0.5" style={{ fontVariant: 'small-caps' }}>Professional Experience</h2>
              <div className="space-y-2">
                {experience.map(exp => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-[10.5px]">{exp.company}</span>
                      <span className="font-bold text-[10px]">{formatDateRange(exp.startDate, exp.endDate)}</span>
                    </div>
                    <div className="flex justify-between items-baseline italic text-[10px] text-slate-700 mb-0.5">
                      <span>{exp.role}</span>
                      <span>{exp.location}</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-[9.5px] leading-snug text-slate-800">
                      {exp.description.split('\n').filter(b => b.trim()).map((b, i) => <li key={i}>{b.trim()}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* LEADERSHIP & POSITIONS OF RESPONSIBILITY */}
          {data.por?.length > 0 && (
            <section>
              <h2 className="text-[12px] font-bold uppercase tracking-widest border-b border-black mb-1 pb-0.5" style={{ fontVariant: 'small-caps' }}>Leadership & Positions of Responsibility</h2>
              <div className="space-y-2">
                {data.por.map(p => (
                  <div key={p.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-[10.5px]">{p.role}</span>
                      <span className="font-bold text-[10px]">{p.duration}</span>
                    </div>
                    <div className="italic text-[10px] text-slate-700 mb-0.5">{p.event}</div>
                    {p.description && (
                      <ul className="list-disc pl-4 space-y-0.5 text-[9.5px] leading-snug text-slate-800">
                        {p.description.split('\n').filter(b => b.trim()).map((b, i) => <li key={i}>{b.trim()}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* TECHNICAL PROJECTS */}
          {projects.length > 0 && (
            <section>
              <h2 className="text-[12px] font-bold uppercase tracking-widest border-b border-black mb-1 pb-0.5" style={{ fontVariant: 'small-caps' }}>Technical Projects</h2>
              <div className="space-y-2">
                {projects.map(proj => (
                  <div key={proj.id}>
                    <div className="flex justify-between items-baseline">
                      <div className="text-[10.5px]">
                        <span className="font-bold">{proj.name}</span>
                        {proj.techStack && <span className="italic text-slate-600"> | {proj.techStack}</span>}
                      </div>
                      {proj.url && (
                        <a href={proj.url.startsWith('http') ? proj.url : `https://${proj.url}`} target="_blank" rel="noopener noreferrer" className="text-[9.5px] font-bold text-slate-700 hover:underline">
                          Project Link
                        </a>
                      )}
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-[9.5px] leading-snug text-slate-800 mt-0.5">
                      {proj.description.split('\n').filter(b => b.trim()).map((b, i) => <li key={i}>{b.trim()}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* TECHNICAL COMPETENCIES */}
          {skills.length > 0 && (
            <section>
              <h2 className="text-[12px] font-bold uppercase tracking-widest border-b border-black mb-1 pb-0.5" style={{ fontVariant: 'small-caps' }}>Technical Competencies</h2>
              <div className="space-y-0.5 text-[9.5px] text-slate-800 leading-snug">
                {skills.map(cat => (
                  <div key={cat.id}>
                    <span className="font-bold">{cat.name}: </span>
                    <span>{cat.items}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* COMPETITIVE PROGRAMMING PROFILES */}
          {data.codingProfiles?.length > 0 && (
            <section>
              <h2 className="text-[12px] font-bold uppercase tracking-widest border-b border-black mb-1 pb-0.5" style={{ fontVariant: 'small-caps' }}>Competitive Programming Profiles</h2>
              <div className="text-[9.5px] text-slate-800 flex flex-wrap gap-x-1">
                {data.codingProfiles.map((profile, i) => (
                  <span key={profile.id} className="inline-flex items-center gap-0.5">
                    {profile.url ? (
                      <a href={profile.url.startsWith('http') ? profile.url : `https://${profile.url}`} target="_blank" rel="noopener noreferrer" className="font-bold hover:underline">{profile.platform}</a>
                    ) : (
                      <span className="font-bold">{profile.platform}</span>
                    )}
                    <span>: {profile.rating}</span>
                    {profile.username && <span className="text-slate-500">({profile.username})</span>}
                    {i < data.codingProfiles.length - 1 && <span className="mx-1">|</span>}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* CERTIFICATIONS */}
          {data.certifications?.length > 0 && (
            <section>
              <h2 className="text-[12px] font-bold uppercase tracking-widest border-b border-black mb-1 pb-0.5" style={{ fontVariant: 'small-caps' }}>Certifications</h2>
              <div className="space-y-0.5">
                {data.certifications.map(cert => (
                  <div key={cert.id} className="flex justify-between items-baseline text-[9.5px] text-slate-800">
                    <span className="font-bold">{cert.name}{cert.issuer ? ` · ${cert.issuer}` : ""}</span>
                    <span>{cert.date}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* HONORS & ACHIEVEMENTS */}
          {data.achievements?.length > 0 && (
            <section>
              <h2 className="text-[12px] font-bold uppercase tracking-widest border-b border-black mb-1 pb-0.5" style={{ fontVariant: 'small-caps' }}>Honors & Achievements</h2>
              <ul className="list-disc pl-4 space-y-0.5 text-[9.5px] leading-snug text-slate-800">
                {data.achievements.filter(a => a.trim()).map((ach, i) => {
                  const firstWord = ach.split(' ')[0];
                  const rest = ach.substring(ach.indexOf(' ') + 1);
                  return <li key={i}><span className="font-bold">{firstWord}</span> {rest}</li>;
                })}
              </ul>
            </section>
          )}
        </div>
      </div>
    );
  }

  if (template === "minimal") {
      return (
        <div className="resume-preview-container mx-auto bg-white text-slate-900 shadow-2xl border border-slate-100" style={wrapperStyles}>
          <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
          <div className="text-center mb-10">
             <h1 className="text-4xl font-light tracking-tight">{personal.fullName}</h1>
             {(personal.course || personal.rollNo) && (
                <div className="mt-2 text-xs text-slate-500 font-medium tracking-wide">
                   {personal.course} {personal.course && personal.rollNo && '·'} {personal.rollNo && `Roll No: ${personal.rollNo}`}
                </div>
             )}
             <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[10px] text-slate-400">
                {personal.email && <span>{personal.email}</span>}
                {personal.email2 && <><span>•</span><span>{personal.email2}</span></>}
                {personal.location && <><span>•</span><span>{personal.location}</span></>}
                {personal.phone && <><span>•</span><span>{personal.phone}</span></>}
                {personal.linkedin && <><span>•</span><a href={personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`} className="hover:underline">{personal.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</a></>}
                {personal.github && <><span>•</span><a href={personal.github.startsWith('http') ? personal.github : `https://${personal.github}`} className="hover:underline">{personal.github.replace(/^https?:\/\/(www\.)?/, '')}</a></>}
                {personal.portfolio && <><span>•</span><a href={personal.portfolio.startsWith('http') ? personal.portfolio : `https://${personal.portfolio}`} className="hover:underline">{personal.portfolio.replace(/^https?:\/\/(www\.)?/, '')}</a></>}
             </div>
          </div>
          
          <div className="space-y-10">
              {education.length > 0 && (
                <section>
                   <h2 className="text-[10px] items-center flex gap-2 font-bold uppercase tracking-widest text-slate-400 mb-4 after:flex-1 after:h-[1px] after:bg-slate-100">Education</h2>
                   <div className="space-y-4">
                      {education.map(edu => (
                          <div key={edu.id}>
                              <div className="flex justify-between items-baseline mb-1">
                                  <h3 className="text-sm font-bold">{edu.degree}</h3>
                                  <span className="text-[10px] text-slate-400">{formatDateRange(edu.startYear, edu.endYear)}</span>
                              </div>
                              <p className="text-xs text-slate-600">{edu.institution}{edu.location ? ` · ${edu.location}` : ""}{edu.grade ? ` · Grade: ${edu.grade}` : ""}</p>
                          </div>
                      ))}
                   </div>
                </section>
              )}

              <section>
                 <h2 className="text-[10px] items-center flex gap-2 font-bold uppercase tracking-widest text-slate-400 mb-4 after:flex-1 after:h-[1px] after:bg-slate-100">Experience</h2>
                 <div className="space-y-6">
                    {experience.map(exp => (
                        <div key={exp.id}>
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="text-sm font-bold">{exp.role}</h3>
                                <span className="text-[10px] text-slate-400">{formatDateRange(exp.startDate, exp.endDate)}</span>
                            </div>
                            <p className="text-xs text-slate-600 mb-2">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p>
                            <p className="text-[11px] leading-relaxed text-slate-500">{exp.description}</p>
                        </div>
                    ))}
                 </div>
              </section>

              {data.certifications?.length > 0 && (
                <section>
                   <h2 className="text-[10px] items-center flex gap-2 font-bold uppercase tracking-widest text-slate-400 mb-4 after:flex-1 after:h-[1px] after:bg-slate-100">Certifications</h2>
                   <div className="space-y-3">
                      {data.certifications.map(cert => (
                         <div key={cert.id} className="flex justify-between items-baseline">
                            <p className="text-[11px] font-bold text-slate-700">{cert.name}{cert.issuer ? ` · ${cert.issuer}` : ""}</p>
                            <p className="text-[10px] text-slate-400">{cert.date}</p>
                         </div>
                      ))}
                   </div>
                </section>
              )}

              {data.codingProfiles?.length > 0 && (
                <section>
                   <h2 className="text-[10px] items-center flex gap-2 font-bold uppercase tracking-widest text-slate-400 mb-4 after:flex-1 after:h-[1px] after:bg-slate-100">Coding Profiles</h2>
                   <div className="flex flex-wrap gap-x-6 gap-y-2">
                      {data.codingProfiles.map(profile => (
                         <div key={profile.id} className="flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-slate-400" />
                            <p className="text-[11px] text-slate-700"><span className="font-bold">{profile.platform}</span>: {profile.rating}</p>
                         </div>
                      ))}
                   </div>
                </section>
              )}

              {projects.length > 0 && (
                <section>
                   <h2 className="text-[10px] items-center flex gap-2 font-bold uppercase tracking-widest text-slate-400 mb-4 after:flex-1 after:h-[1px] after:bg-slate-100">Projects</h2>
                   <div className="space-y-6">
                      {projects.map(proj => (
                          <div key={proj.id}>
                              <div className="flex justify-between items-baseline mb-1">
                                  <h3 className="text-sm font-bold">{proj.name}</h3>
                                  {proj.url && <a href={proj.url.startsWith('http') ? proj.url : `https://${proj.url}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-400 hover:underline">Project Link</a>}
                              </div>
                              {proj.techStack && <p className="text-[10px] text-slate-500 mb-1"><span className="font-bold text-slate-700">Technology Stack:</span> {proj.techStack}</p>}
                              <p className="text-[11px] leading-relaxed text-slate-500">{proj.description}</p>
                          </div>
                      ))}
                   </div>
                </section>
              )}

              <section>
                 <h2 className="text-[10px] items-center flex gap-2 font-bold uppercase tracking-widest text-slate-400 mb-4 after:flex-1 after:h-[1px] after:bg-slate-100">Skills</h2>
                 <div className="space-y-3">
                    {skills.map(cat => (
                       <div key={cat.id}>
                          <p className="text-[10px] font-bold text-slate-700">{cat.name}</p>
                          <p className="text-[11px] text-slate-600">{cat.items}</p>
                       </div>
                    ))}
                 </div>
              </section>

              {data.achievements?.length > 0 && (
                <section>
                   <h2 className="text-[10px] items-center flex gap-2 font-bold uppercase tracking-widest text-slate-400 mb-4 after:flex-1 after:h-[1px] after:bg-slate-100">Achievements</h2>
                   <ul className="list-disc pl-4 space-y-2 text-slate-600">
                      {data.achievements.filter(a => a.trim()).map((ach, i) => (
                         <li key={i} className="text-[11px]">{ach}</li>
                      ))}
                   </ul>
                </section>
              )}
          </div>
        </div>
      );
  }

  return (
    <div className="resume-preview-container mx-auto bg-white text-slate-900 shadow-2xl border border-slate-100 flex" style={wrapperStyles}>
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      {/* Sidebar for classic template */}
      {template === "classic" && (
          <aside className="w-1/3 bg-slate-50 p-8 border-r border-slate-100">
             <div className="mb-8 flex items-center gap-4">
                {(personal.photoUrl || personal.collegeLogo) && (
                    <div className={`h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-md`} style={{ borderColor: 'white' }}>
                        <img src={personal.photoUrl || personal.collegeLogo} alt="Avatar" className="h-full w-full object-cover" />
                    </div>
                )}
                <div className="flex-1">
                   <h1 className="text-xl font-bold text-left leading-tight">{personal.fullName}</h1>
                   {(personal.course || personal.rollNo) && (
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                         {personal.course} {personal.course && personal.rollNo && '·'} {personal.rollNo && `Roll No: ${personal.rollNo}`}
                      </p>
                   )}
                </div>
             </div>

             <div className="space-y-6">
                <div>
                   <h3 className="text-[11px] font-bold uppercase text-slate-400 mb-3 border-b border-slate-200 pb-1">Contact</h3>
                   <div className="space-y-2 text-[10px] text-slate-600">
                      {personal.email && <p className="flex items-center gap-2">{personal.email}</p>}
                      {personal.email2 && <p className="flex items-center gap-2">{personal.email2}</p>}
                      {personal.phone && <p className="flex items-center gap-2">{personal.phone}</p>}
                      {personal.location && <p className="flex items-center gap-2">{personal.location}</p>}
                      {personal.linkedin && <p className="flex items-center gap-2"><a href={personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`} className="hover:underline text-slate-500">{personal.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</a></p>}
                      {personal.github && <p className="flex items-center gap-2"><a href={personal.github.startsWith('http') ? personal.github : `https://${personal.github}`} className="hover:underline text-slate-500">{personal.github.replace(/^https?:\/\/(www\.)?/, '')}</a></p>}
                      {personal.portfolio && <p className="flex items-center gap-2"><a href={personal.portfolio.startsWith('http') ? personal.portfolio : `https://${personal.portfolio}`} className="hover:underline text-slate-500">{personal.portfolio.replace(/^https?:\/\/(www\.)?/, '')}</a></p>}
                   </div>
                </div>
                <div>
                   <h3 className="text-[11px] font-bold uppercase text-slate-400 mb-3 border-b border-slate-200 pb-1">Skills</h3>
                   <div className="space-y-3">
                      {skills.map(cat => (
                         <div key={cat.id}>
                            <p className="text-[10px] font-bold text-slate-700">{cat.name}</p>
                            <p className="text-[10px] text-slate-500 leading-relaxed">{cat.items}</p>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </aside>
      )}

      {/* Main Content */}
      <div className={`flex-1 ${template === 'classic' ? 'p-8' : 'p-10'}`}>
        {template !== "classic" && (
            <header className="border-b-2 pb-6 mb-6" style={{ borderBottomColor: accentStyles.color }}>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">{personal.fullName}</h1>
                    </div>
                    {personal.photoUrl && (
                         <div className={`h-22 w-22 overflow-hidden rounded-xl bg-slate-100 ${personal.removeBackground ? 'border-2 ring-4 ring-slate-50' : ''}`} style={{ borderColor: accentStyles.color }}>
                            <img src={personal.photoUrl} alt="Avatar" className={`h-full w-full object-cover ${personal.removeBackground ? 'grayscale-[0.2]' : ''}`} />
                         </div>
                    )}
                </div>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 font-medium">
                    <span>{personal.email}</span>
                    <span>•</span>
                    <span>{personal.phone}</span>
                    <span>•</span>
                    <span>{personal.location}</span>
                    {personal.linkedin && (
                        <>
                            <span>•</span>
                            <span>{personal.linkedin}</span>
                        </>
                    )}
                </div>
            </header>
        )}

        <div className="space-y-6">
            {education.length > 0 && (
                <Section title="Education" accentColor={accentStyles.color}>
                    {education.map(edu => (
                        <div key={edu.id} className="flex justify-between items-baseline">
                             <p className="text-xs font-bold">{edu.degree} · <span className="font-semibold text-slate-600">{edu.institution}</span> {edu.grade && <span className="font-normal text-slate-500">({edu.grade})</span>}</p>
                             <div className="text-right">
                                 <p className="text-[10px] text-slate-500">{formatDateRange(edu.startYear, edu.endYear)}</p>
                                 <p className="text-[9px] text-slate-400 italic">{edu.location}</p>
                              </div>
                        </div>
                    ))}
                </Section>
            )}

            <Section title="Experience" accentColor={accentStyles.color}>
                {experience.map(exp => (
                    <Job 
                      key={exp.id}
                      role={exp.role} 
                      company={exp.company} 
                      location={exp.location}
                      date={formatDateRange(exp.startDate, exp.endDate)} 
                      bullets={exp.description.split('\n').filter(b => b.trim()).map(b => b.trim())} 
                    />
                ))}
            </Section>

            {data.certifications?.length > 0 && (
                <Section title="Certifications" accentColor={accentStyles.color}>
                    <div className="space-y-2">
                        {data.certifications.map(cert => (
                            <div key={cert.id} className="flex justify-between items-baseline">
                                <p className="text-xs font-bold text-slate-800">{cert.name} · <span className="font-medium text-slate-500">{cert.issuer}</span></p>
                                <p className="text-[10px] text-slate-500">{cert.date}</p>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {data.codingProfiles?.length > 0 && (
                <Section title="Coding Profiles" accentColor={accentStyles.color}>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {data.codingProfiles.map(profile => (
                            <div key={profile.id} className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentStyles.color }} />
                                <p className="text-[11px] text-slate-700 font-medium">
                                  {profile.platform}: <span className="font-bold text-slate-900">{profile.rating}</span>
                                  {profile.username && (
                                    profile.url ? (
                                      <a href={profile.url.startsWith('http') ? profile.url : `https://${profile.url}`} target="_blank" rel="noopener noreferrer" className="ml-1 text-slate-500 hover:underline transition-colors" style={{ color: accentStyles.color }}>({profile.username})</a>
                                    ) : (
                                      <span className="ml-1 text-slate-500">({profile.username})</span>
                                    )
                                  )}
                                </p>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {projects.length > 0 && (
                <Section title="Projects" accentColor={accentStyles.color}>
                    {projects.map(proj => (
                         <Job 
                          key={proj.id}
                          role={proj.name} 
                          company={proj.url && <a href={proj.url.startsWith('http') ? proj.url : `https://${proj.url}`} target="_blank" rel="noopener noreferrer" style={{ color: accentStyles.color }} className="text-[10px] hover:underline hover:opacity-80 transition-opacity">Project Link</a>} 
                          date="" 
                          techStack={proj.techStack}
                          bullets={proj.description.split('\n').filter(b => b.trim()).map(b => b.trim())} 
                        />
                    ))}
                </Section>
            )}
            
            {template !== "classic" && (
                <Section title="Skills" accentColor={accentStyles.color}>
                    <div className="space-y-3">
                        {skills.map((cat) => (
                            <div key={cat.id}>
                                <p className="text-xs font-bold text-slate-800">{cat.name}</p>
                                <p className="text-[11px] text-slate-600 leading-relaxed">{cat.items}</p>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {data.por?.length > 0 && (
                <Section title="Positions of Responsibility" accentColor={accentStyles.color}>
                    <div className="space-y-2">
                        {data.por.map(p => (
                            <div key={p.id}>
                                <div className="flex justify-between items-baseline">
                                    <p className="text-xs font-bold text-slate-800">{p.role}{p.role && p.event ? ' · ' : ''}<span className="font-medium text-slate-500">{p.event}</span></p>
                                    <p className="text-[10px] text-slate-500">{p.duration}</p>
                                </div>
                                {p.description && (
                                    <ul className="list-disc pl-4 space-y-0.5 mt-1 text-[11px] leading-relaxed text-slate-600">
                                        {p.description.split('\n').filter(b => b.trim()).map((b, i) => <li key={i}>{b.trim()}</li>)}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {data.achievements?.length > 0 && (
                <Section title="Achievements" accentColor={accentStyles.color}>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600">
                        {data.achievements.filter(a => a.trim()).map((ach, i) => (
                            <li key={i} className="text-[11px]">{ach}</li>
                        ))}
                    </ul>
                </Section>
            )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children, accentColor }: { title: string; children: React.ReactNode; accentColor: string }) {
  return (
    <section>
      <h2 className="mb-3 text-[11px] font-extrabold uppercase tracking-widest" style={{ color: accentColor }}>{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Job({ role, company, location, date, techStack, bullets }: { role: string; company?: React.ReactNode; location?: string; date: string; techStack?: string; bullets: string[] }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-bold">
          {role} {company && <>· <span className="font-semibold text-slate-600">{company}</span></>}
        </p>
        <p className="text-[10px] text-slate-500 font-medium">{date}</p>
      </div>
      {(location || techStack) && (
        <div className="text-[10px] mt-0.5 flex justify-between items-center">
           <div>
            {techStack && (
                <>
                    <span className="font-bold text-slate-700">Technology Stack: </span>
                    <span className="text-slate-600">{techStack}</span>
                </>
            )}
           </div>
           {location && <span className="text-[9px] text-slate-400 italic">{location}</span>}
        </div>
      )}
      <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-slate-600">
        {bullets.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
    </div>
  );
}

