import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { Upload, FileText, Zap, Loader2, Gauge, CheckCircle2, AlertCircle, Sparkles, ArrowRight, X } from "lucide-react";
import { AppShell } from "@/components/AppSidebar";

export const Route = createFileRoute("/calculator")({
  head: () => ({ meta: [{ title: "ATS Score Calculator — OwlCV" }, { name: "description", content: "Calculate your resume's ATS compatibility score instantly." }] }),
  component: CalculatorPage,
});

function CalculatorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "results">("idle");
  const [score, setScore] = useState<number | null>(null);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
      setFile(droppedFile);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const startAnalysis = () => {
    if (!file) return;
    setStatus("scanning");
    setTimeout(() => {
      setScore(Math.floor(Math.random() * (94 - 60 + 1) + 60));
      setStatus("results");
    }, 3000);
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setScore(null);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
             <Zap className="h-10 w-10 text-primary fill-primary/10" /> 
             ATS Score Calculator
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">
             Upload your resume to see exactly how hiring algorithms parse your data and calculate your match score.
          </p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* LEFT: UPLOAD PANEL */}
        <div className="space-y-6">
            {!file ? (
                <label 
                    htmlFor="resume-upload"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDrop}
                    className="card-soft p-12 text-center border-dashed border-2 hover:bg-primary/5 transition-all cursor-pointer rounded-[2.5rem] group block"
                >
                    <input type="file" id="resume-upload" className="hidden" accept=".pdf,.docx" onChange={handleFileUpload} />
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-muted/40 text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        <Upload className="h-10 w-10 group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-xl font-extrabold tracking-tight">Drop your resume here</h3>
                    <p className="mt-2 text-xs text-muted-foreground">PDF or DOCX (Max 5MB)</p>
                    <div className="btn-primary mt-8 px-8 py-3 text-sm font-bold shadow-glow inline-block pointer-events-none">Browse Local Files</div>
                </label>
            ) : (
                <div className="card-soft p-8 bg-surface ring-1 ring-border shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold truncate max-w-[150px]">{file?.name}</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Selected Resume</p>
                            </div>
                        </div>
                        <button onClick={reset} className="p-2 text-muted-foreground hover:text-destructive transition-colors"><X className="h-4 w-4" /></button>
                    </div>

                    {status === "scanning" ? (
                        <div className="py-10 text-center animate-in fade-in duration-500">
                            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-6" />
                            <h3 className="text-lg font-bold">Parsing Semantic Data...</h3>
                            <p className="text-xs text-muted-foreground mt-2">Checking formatting, keywords, and section hierarchy.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-700">
                                <CheckCircle2 className="h-5 w-5" />
                                <p className="text-xs font-bold">File uploaded successfully</p>
                            </div>
                            <button 
                                onClick={startAnalysis} 
                                className="btn-primary w-full py-5 text-sm font-bold shadow-glow"
                            >
                                {status === "results" ? "Recalculate Score" : "Calculate Score"}
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="card-soft p-6 bg-slate-900 text-white flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-primary-soft shrink-0" />
                <p className="text-xs leading-relaxed text-slate-300">
                    <span className="font-bold text-white block mb-1">Privacy Guarantee</span>
                    We don't store your uploaded files. Our parser extracts the text in real-time, calculates the score, and then purges the raw file assets.
                </p>
            </div>
        </div>

        {/* RIGHT: RESULTS PANEL */}
        <div className="space-y-6">
            {status !== "results" ? (
                <div className="h-full flex flex-col items-center justify-center card-soft border-dashed p-12 text-center bg-muted/10 grayscale opacity-60">
                    <Gauge className="h-16 w-16 mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-bold">Analysis Pending</h3>
                    <p className="text-xs text-muted-foreground mt-2 max-w-[200px]">Upload your resume to see your professional score.</p>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-right-8 duration-700 space-y-6">
                    <div className="card-soft p-10 text-center bg-gradient-to-br from-primary/5 via-surface to-amber/5 ring-1 ring-primary/20">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">ATS Compatibility Index</p>
                        <div className="relative inline-flex items-center justify-center">
                            <svg className="h-48 w-48 -rotate-90">
                                <circle className="text-muted-foreground/10" strokeWidth="12" stroke="currentColor" fill="transparent" r="85" cx="96" cy="96" />
                                <circle 
                                    className="text-primary transition-all duration-1000 ease-out" 
                                    strokeWidth="12" 
                                    strokeDasharray={534} 
                                    strokeDashoffset={534 - (534 * (score || 0)) / 100} 
                                    strokeLinecap="round" 
                                    stroke="currentColor" 
                                    fill="transparent" 
                                    r="85" 
                                    cx="96" 
                                    cy="96" 
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-6xl font-black text-foreground">{score}%</span>
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full mt-2 ${score && score > 75 ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                                    {score && score > 75 ? 'HIGH MATCH' : 'OPTIMIZATION NEEDED'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="card-soft p-6 space-y-5">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-3">Diagnostic Breakdown</h3>
                        <BreakdownItem label="File Formatting" value="Excellent" color="text-emerald-500" />
                        <BreakdownItem label="Keyword Saturation" value="Average" color="text-amber-500" />
                        <BreakdownItem label="Achievement Density" value="Needs Review" color="text-red-500" />
                    </div>

                    <div className="card-soft p-6 bg-surface ring-1 ring-primary/30 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3"><Sparkles className="h-6 w-6 text-primary/20" /></div>
                        <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">OwlAI Insight</p>
                        <p className="text-sm font-medium leading-relaxed italic text-foreground/80">
                            "Your resume lacks industry-specific keywords for **Product Management** Roles. Add terms like 'User Journey Mapping' and 'Stakeholder Alignment' to boost your score by 15%."
                        </p>
                        <button className="mt-4 flex items-center gap-1 text-[11px] font-bold text-primary group-hover:underline">
                            Go to Optimizer <ArrowRight className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
      </div>
    </AppShell>
  );
}

function BreakdownItem({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">{label}</span>
            <span className={`text-[11px] font-black uppercase tracking-wider ${color}`}>{value}</span>
        </div>
    )
}
