import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppSidebar";
import { Sparkles, Search, FileText, Briefcase, Zap, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export const Route = createFileRoute("/optimizer")({
  component: Optimizer,
});

function Optimizer() {
  const [isScanning, setIsScanning] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setScore(Math.floor(Math.random() * (95 - 65 + 1) + 65));
      setIsScanning(false);
    }, 2500);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-6 py-6 md:px-10 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">ATS Optimizer</h1>
            <p className="mt-1 text-sm text-muted-foreground">Compare your resume with any job description to get an instant match score.</p>
          </div>
          <div className="rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" /> Powered by OwlAI
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
           {/* Inputs */}
           <div className="space-y-6">
              <div className="card-soft p-6">
                 <div className="flex items-center gap-2 mb-4 text-sm font-bold">
                    <FileText className="h-4 w-4 text-primary" /> Paste Your Resume
                 </div>
                 <textarea 
                   rows={10} 
                   placeholder="Paste the text of your resume here..."
                   className="input-base resize-none text-xs leading-relaxed"
                 />
              </div>

              <div className="card-soft p-6">
                 <div className="flex items-center gap-2 mb-4 text-sm font-bold">
                    <Briefcase className="h-4 w-4 text-amber-500" /> Job Description
                 </div>
                 <textarea 
                   rows={8} 
                   placeholder="Paste the job description or requirements here..."
                   className="input-base resize-none text-xs leading-relaxed"
                 />
              </div>

              <button 
                onClick={handleScan}
                disabled={isScanning}
                className="btn-primary w-full py-4 text-sm font-bold shadow-glow"
              >
                {isScanning ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing Match...</>
                ) : (
                    <><Zap className="h-4 w-4 mr-2" /> Scan Content</>
                )}
              </button>
           </div>

           {/* Results */}
           <div className="space-y-6">
              {score === null ? (
                 <div className="card-soft flex h-full min-h-[400px] flex-col items-center justify-center p-8 text-center bg-surface-2/30 border-dashed">
                    <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-bold text-muted-foreground">Ready to Scan</h3>
                    <p className="text-xs text-muted-foreground mt-2 max-w-xs">
                        Fill in your resume and the target job description to see your AI-calculated optimization score.
                    </p>
                 </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-right-8 duration-700 space-y-6">
                    <div className="card-soft p-8 text-center bg-gradient-to-b from-primary/5 to-transparent">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Optimization Score</p>
                        <div className="relative inline-flex items-center justify-center">
                            <svg className="h-40 w-40 transform -rotate-90">
                                <circle className="text-muted-foreground/10" strokeWidth="8" stroke="currentColor" fill="transparent" r="70" cx="80" cy="80" />
                                <circle 
                                  className="text-primary transition-all duration-1000 ease-out" 
                                  strokeWidth="8" 
                                  strokeDasharray={440} 
                                  strokeDashoffset={440 - (440 * score) / 100} 
                                  strokeLinecap="round" 
                                  stroke="currentColor" 
                                  fill="transparent" 
                                  r="70" 
                                  cx="80" 
                                  cy="80" 
                                />
                            </svg>
                            <span className="absolute text-5xl font-black text-foreground">{score}%</span>
                        </div>
                        <p className={`mt-6 text-sm font-bold ${score > 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                           {score > 80 ? 'Excellent Match!' : 'Strong, but needs improvement'}
                        </p>
                    </div>

                    <div className="card-soft p-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Keyword Gap Analysis</h3>
                        <div className="space-y-3">
                            <GapItem label="React Server Components" status="missing" />
                            <GapItem label="TypeScript / Zod" status="matched" />
                            <GapItem label="Responsive Design" status="matched" />
                            <GapItem label="E2E Testing (Cypress)" status="missing" />
                            <GapItem label="State Management" status="matched" />
                        </div>
                    </div>

                    <div className="card-soft p-6 border-primary/20 bg-primary/5">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">OwlAI Suggestion</h3>
                        <p className="text-xs leading-relaxed text-foreground/80">
                           "Your resume is strong on core frontend skills but misses explicit mentions of **Testing** and **Performance Optimization**. Adding these could increase your score to **92%**."
                        </p>
                    </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </AppShell>
  );
}

function GapItem({ label, status }: { label: string; status: 'matched' | 'missing' }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <span className="text-xs font-medium">{label}</span>
            {status === 'matched' ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> Matched
                </span>
            ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold text-destructive bg-destructive/5 px-2 py-0.5 rounded-full">
                    <AlertCircle className="h-3 w-3" /> Missing
                </span>
            )}
        </div>
    )
}
