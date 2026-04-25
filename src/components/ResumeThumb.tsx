import { useState, useRef, useEffect } from "react";
import { ResumeData } from "@/hooks/use-resume";
import { ResumePreview } from "@/routes/editor.$id";

export function ResumeThumb({ accent = "emerald", className = "", thumbnailUrl, data }: { accent?: string; className?: string; thumbnailUrl?: string; data?: ResumeData }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      // 210mm is approx 794px at 96dpi
      setScale(width / 794);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [data]);

  const accents: Record<string, string> = {
    emerald: "bg-primary",
    amber: "bg-amber",
    teal: "bg-teal",
    slate: "bg-slate-600",
    lime: "bg-lime",
    blue: "bg-blue-500",
  };
  const bar = accents[accent] ?? accents.emerald;
  return (
    <div ref={containerRef} className={`relative aspect-[1/1.414] overflow-hidden rounded-xl bg-gradient-to-br from-white to-slate-50 ring-1 ring-border shadow-soft ${className}`}>
      {data ? (
        <div className="absolute top-0 left-0 origin-top-left" style={{ transform: `scale(${scale})` }}>
          <div className="pointer-events-none select-none">
            <ResumePreview data={data} />
          </div>
        </div>
      ) : thumbnailUrl ? (
        <img src={thumbnailUrl} alt="Resume Preview" className="absolute inset-0 h-full w-full object-cover object-top" />
      ) : (
        <>
          <div className={`absolute inset-x-0 top-0 h-10 ${bar}`} />
          <div className="absolute left-4 top-3 h-3 w-24 rounded-full bg-white/70" />
          <div className="absolute left-4 top-7 h-2 w-16 rounded-full bg-white/50" />
          <div className="space-y-2 px-4 pt-16">
            <div className="resume-line w-3/4" />
            <div className="resume-line w-2/3" />
            <div className="resume-line w-5/6" />
            <div className="mt-4 h-2 w-1/3 rounded-full bg-foreground/30" />
            <div className="resume-line w-full" />
            <div className="resume-line w-11/12" />
            <div className="resume-line w-4/5" />
            <div className="mt-3 h-2 w-1/4 rounded-full bg-foreground/30" />
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-3 w-10 rounded-full bg-primary/20" />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
