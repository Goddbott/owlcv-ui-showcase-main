import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { AppShell } from "@/components/AppSidebar";
import { Sparkles, Search, FileText, Briefcase, Zap, CheckCircle2, AlertCircle, Loader2, Upload } from "lucide-react";
import { extractTextFromPDF } from "@/lib/pdf-parser";
import { extractTextFromDocx } from "@/lib/docx-parser";
import { analyzeResumeAgainstJobDescription, type AIKeywordResult } from "@/lib/gemini";

export const Route = createFileRoute("/optimizer")({
  component: Optimizer,
});

function Optimizer() {
  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AIKeywordResult | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      let extractedText = "";
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const result = await extractTextFromPDF(file);
        extractedText = result.text;
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
        file.name.endsWith(".docx")
      ) {
        extractedText = await extractTextFromDocx(file);
      } else {
        alert("Unsupported file type. Please upload a PDF or DOCX file.");
        return;
      }
      setResumeText(extractedText);
      setUploadedFileName(file.name);
    } catch (error) {
      console.error("Error parsing file:", error);
      alert("Error parsing file. Please check the console for details.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleScan = async () => {
    if (!resumeText.trim() || !jobDescriptionText.trim()) {
      alert("Please provide both a resume and a job description.");
      return;
    }
    
    setIsScanning(true);
    try {
      const result = await analyzeResumeAgainstJobDescription(resumeText, jobDescriptionText);
      setAnalysisResult(result);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Analysis failed. Please try again.");
    } finally {
      setIsScanning(false);
    }
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
                    <FileText className="h-4 w-4 text-primary" /> Upload Resume
                 </div>
                 <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${resumeText ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}
                 >
                    {isUploading ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm font-medium">Extracting Text...</p>
                        </div>
                    ) : resumeText ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                            <FileText className="h-8 w-8 text-primary" />
                            <p className="text-sm font-medium">{uploadedFileName || "Resume Uploaded Successfully"}</p>
                            <p className="text-xs text-muted-foreground mt-1">Click to replace</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-2">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">Click to upload PDF or DOCX</p>
                            <p className="text-xs text-muted-foreground mt-1">Maximum file size 5MB</p>
                        </div>
                    )}
                 </div>
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload}
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                    className="hidden" 
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
                   value={jobDescriptionText}
                   onChange={(e) => setJobDescriptionText(e.target.value)}
                 />
              </div>

              <button 
                onClick={handleScan}
                disabled={isScanning || !resumeText.trim() || !jobDescriptionText.trim()}
                className="btn-primary w-full py-4 text-sm font-bold shadow-glow disabled:opacity-50"
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
              {!analysisResult ? (
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
                                  strokeDashoffset={440 - (440 * analysisResult.score) / 100} 
                                  strokeLinecap="round" 
                                  stroke="currentColor" 
                                  fill="transparent" 
                                  r="70" 
                                  cx="80" 
                                  cy="80" 
                                />
                            </svg>
                            <span className="absolute text-5xl font-black text-foreground">{analysisResult.score}%</span>
                        </div>
                        <p className={`mt-6 text-sm font-bold ${analysisResult.score > 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                           {analysisResult.score > 80 ? 'Excellent Match!' : 'Strong, but needs improvement'}
                        </p>
                    </div>

                    <div className="card-soft p-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Keyword Gap Analysis</h3>
                        <div className="space-y-3">
                            {analysisResult.missingKeywords.flatMap((category) => 
                                category.keywords.map((kw, i) => (
                                    <GapItem key={`missing-${category.category}-${i}`} label={kw} status="missing" />
                                ))
                            )}
                            {analysisResult.matchedKeywords.flatMap((category) => 
                                category.keywords.map((kw, i) => (
                                    <GapItem key={`matched-${category.category}-${i}`} label={kw} status="matched" />
                                ))
                            )}
                            {analysisResult.missingKeywords.length === 0 && analysisResult.matchedKeywords.length === 0 && (
                                <p className="text-xs text-muted-foreground italic">No specific keywords identified.</p>
                            )}
                        </div>
                    </div>

                    {analysisResult.suggestions.length > 0 && (
                        <div className="card-soft p-6 border-primary/20 bg-primary/5">
                            <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">OwlAI Suggestions</h3>
                            <ul className="text-xs leading-relaxed text-foreground/80 space-y-2 list-disc pl-4 text-left">
                                {analysisResult.suggestions.map((suggestion, index) => (
                                    <li key={index}>{suggestion}</li>
                                ))}
                            </ul>
                        </div>
                    )}
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
