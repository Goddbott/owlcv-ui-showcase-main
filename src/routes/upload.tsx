import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Cloud, Check, Sparkles, FileText, Download } from "lucide-react";
import { AppShell } from "@/components/AppSidebar";

export const Route = createFileRoute("/upload")({
  head: () => ({ meta: [{ title: "Upload & Optimize — OwlCV" }, { name: "description", content: "Upload your existing resume and let AI optimize it." }] }),
  component: UploadPage,
});

function UploadPage() {
  const [uploaded, setUploaded] = useState(false);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-10 md:px-10">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold">Upload & Optimize with AI 🦉</h1>
          <p className="mt-3 text-muted-foreground">Upload your existing resume and our AI will enhance it instantly.</p>
        </div>

        {!uploaded ? (
          <button
            onClick={() => setUploaded(true)}
            className="mt-10 flex w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-primary/40 bg-primary-soft/30 px-6 py-16 text-center transition-colors hover:bg-primary-soft/50"
          >
            <span className="text-5xl">🦉</span>
            <Cloud className="h-10 w-10 text-primary" />
            <p className="text-lg font-bold">Drag & drop your PDF or DOCX here</p>
            <p className="text-sm text-muted-foreground">or click to browse files</p>
            <div className="mt-2 flex gap-2"><span className="pill-muted">PDF</span><span className="pill-muted">DOCX</span></div>
          </button>
        ) : (
          <>
            <div className="mt-10 card-soft p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary"><FileText className="h-5 w-5" /></div>
                <div className="flex-1">
                  <p className="font-bold">sarah-johnson-resume.pdf</p>
                  <p className="text-xs text-muted-foreground">2.1 MB · Uploaded just now</p>
                </div>
                <span className="pill-green"><Check className="h-3 w-3" /> Uploaded</span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-muted">
                <div className="h-full w-full rounded-full bg-primary transition-all" />
              </div>
              <button className="mt-5 w-full rounded-full gradient-emerald px-6 py-3 text-sm font-bold text-white shadow-glow">
                <Sparkles className="mr-2 inline h-4 w-4" /> Optimize with AI
              </button>
            </div>

            <div className="mt-6 card-soft border-primary/30 bg-primary-soft/30 p-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🦉</span>
                <h3 className="text-lg font-extrabold">AI Suggestions Applied</h3>
                <span className="pill-green ml-auto">5 improvements</span>
              </div>
              <ul className="mt-4 space-y-2">
                {[
                  "Added quantified achievements to Work Experience",
                  "Rewrote summary to be more impactful and ATS-friendly",
                  "Added 12 relevant industry keywords",
                  "Improved formatting consistency",
                  "Shortened overly long bullet points",
                ].map((s) => (
                  <li key={s} className="flex items-start gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /> {s}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
                <button className="btn-primary"><Download className="h-4 w-4" /> Apply All & Download</button>
                <button className="btn-outline">Review Changes</button>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
