import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ArrowLeft, Camera, Sparkles, Plus, Download, Share2, ChevronRight, ChevronLeft, X, Trash2, Github } from "lucide-react";
import { AppShell } from "@/components/AppSidebar";
import { ResumeThumb } from "@/components/ResumeThumb";
import { useResume, ResumeData, Experience, Project, Education } from "@/hooks/use-resume";
import { GitHubImport } from "@/components/GitHubImport";
import { AIEnhanceButton } from "@/components/AIEnhanceButton";
import { CustomizationPanel } from "@/components/CustomizationPanel";

export const Route = createFileRoute("/editor/$id")({
  head: () => ({ meta: [{ title: "Resume Editor — OwlCV" }, { name: "description", content: "Edit your resume with AI suggestions." }] }),
  component: Editor,
});

const sections = ["Personal Info", "Work Experience", "Education", "Skills", "Projects", "Certifications", "Design"] as const;
type SectionType = typeof sections[number];

function Editor() {
  const { data, updatePersonal, addExperience, updateExperience, removeExperience, updateSkills, addProject, updateProject, setAccent, setTemplate } = useResume();
  const [activeSection, setActiveSection] = useState<SectionType>("Personal Info");
  const [skillInput, setSkillInput] = useState("");

  const currentIndex = sections.indexOf(activeSection);
  const nextSection = () => {
    if (currentIndex < sections.length - 1) setActiveSection(sections[currentIndex + 1]);
  };
  const prevSection = () => {
    if (currentIndex > 0) setActiveSection(sections[currentIndex - 1]);
  };

  const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim()) {
      updateSkills([...data.skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleGitHubImport = (imported: any) => {
    updatePersonal(imported.personal);
    updateSkills(imported.skills);
    // Add projects if none exist
    if (data.projects.length <= 1 && data.projects[0].name === "") {
        imported.projects.forEach((p: any) => {
            // This is a bit hacky since I don't have a bulk add, but I'll update the first one or add new ones
            addProject();
            // ... update logic here
        });
    }
  };

  return (
    <AppShell>
      <div className="grid min-h-[calc(100vh-3.5rem)] md:min-h-screen md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* LEFT FORM PANEL */}
        <div className="border-b border-border md:border-b-0 md:border-r md:overflow-y-auto md:h-screen bg-surface">
          <div className="px-6 py-6 pb-24">
            <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-3 w-3" /> My Resumes
            </Link>
            
            <div className="flex items-center justify-between mt-3 group">
               <input 
                 defaultValue="Software Engineer Resume" 
                 className="w-full rounded-lg border border-transparent bg-transparent text-2xl font-extrabold focus:border-primary focus:outline-none focus:px-2 transition-all" 
               />
               <button className="opacity-0 group-hover:opacity-100 btn-ghost p-1.5"><Sparkles className="h-4 w-4 text-primary" /></button>
            </div>

            {/* Section Stepper */}
            <div className="mt-8">
              <nav className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-extrabold text-primary">
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
                      <GitHubImport onImport={handleGitHubImport} />
                      <PersonalInfo personal={data.personal} updatePersonal={updatePersonal} accentColor={data.accentColor} />
                    </div>
                )}
                {activeSection === "Work Experience" && <WorkExperienceList experience={data.experience} updateExperience={updateExperience} addExperience={addExperience} removeExperience={removeExperience} />}
                {activeSection === "Education" && <EducationSection education={data.education} updateEducation={(id, edu) => {}} />}
                {activeSection === "Skills" && <SkillsSection skills={data.skills} updateSkills={updateSkills} skillInput={skillInput} setSkillInput={setSkillInput} addSkill={addSkill} />}
                {activeSection === "Projects" && <ProjectsSection projects={data.projects} updateProject={updateProject} addProject={addProject} />}
                {activeSection === "Certifications" && <CertificationsSection />}
                {activeSection === "Design" && <CustomizationPanel accentColor={data.accentColor} setAccent={setAccent} template={data.template} setTemplate={setTemplate} />}
              </div>
            </div>

            <div className="sticky bottom-0 mt-12 -mx-6 border-t border-border bg-surface/95 px-6 py-4 backdrop-blur flex gap-3">
              <button disabled={currentIndex === 0} onClick={prevSection} className="btn-outline flex-1 py-3 text-xs font-bold"><ChevronLeft className="mr-1 h-3 w-3" /> Previous</button>
              {currentIndex === sections.length - 1 ? (
                 <button className="flex-[2] rounded-full gradient-emerald px-6 py-3 text-xs font-bold text-white shadow-glow"><Sparkles className="mr-2 inline h-4 w-4" /> Finalize Resume</button>
              ) : (
                <button onClick={nextSection} className="btn-primary flex-[2] py-3 text-xs font-bold">Continue to {sections[currentIndex + 1]} <ChevronRight className="ml-1 h-3 w-3" /></button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PREVIEW PANEL */}
        <div className="bg-surface-2/40 md:overflow-y-auto md:h-screen border-l border-border">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/90 px-6 py-3 backdrop-blur">
            <div className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live Preview</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-outline px-3 py-1.5 text-[11px]"><Share2 className="h-3.5 w-3.5" /> Share</button>
              <button className="btn-primary px-3 py-1.5 text-[11px]"><Download className="h-3.5 w-3.5" /> Download PDF</button>
            </div>
          </div>

          <div className="p-6 md:p-10 scale-[0.9] lg:scale-100 origin-top">
            <ResumePreview data={data} />
          </div>
          
          <div className="flex justify-center pb-10">
             <div className="pill-muted bg-surface border border-border py-1.5 px-4 text-[10px] flex items-center gap-2">
                <span className="flex h-1.5 w-1.5 rounded-full bg-primary" /> Changes sync in real-time
             </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, value, onChange, type = "text", className = "" }: { label: string; value: string; onChange: (val: string) => void; type?: string; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-tight text-muted-foreground/70">{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="input-base" 
      />
    </div>
  );
}

function PersonalInfo({ personal, updatePersonal, accentColor }: { personal: ResumeData["personal"]; updatePersonal: any; accentColor: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className={`relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border-2 ${personal.removeBackground ? 'border-primary shadow-glow' : 'border-dashed border-border'} bg-surface flex flex-col items-center justify-center transition-all`}>
          {personal.photoUrl ? (
             <div className="w-full h-full relative">
                <img src={personal.photoUrl} alt="Profile" className={`h-full w-full object-cover transition-all ${personal.removeBackground ? 'grayscale-[0.5] mix-blend-multiply' : ''}`} />
                {personal.removeBackground && (
                    <div className={`absolute inset-0 -z-10 bg-${accentColor}-500/20`} style={{ backgroundColor: personal.removeBackground ? `var(--color-${accentColor}-soft)` : '' }} />
                )}
             </div>
          ) : (
            <>
              <Camera className="h-5 w-5 text-muted-foreground" />
              <p className="mt-1 text-[10px] font-bold text-muted-foreground">Upload Photo</p>
            </>
          )}
        </div>
        <div className="space-y-3">
            <button className="btn-outline px-4 py-2 text-xs"><Camera className="h-3.5 w-3.5" /> Change Photo</button>
            <div className="flex items-center gap-2">
                <button 
                  onClick={() => updatePersonal({ removeBackground: !personal.removeBackground })}
                  className={`btn-primary px-3 py-2 text-[11px] transition-all ${personal.removeBackground ? 'gradient-emerald' : 'bg-surface border border-border text-foreground hover:text-primary'}`}
                >
                  <Sparkles className="h-3 w-3 mr-1.5" /> {personal.removeBackground ? "Background Removed" : "Remove Background"}
                </button>
            </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Full Name" value={personal.fullName} onChange={(v) => updatePersonal({ fullName: v })} />
        <Field label="Job Title" value={personal.jobTitle} onChange={(v) => updatePersonal({ jobTitle: v })} />
        <Field label="Email" value={personal.email} onChange={(v) => updatePersonal({ email: v })} />
        <Field label="Phone" value={personal.phone} onChange={(v) => updatePersonal({ phone: v })} />
        <Field label="Location" value={personal.location} onChange={(v) => updatePersonal({ location: v })} />
        <Field label="LinkedIn URL" value={personal.linkedin} onChange={(v) => updatePersonal({ linkedin: v })} />
        <Field label="Portfolio URL" value={personal.portfolio} className="col-span-2" onChange={(v) => updatePersonal({ portfolio: v })} />
      </div>
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
               rows={4} 
               value={exp.description} 
               onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
               className="input-base resize-none" 
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

function EducationSection({ education, updateEducation }: { education: Education[]; updateEducation: any }) {
  return (
    <div className="space-y-6">
      <div className="card-soft p-5 border-l-4 border-l-amber-500/30">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Degree" value="B.S. Computer Science" onChange={() => {}} />
          <Field label="Institution" value="Stanford University" onChange={() => {}} />
          <Field label="Field of Study" value="Human-Computer Interaction" onChange={() => {}} />
          <Field label="Grade" value="3.9 GPA" onChange={() => {}} />
          <Field label="Start Year" value="2016" onChange={() => {}} />
          <Field label="End Year" value="2020" onChange={() => {}} />
        </div>
      </div>
      <button className="btn-outline w-full py-4 border-dashed border-2 hover:bg-primary/5"><Plus className="h-4 w-4" /> Add Education</button>
    </div>
  );
}

function SkillsSection({ skills, updateSkills, skillInput, setSkillInput, addSkill }: any) {
  return (
    <div className="space-y-6">
      <div className="card-soft p-5">
        <label className="mb-3 block text-[11px] font-bold uppercase tracking-tight text-muted-foreground/70">My Skills</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((s: string) => (
            <span key={s} className="pill-green animate-in zoom-in duration-300">
              {s}
              <button onClick={() => updateSkills(skills.filter((x: string) => x !== s))} className="ml-1.5 hover:text-destructive"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
        <div className="relative">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={addSkill}
              placeholder="e.g. React, UI/UX Design, Python (Press Enter to add)"
              className="input-base pr-10"
            />
            <button onClick={() => { if(skillInput.trim()){ updateSkills([...skills, skillInput.trim()]); setSkillInput(""); } }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary">
                <Plus className="h-4 w-4" />
            </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
            <p className="text-[10px] text-muted-foreground w-full mb-1">Suggestions:</p>
            {["Next.js", "Figma", "Node.js", "TailwindCSS", "PostgreSQL", "Docker", "AWS"].filter(s => !skills.includes(s)).slice(0, 5).map(s => (
                <button key={s} onClick={() => updateSkills([...skills, s])} className="text-[10px] bg-muted px-2 py-1 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">+{s}</button>
            ))}
        </div>
      </div>
    </div>
  );
}

function ProjectsSection({ projects, updateProject, addProject }: { projects: Project[]; updateProject: any; addProject: any }) {
  return (
    <div className="space-y-6">
      {projects.map((proj) => (
        <div key={proj.id} className="card-soft p-5 border-l-4 border-l-teal-500/30">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Project Name" value={proj.name} onChange={(v) => updateProject(proj.id, { name: v })} />
            <Field label="Link / URL" value={proj.url} onChange={(v) => updateProject(proj.id, { url: v })} />
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-tight text-muted-foreground/70">Description</label>
            <textarea 
              rows={3} 
              value={proj.description} 
              onChange={(e) => updateProject(proj.id, { description: e.target.value })}
              className="input-base resize-none" 
            />
            <AIEnhanceButton currentText={proj.description} type="project" onAccept={(text) => updateProject(proj.id, { description: text })} />
          </div>
        </div>
      ))}
      <button onClick={addProject} className="btn-outline w-full py-4 border-dashed border-2"><Plus className="h-4 w-4" /> Add Project</button>
    </div>
  );
}

function CertificationsSection() {
  return (
    <div className="space-y-6">
      <div className="card-soft p-5 grid grid-cols-2 gap-4 border-l-4 border-l-indigo-500/30">
        <Field label="Certificate" value="AWS Solutions Architect" onChange={() => {}} />
        <Field label="Issuer" value="Amazon" onChange={() => {}} />
      </div>
      <button className="btn-outline w-full py-4 border-dashed border-2"><Plus className="h-4 w-4" /> Add Certification</button>
    </div>
  );
}

function ResumePreview({ data }: { data: ResumeData }) {
  const { personal, experience, education, skills, projects, accentColor, template } = data;

  const accentStyles = useMemo(() => {
    const colors: Record<string, string> = {
      emerald: "#22C55E",
      slate: "#475569",
      amber: "#F59E0B",
      teal: "#14B8A6",
      indigo: "#6366F1",
      rose: "#F43F5E",
    };
    return { color: colors[accentColor] || colors.emerald };
  }, [accentColor]);

  // Different template layouts
  if (template === "minimal") {
      return (
        <div className="mx-auto aspect-[1/1.414] max-w-[850px] overflow-hidden rounded-xl bg-white p-12 text-slate-900 shadow-card ring-1 ring-border">
          <div className="text-center mb-10">
             <h1 className="text-4xl font-light tracking-tight">{personal.fullName}</h1>
             <p className="mt-2 text-sm uppercase tracking-widest text-slate-500" style={accentStyles}>{personal.jobTitle}</p>
             <div className="mt-4 flex items-center justify-center gap-3 text-[10px] text-slate-400">
                <span>{personal.email}</span>
                <span>•</span>
                <span>{personal.location}</span>
                <span>•</span>
                <span>{personal.phone}</span>
             </div>
          </div>
          
          <div className="space-y-10">
              <section>
                 <h2 className="text-[10px] items-center flex gap-2 font-bold uppercase tracking-widest text-slate-400 mb-4 after:flex-1 after:h-[1px] after:bg-slate-100">Experience</h2>
                 <div className="space-y-6">
                    {experience.map(exp => (
                        <div key={exp.id}>
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="text-sm font-bold">{exp.role}</h3>
                                <span className="text-[10px] text-slate-400">{exp.startDate} — {exp.endDate}</span>
                            </div>
                            <p className="text-xs text-slate-600 mb-2">{exp.company}</p>
                            <p className="text-[11px] leading-relaxed text-slate-500">{exp.description}</p>
                        </div>
                    ))}
                 </div>
              </section>

              <section>
                 <h2 className="text-[10px] items-center flex gap-2 font-bold uppercase tracking-widest text-slate-400 mb-4 after:flex-1 after:h-[1px] after:bg-slate-100">Skills</h2>
                 <div className="flex flex-wrap gap-2">
                    {skills.map(s => <span key={s} className="text-[11px] text-slate-600 px-2 py-1 bg-slate-50 rounded">{s}</span>)}
                 </div>
              </section>
          </div>
        </div>
      );
  }

  return (
    <div className="mx-auto aspect-[1/1.414] max-w-[850px] overflow-hidden rounded-xl bg-white p-0 text-slate-900 shadow-card ring-1 ring-border flex">
      {/* Sidebar for classic template */}
      {template === "classic" && (
          <aside className="w-1/3 bg-slate-50 p-8 border-r border-slate-100">
             <div className="mb-8">
                {personal.photoUrl && (
                    <div className={`mb-6 h-32 w-32 mx-auto overflow-hidden rounded-full border-4 ${personal.removeBackground ? 'border-primary' : 'border-white'} shadow-md`} style={{ borderColor: personal.removeBackground ? accentStyles.color : 'white' }}>
                        <img src={personal.photoUrl} alt="Avatar" className="h-full w-full object-cover" />
                    </div>
                )}
                <h1 className="text-xl font-bold text-center">{personal.fullName}</h1>
                <p className="text-[10px] text-center uppercase tracking-wider mt-1 text-slate-500" style={accentStyles}>{personal.jobTitle}</p>
             </div>

             <div className="space-y-6">
                <div>
                   <h3 className="text-[11px] font-bold uppercase text-slate-400 mb-3 border-b border-slate-200 pb-1">Contact</h3>
                   <div className="space-y-2 text-[10px] text-slate-600">
                      <p className="flex items-center gap-2">{personal.email}</p>
                      <p className="flex items-center gap-2">{personal.phone}</p>
                      <p className="flex items-center gap-2">{personal.location}</p>
                   </div>
                </div>
                <div>
                   <h3 className="text-[11px] font-bold uppercase text-slate-400 mb-3 border-b border-slate-200 pb-1">Skills</h3>
                   <div className="flex flex-wrap gap-1.5">
                      {skills.map(s => <span key={s} className="bg-white border border-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600">{s}</span>)}
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
                        <p className="mt-1 text-base font-semibold" style={accentStyles}>{personal.jobTitle}</p>
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
            <Section title="Experience" accentColor={accentStyles.color}>
                {experience.map(exp => (
                    <Job 
                      key={exp.id}
                      role={exp.role} 
                      company={exp.company} 
                      date={`${exp.startDate} — ${exp.endDate}`} 
                      bullets={exp.description.split('.').filter(b => b.trim()).map(b => b.trim())} 
                    />
                ))}
            </Section>

            {education.length > 0 && (
                <Section title="Education" accentColor={accentStyles.color}>
                    {education.map(edu => (
                        <div key={edu.id} className="flex justify-between items-baseline">
                             <p className="text-xs font-bold">{edu.degree} · <span className="font-semibold text-slate-600">{edu.institution}</span></p>
                             <p className="text-[10px] text-slate-500">{edu.startYear} — {edu.endYear}</p>
                        </div>
                    ))}
                </Section>
            )}

            {projects.length > 0 && (
                <Section title="Projects" accentColor={accentStyles.color}>
                    {projects.map(proj => (
                         <Job 
                          key={proj.id}
                          role={proj.name} 
                          company={proj.url} 
                          date="" 
                          bullets={[proj.description]} 
                        />
                    ))}
                </Section>
            )}
            
            {template !== "classic" && (
                <Section title="Skills" accentColor={accentStyles.color}>
                    <div className="flex flex-wrap gap-1.5">
                        {skills.map((s) => (
                            <span 
                                key={s} 
                                className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" 
                                style={{ backgroundColor: `${accentStyles.color}15`, color: accentStyles.color }}
                            >
                                {s}
                            </span>
                        ))}
                    </div>
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

function Job({ role, company, date, bullets }: { role: string; company: string; date: string; bullets: string[] }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-bold">{role} · <span className="font-semibold text-slate-600">{company}</span></p>
        <p className="text-[10px] text-slate-500 font-medium">{date}</p>
      </div>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-slate-600">
        {bullets.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
    </div>
  );
}

