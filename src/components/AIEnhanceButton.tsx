import React, { useState } from "react";
import { Sparkles, Loader2, Check, X, ArrowRight } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface AIEnhanceButtonProps {
  currentText: string;
  onAccept: (newText: string) => void;
  type?: "summary" | "experience" | "project";
}

export function AIEnhanceButton({ currentText, onAccept, type = "experience" }: AIEnhanceButtonProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [suggestedText, setSuggestedText] = useState<string | null>(null);

  const handleEnhance = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentText.trim() || isEnhancing) return;

    setIsEnhancing(true);

    // Count existing bullets (split by newline)
    const existingBullets = currentText.split('\n').filter(b => b.trim());
    const bulletCount = Math.max(1, existingBullets.length);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key missing");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

      const prompt = bulletCount === 1
        ? `You are an expert ATS resume writer. Rewrite the following ${type} description to be a single, professional, impactful, and ATS-friendly bullet point for a resume. Start with a strong action verb. Do not include any quotes, explanations, numbering, or extra formatting. Just the improved line.\n\nOriginal text: "${currentText}"`
        : `You are an expert ATS resume writer. Rewrite the following ${type} description into exactly ${bulletCount} professional, impactful, and ATS-friendly bullet points for a resume. Each bullet must start with a strong action verb. Return each bullet on a new line. Do not include any quotes, numbering, bullet symbols, explanations, or extra formatting. Just ${bulletCount} lines of text.\n\nOriginal text:\n${currentText}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      // Clean up: remove leading bullet symbols/numbers, quotes, and extra whitespace
      const cleaned = text
        .split('\n')
        .map(line => line.replace(/^[\s•\-\*\d.)\]]+/, '').trim())
        .filter(line => line.length > 0)
        .map(line => line.replace(/^["']|["']$/g, ''))
        .join('\n');

      setSuggestedText(cleaned);
    } catch (error) {
      console.warn("Falling back to local simulation due to error:", error);
      
      // Fallback Mock AI Improvements
      const improved = existingBullets.map((bullet, i) => {
        if (type === "experience") {
          return `Spearheaded efforts to ${bullet.charAt(0).toLowerCase()}${bullet.slice(1).replace(/\.$/, '')}, resulting in significant improvement in efficiency and user satisfaction`;
        } else if (type === "summary") {
          return `Results-oriented professional with extensive experience in ${bullet.replace(/\.$/, '')}`;
        } else {
          return `Strategically developed ${bullet.replace(/\.$/, '')}, utilizing modern methodologies to ensure scalability and high performance`;
        }
      }).join('\n');
  
      setSuggestedText(improved);
    } finally {
      setIsEnhancing(false);
    }
  };

  if (suggestedText) {
    return (
      <div className="mt-3 overflow-hidden rounded-xl border border-primary/30 bg-primary/5 p-3 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-primary uppercase tracking-wider">
          <Sparkles className="h-3 w-3" /> AI Suggestion
        </div>
        <p className="text-xs italic leading-relaxed text-foreground/80">{suggestedText}</p>
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setSuggestedText(null);
            }}
            className="flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-3 w-3" /> Reject
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (!suggestedText.includes("API Key missing") && !suggestedText.includes("Failed to generate")) {
                onAccept(suggestedText);
              }
              setSuggestedText(null);
            }}
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-white shadow-glow hover:brightness-105 transition-all"
          >
            <Check className="h-3 w-3" /> Accept
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleEnhance}
      disabled={isEnhancing || !currentText.trim()}
      className="mt-2 flex items-center justify-center rounded-full gradient-emerald px-4 py-2 text-[11px] font-bold text-white shadow-glow hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 transition-all"
    >
      {isEnhancing ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> Optimizing...
        </>
      ) : (
        <>
          <Sparkles className="h-3 w-3 mr-1.5" /> Enhance with AI
        </>
      )}
    </button>
  );
}
