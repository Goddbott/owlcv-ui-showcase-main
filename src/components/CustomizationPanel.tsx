import React from "react";
import { ResumeThumb } from "./ResumeThumb";
import { Layout, Palette, Check } from "lucide-react";

interface CustomizationPanelProps {
  accentColor: string;
  setAccent: (color: string) => void;
  template: string;
  setTemplate: (template: any) => void;
}

const colors = [
  { name: "Emerald", value: "emerald", class: "bg-emerald-500" },
  { name: "Slate", value: "slate", class: "bg-slate-600" },
  { name: "Amber", value: "amber", class: "bg-amber-500" },
  { name: "Teal", value: "teal", class: "bg-teal-500" },
  { name: "Indigo", value: "indigo", class: "bg-indigo-500" },
  { name: "Rose", value: "rose", class: "bg-rose-500" },
];

const templates = [
  { id: "modern", name: "Modern", description: "Clean & Professional" },
  { id: "classic", name: "Classic", description: "Traditional Layout" },
  { id: "minimal", name: "Minimal", description: "Less is More" },
];

export function CustomizationPanel({ accentColor, setAccent, template, setTemplate }: CustomizationPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Accent Color</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {colors.map((c) => (
            <button
              key={c.value}
              onClick={() => setAccent(c.value)}
              className={`group relative h-8 w-8 rounded-full ${c.class} transition-all hover:scale-110 active:scale-95 flex items-center justify-center`}
              title={c.name}
            >
              {accentColor === c.value && <Check className="h-4 w-4 text-white" />}
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 scale-0 rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background transition-all group-hover:scale-100">
                {c.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Layout className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Resume Template</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`flex flex-col items-center rounded-xl border-2 p-2 transition-all hover:border-primary/50 ${
                template === t.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-surface"
              }`}
            >
              <div className="h-24 w-full overflow-hidden rounded-lg mb-2 bg-surface-2/50 relative">
                 <div className={`absolute inset-0 opacity-40`}><ResumeThumb accent={accentColor as any} /></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    {template === t.id && (
                        <div className="rounded-full bg-primary p-1 shadow-glow animate-in zoom-in">
                            <Check className="h-4 w-4 text-white" />
                        </div>
                    )}
                 </div>
              </div>
              <span className="text-xs font-bold">{t.name}</span>
              <span className="text-[10px] text-muted-foreground">{t.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
