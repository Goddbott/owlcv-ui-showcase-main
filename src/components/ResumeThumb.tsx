export function ResumeThumb({ accent = "emerald", className = "" }: { accent?: "emerald" | "amber" | "teal" | "slate" | "lime" | "blue"; className?: string }) {
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
    <div className={`relative aspect-[3/4] overflow-hidden rounded-xl bg-gradient-to-br from-white to-slate-50 ring-1 ring-border shadow-soft ${className}`}>
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
    </div>
  );
}
