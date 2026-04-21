export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-extrabold tracking-tight ${className}`}>
      <span className="text-2xl leading-none">🦉</span>
      <span className="text-primary">OwlCV</span>
    </span>
  );
}
