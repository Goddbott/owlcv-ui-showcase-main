import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Upload, Loader2, Sparkles, Check, AlertCircle, FileText, X, Wand2, Zap, LayoutTemplate, Shield, Rocket, Target } from "lucide-react";
import { AppShell } from "@/components/AppSidebar";
import { extractTextFromPDF } from "@/lib/pdf-parser";
import { extractTextFromDocx } from "@/lib/docx-parser";
import { parseResumeWithAI } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";
import { createResume } from "@/server/functions";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/ai-import")({
  component: AIImport,
});

function AIImport() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "extracting" | "parsing" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate({ to: "/signin" });
        return;
      }
      setUser(session.user);
    });
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf" || 
          selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("Please upload a PDF or DOCX file.");
        setFile(null);
      }
    }
  };

  const handleImport = async () => {
    if (!file || !user) return;

    try {
      setStatus("extracting");
      let text = "";
      
      if (file.type === "application/pdf") {
        const result = await extractTextFromPDF(file);
        text = result.text;
      } else {
        text = await extractTextFromDocx(file);
      }

      if (!text.trim()) {
        throw new Error("Could not extract text from the file. Please ensure it's not an image-only PDF.");
      }

      setStatus("parsing");
      const parsedData = await parseResumeWithAI(text);
      
      // Ensure the resume opens in Jake's Template (latex) with standard settings
      const finalResumeData = {
        ...parsedData,
        template: "latex",
        accentColor: "slate",
        settings: {
          fontSize: 10,
          lineHeight: 1.4,
          letterSpacing: 0,
          fontFamily: "Inter",
          padding: 32,
        }
      };

      setStatus("saving");
      const resume = await createResume({
        data: {
          user_id: user.id,
          title: `Imported: ${file.name.replace(/\.[^/.]+$/, "")}`,
          content: finalResumeData,
        },
      });

      if (resume) {
        navigate({ to: `/editor/${resume.id}` });
      }
    } catch (err: any) {
      console.error("AI Import failed:", err);
      setError(err.message || "An unexpected error occurred during import.");
      setStatus("idle");
    }
  };

  return (
    <AppShell>
      <div className="relative min-h-screen overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 -z-10 bg-background" />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,#14B68815_0%,transparent_70%)] pointer-events-none" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-20 -top-20 h-[500px] w-[500px] -z-10 rounded-full bg-[#14B688]/10 blur-[100px] pointer-events-none" 
        />

        <div className="mx-auto max-w-5xl px-6 py-8 md:py-16 relative z-10">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-8 group">
              <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" /> Back to Dashboard
            </Link>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <Wand2 className="h-3 w-3" /> Magic Feature
                </span>
                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <Zap className="h-3 w-3" /> Instant
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                Magic <span className="text-primary">AI Import</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Transform your existing resume into a professional, ATS-optimized OwlCV in seconds. No formatting, no hassle — just magic.
              </p>
            </div>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Main Upload Area */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-7"
            >
              <div className={`relative card-soft overflow-hidden p-1 transition-all duration-500 ${status !== 'idle' ? 'opacity-70 scale-[0.98]' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-emerald-500/5 pointer-events-none" />
                
                <div 
                  className={`relative rounded-[1.25rem] border-2 border-dashed transition-all duration-300 p-8 md:p-16 text-center
                    ${file ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:border-primary hover:bg-primary/5'}
                  `}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary', 'bg-primary/10'); }}
                  onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-primary', 'bg-primary/10'); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-primary', 'bg-primary/10');
                    const droppedFile = e.dataTransfer.files[0];
                    if (droppedFile) {
                      if (droppedFile.type === "application/pdf" || droppedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                        setFile(droppedFile);
                        setError(null);
                      } else {
                        setError("Invalid file type. Please use PDF or DOCX.");
                      }
                    }
                  }}
                >
                  <AnimatePresence mode="wait">
                    {file ? (
                      <motion.div 
                        key="file-selected"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center"
                      >
                        <div className="h-24 w-20 bg-primary text-white rounded-lg shadow-glow flex items-center justify-center mb-6 relative group">
                           <FileText className="h-10 w-10" />
                           <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                           </div>
                        </div>
                        <h2 className="text-xl font-extrabold text-foreground mb-1">{file.name}</h2>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.split('/')[1].toUpperCase()}
                        </p>
                        
                        {status === 'idle' && (
                          <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
                            <motion.button 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleImport}
                              className="w-full rounded-full bg-primary py-4 text-sm font-bold text-white shadow-glow flex items-center justify-center gap-2"
                            >
                              <Sparkles className="h-4 w-4" /> Start Magic Import
                            </motion.button>
                            <button 
                              onClick={() => setFile(null)} 
                              className="text-xs font-bold text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center gap-1"
                            >
                              <X className="h-3 w-3" /> Change File
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="no-file"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center"
                      >
                        <div className="h-20 w-20 rounded-[2rem] bg-primary/10 text-primary flex items-center justify-center mb-6 shadow-sm">
                           <Upload className="h-8 w-8" />
                        </div>
                        <h2 className="text-xl font-extrabold text-foreground">Select your existing resume</h2>
                        <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
                          Drag and drop your PDF or DOCX file here, or click the button below to browse.
                        </p>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-8 px-10 py-4 rounded-full bg-foreground text-background text-sm font-bold shadow-soft hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" /> Browse Files
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.docx"
                    className="hidden" 
                  />
                </div>

                {/* Progress Overlay */}
                <AnimatePresence>
                  {status !== 'idle' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface/80 backdrop-blur-md p-10 text-center"
                    >
                      <div className="relative mb-8">
                        <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center">
                           <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute -top-3 -right-3 h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white shadow-glow"
                        >
                           <Sparkles className="h-4 w-4" />
                        </motion.div>
                      </div>
                      
                      <motion.p 
                        key={status}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-black text-foreground mb-3"
                      >
                         {status === "extracting" ? "Reading Document..." : status === "parsing" ? "AI Magic in Progress..." : "Saving Results..."}
                      </motion.p>
                      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                         {status === "extracting" ? "Decoding text layers and analyzing structure from your uploaded file." : status === "parsing" ? "Our Gemini AI is identifying your experience, skills, and projects to rebuild them perfectly." : "Redirection to the editor is happening shortly..."}
                      </p>
                      
                      {/* Fake Progress Bar */}
                      <div className="mt-8 w-full max-w-xs h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: "0%" }}
                          animate={{ 
                            width: status === "extracting" ? "30%" : status === "parsing" ? "80%" : "100%" 
                          }}
                          transition={{ duration: 2 }}
                          className="h-full bg-primary shadow-glow"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 text-destructive text-sm font-bold border border-destructive/20"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" /> {error}
                </motion.div>
              )}
            </motion.div>

            {/* Sidebar / Info Section */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:col-span-5 space-y-6"
            >
              <div className="card-soft p-8 bg-gradient-to-br from-[#14B688] to-[#0d8c68] text-white shadow-glow border-none overflow-hidden relative group">
                <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-white/10 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-700" />
                <h3 className="text-xl font-extrabold mb-4 flex items-center gap-2">
                  <Shield className="h-6 w-6" /> Why Magic Import?
                </h3>
                <ul className="space-y-4">
                  {[
                    { icon: <Target className="h-4 w-4" />, text: "ATS-Optimized Formatting" },
                    { icon: <Zap className="h-4 w-4" />, text: "Instant 30-Second Rebuild" },
                    { icon: <Sparkles className="h-4 w-4" />, text: "AI-Powered Achievement Writing" },
                    { icon: <Rocket className="h-4 w-4" />, text: "Ready to Apply Immediately" }
                  ].map((item, i) => (
                    <motion.li 
                      key={i} 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + (i * 0.1) }}
                      className="flex items-start gap-3 text-sm font-medium text-emerald-50/90 leading-tight"
                    >
                      <span className="mt-0.5 shrink-0">{item.icon}</span>
                      {item.text}
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="card-soft p-8 border-amber-500/20 bg-amber-50/30">
                 <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-widest mb-3">
                   <AlertCircle className="h-4 w-4" /> Pro Tip
                 </div>
                 <p className="text-sm text-amber-800/80 leading-relaxed">
                   For best results, use a <strong>text-based PDF</strong> or Word document. Scanned images or "protected" PDFs might fail to extract text correctly.
                 </p>
              </div>

              <div className="flex flex-col gap-4 p-2">
                 <div className="flex items-center gap-4 text-muted-foreground/60">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Powered By Gemini AI</span>
                    <div className="h-px flex-1 bg-border" />
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
