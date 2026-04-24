export function Logo({ className = "", type = "full" }: { className?: string; type?: "full" | "text" | "icon" }) {
  const src = type === "full" ? "/assets/logo-full.png" : type === "text" ? "/assets/logo-text.png" : "/assets/logo-icon.png";
  return (
    <img src={src} alt="OwlCV Logo" className={`h-8 w-auto object-contain ${className}`} />
  );
}
