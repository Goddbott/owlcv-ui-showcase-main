import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, FileText, Zap, Loader2, Gauge, CheckCircle2, AlertCircle, ArrowRight, X, MinusCircle, PlusCircle, Lightbulb, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppSidebar";
import { extractTextFromPDF } from "@/lib/pdf-parser";
import { calculateATSScore, ATSResult } from "@/lib/ats-logic";
import { evaluateATSKeywords, AIKeywordResult } from "@/lib/gemini";

export const Route = createFileRoute("/calculator")({
  head: () => ({ meta: [{ title: "ATS Score Calculator — OwlCV" }, { name: "description", content: "Calculate your resume's ATS compatibility score instantly." }] }),
  component: CalculatorPage,
});

function CalculatorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "results">("idle");
  const [result, setResult] = useState<ATSResult | null>(null);
  const [aiKeywordResult, setAiKeywordResult] = useState<AIKeywordResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      setErrorMsg(null);
    } else {
      setErrorMsg("Please upload a valid PDF file.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        if (selectedFile.type === "application/pdf") {
            setFile(selectedFile);
            setErrorMsg(null);
        } else {
            setErrorMsg("Please upload a valid PDF file.");
        }
    }
  };

  const startAnalysis = async () => {
    if (!file) return;
    setStatus("scanning");
    setErrorMsg(null);
    
    try {
      const { text, links } = await extractTextFromPDF(file);
      
      // Call AI for keyword evaluation
      const keywordResult = await evaluateATSKeywords(text);
      setAiKeywordResult(keywordResult);

      const atsResult = calculateATSScore(text, links, keywordResult.score);
      setResult(atsResult);
      setStatus("results");
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Failed to parse PDF.");
      setStatus("idle");
    }
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setResult(null);
    setAiKeywordResult(null);
    setErrorMsg(null);
  };

  const getScoreLabel = (score: number) => {
      if (score >= 90) return { label: 'EXCELLENT', color: 'text-emerald-500', bg: 'bg-emerald-500' };
      if (score >= 75) return { label: 'STRONG', color: 'text-lime-500', bg: 'bg-lime-500' };
      if (score >= 60) return { label: 'MODERATE', color: 'text-amber-500', bg: 'bg-amber-500' };
      if (score >= 40) return { label: 'WEAK', color: 'text-orange-500', bg: 'bg-orange-500' };
      return { label: 'POOR', color: 'text-red-500', bg: 'bg-red-500' };
  };

  return (
    <AppShell>
      <div className="relative min-h-screen pb-20">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.95_0.08_145)_0%,transparent_70%)] opacity-60 pointer-events-none" />
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <span className="pill-amber bg-amber-100 text-amber-700 mb-4 inline-flex"><Sparkles className="h-3 w-3" /> Professional Tool</span>
          <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
             <Zap className="h-10 w-10 text-primary fill-primary/20" /> 
             Software Engineering ATS Calculator
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
             Upload your software engineering resume to see exactly how hiring algorithms parse your data. Uses deterministic rule-based scoring (no AI).
          </p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        {/* LEFT: UPLOAD PANEL & BREAKDOWN */}
        <div className="space-y-6 lg:col-span-4">
            {!file ? (
                <label 
                    htmlFor="resume-upload"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDrop}
                    className="card-soft relative overflow-hidden p-12 text-center border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 hover:ring-4 hover:ring-primary/10 transition-all cursor-pointer rounded-[2.5rem] group block shadow-sm hover:shadow-glow"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
                    <input type="file" id="resume-upload" className="hidden" accept=".pdf" onChange={handleFileUpload} />
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-muted/50 text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all shadow-sm group-hover:shadow-glow">
                        <Upload className="h-10 w-10 group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-xl font-extrabold tracking-tight">Drop your resume</h3>
                    <p className="mt-2 text-xs text-muted-foreground">PDF only (Max 5MB)</p>
                    <div className="btn-primary mt-8 px-8 py-3 text-sm font-bold shadow-glow inline-block pointer-events-none group-hover:scale-[1.02] transition-transform">Browse Local Files</div>
                </label>
            ) : (
                <div className="card-soft p-8 bg-surface ring-1 ring-border shadow-sm">
                    <div className="flex items-center justify-between mb-6 gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary shrink-0">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div className="overflow-hidden min-w-0 flex-1">
                                <p className="text-sm font-bold truncate" title={file?.name}>{file?.name}</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Selected Resume</p>
                            </div>
                        </div>
                        <button onClick={reset} className="p-2 text-muted-foreground hover:text-destructive transition-colors shrink-0"><X className="h-4 w-4" /></button>
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
                                <CheckCircle2 className="h-5 w-5 shrink-0" />
                                <p className="text-xs font-bold">File loaded successfully</p>
                            </div>
                            <button 
                                onClick={startAnalysis} 
                                className="w-full rounded-full gradient-emerald py-5 text-sm font-bold text-white shadow-glow hover:scale-[1.02] transition-transform flex justify-center items-center gap-2"
                            >
                                <Sparkles className="h-4 w-4" /> {status === "results" ? "Recalculate Score" : "Calculate ATS Score"}
                            </button>
                        </div>
                    )}
                </div>
            )}
            
            {errorMsg && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-700 text-sm font-bold">
                    <AlertCircle className="h-5 w-5 shrink-0" /> {errorMsg}
                </div>
            )}

            <div className="card-soft p-6 bg-slate-900 text-white flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-primary-soft shrink-0" />
                <p className="text-xs leading-relaxed text-slate-300">
                    <span className="font-bold text-white block mb-1">Local Processing Guarantee</span>
                    Your resume never leaves your browser. Our parser extracts the text locally using PDF.js and calculates the deterministic score via JavaScript.
                </p>
            </div>
            
            {result && (
                <div className="card-soft p-6 space-y-5 animate-in fade-in slide-in-from-left-8 duration-500">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-3">Score Breakdown</h3>
                    <ProgressBar label="Keyword Coverage (40%)" value={result.subscores.keyword} />
                    <ProgressBar label="Formatting / Parseability (20%)" value={result.subscores.formatting} />
                    <ProgressBar label="Section Completeness (20%)" value={result.subscores.section} />
                    <ProgressBar label="Readability (10%)" value={result.subscores.readability} />
                    <ProgressBar label="Contact / Metadata (10%)" value={result.subscores.metadata} />
                </div>
            )}
        </div>

        {/* RIGHT: RESULTS PANEL */}
        <div className="lg:col-span-8">
            {status !== "results" || !result ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center card-soft border-dashed p-12 text-center bg-muted/10 grayscale opacity-60">
                    <Gauge className="h-16 w-16 mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-bold">Analysis Pending</h3>
                    <p className="text-xs text-muted-foreground mt-2 max-w-[250px]">Upload your resume to see your deterministic software engineering score.</p>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-right-8 duration-700 space-y-6">
                    {/* TOP HERO SCORE */}
                    <div className="card-soft relative overflow-hidden p-10 text-center bg-gradient-to-br from-primary/5 via-surface to-amber/5 ring-1 ring-primary/20 flex flex-col md:flex-row items-center justify-center gap-10 shadow-soft">
                        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
                        <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
                        
                        <div className="relative inline-flex items-center justify-center shrink-0 drop-shadow-xl">
                            <svg className="h-48 w-48 -rotate-90">
                                <circle className="text-muted-foreground/10" strokeWidth="12" stroke="currentColor" fill="transparent" r="85" cx="96" cy="96" />
                                <circle 
                                    className={`${getScoreLabel(result.overallScore).color} transition-all duration-1000 ease-out`} 
                                    strokeWidth="12" 
                                    strokeDasharray={534} 
                                    strokeDashoffset={534 - (534 * result.overallScore) / 100} 
                                    strokeLinecap="round" 
                                    stroke="currentColor" 
                                    fill="transparent" 
                                    r="85" 
                                    cx="96" 
                                    cy="96" 
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-6xl font-black text-foreground drop-shadow-sm">{result.overallScore}</span>
                                <span className="text-xs font-bold text-muted-foreground mt-1 tracking-widest uppercase">/ 100</span>
                            </div>
                        </div>
                        <div className="text-left max-w-sm relative z-10">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">Overall ATS Match</p>
                            <h2 className={`text-4xl font-black ${getScoreLabel(result.overallScore).color} mb-3 drop-shadow-sm`}>
                                {getScoreLabel(result.overallScore).label}
                            </h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Your resume scored a {result.overallScore} based on our deterministic software engineering formula. 
                                Focus on your subscores on the left to identify specific areas for improvement.
                            </p>
                        </div>
                    </div>

                    {/* ISSUES AND SUGGESTIONS */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="card-soft p-6 bg-red-50/50 border-red-100 dark:bg-red-950/20 dark:border-red-900">
                            <h3 className="text-sm font-extrabold flex items-center gap-2 text-red-700 dark:text-red-400 mb-4">
                                <MinusCircle className="h-4 w-4" /> Formatting Issues Detected
                            </h3>
                            {result.formattingIssues.length === 0 ? (
                                <p className="text-xs text-muted-foreground">No major formatting issues detected. Great job!</p>
                            ) : (
                                <ul className="space-y-3">
                                    {result.formattingIssues.map((issue, idx) => (
                                        <li key={idx} className="text-xs text-red-900/80 dark:text-red-200/70 flex items-start gap-2 leading-relaxed">
                                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" /> {issue}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="card-soft p-6 bg-amber-50/50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900">
                            <h3 className="text-sm font-extrabold flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-4">
                                <Lightbulb className="h-4 w-4" /> Improvement Suggestions
                            </h3>
                            {result.suggestions.length === 0 && (!aiKeywordResult || aiKeywordResult.suggestions.length === 0) ? (
                                <p className="text-xs text-muted-foreground">Your resume is highly optimized!</p>
                            ) : (
                                <ul className="space-y-3">
                                    {result.suggestions.map((sug, idx) => (
                                        <li key={`sug-${idx}`} className="text-xs text-amber-900/80 dark:text-amber-200/70 flex items-start gap-2 leading-relaxed">
                                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" /> {sug}
                                        </li>
                                    ))}
                                    {aiKeywordResult?.suggestions.map((sug, idx) => (
                                        <li key={`ai-sug-${idx}`} className="text-xs text-amber-900/80 dark:text-amber-200/70 flex items-start gap-2 leading-relaxed">
                                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" /> [AI] {sug}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* KEYWORDS */}
                    {aiKeywordResult && (
                    <div className="card-soft p-6">
                        <h3 className="text-sm font-extrabold mb-6 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" /> AI Keyword Extraction
                        </h3>
                        <div className="space-y-8">
                            {aiKeywordResult.matchedKeywords.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-3">Matched Skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        {aiKeywordResult.matchedKeywords.flatMap(c => c.keywords).map((kw, i) => (
                                            <span key={i} className="pill-green border border-emerald-500/20"><CheckCircle2 className="h-3 w-3" /> {kw}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {aiKeywordResult.missingKeywords.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Suggested Missing Skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        {aiKeywordResult.missingKeywords.flatMap(c => c.keywords).map((kw, i) => (
                                            <span key={i} className="pill bg-surface border border-border text-muted-foreground/60 line-through opacity-70">{kw}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    )}
                    
                    {/* RAW TEXT DEBUG */}
                    <div className="card-soft p-6 bg-surface-2/30">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Raw Extracted Text (Debugger)</h3>
                        <div className="h-40 overflow-y-auto rounded-lg bg-surface border border-border p-4 text-[10px] font-mono text-muted-foreground whitespace-pre-wrap">
                            {result.rawText}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
      </div>
      </div>
    </AppShell>
  );
}

function ProgressBar({ label, value }: { label: string; value: number }) {
    let colorClass = 'bg-emerald-500';
    if (value < 80) colorClass = 'bg-lime-500';
    if (value < 60) colorClass = 'bg-amber-500';
    if (value < 40) colorClass = 'bg-red-500';

    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-muted-foreground">{label}</span>
                <span className={`text-[11px] font-black ${colorClass.replace('bg-', 'text-')}`}>{value}/100</span>
            </div>
            <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                <div className={`h-full ${colorClass} transition-all duration-1000`} style={{ width: `${value}%` }} />
            </div>
        </div>
    )
}
