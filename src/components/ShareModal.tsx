import { X, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: string;
}

export function ShareModal({ isOpen, onClose, link }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md scale-100 rounded-2xl bg-surface p-6 shadow-2xl ring-1 ring-border animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold text-foreground">Share Resume</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-muted text-muted-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-6">
          Anyone with this link can view your resume. It's public and ready to share!
        </p>

        <div className="flex items-center gap-2">
          <input 
            type="text" 
            readOnly 
            value={link} 
            className="input-base flex-1 bg-muted/50 font-medium text-sm text-foreground focus:ring-primary"
            onClick={(e) => e.currentTarget.select()}
          />
          <button 
            onClick={handleCopy}
            className="btn-primary shadow-glow flex h-[42px] items-center justify-center px-4 transition-all w-[100px]"
          >
            {copied ? (
              <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Copied</span>
            ) : (
              <span className="flex items-center gap-2"><Copy className="h-4 w-4" /> Copy</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
