import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/signin")({
  head: () => ({ meta: [{ title: "Sign In — OwlCV" }, { name: "description", content: "Sign in to your OwlCV account." }] }),
  component: SignIn,
});

function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-soft/40 via-background to-amber-soft/30 px-4 py-12">
      <div className="w-full max-w-md card-soft p-8 shadow-card">
        <div className="text-center">
          <Link to="/" className="inline-block"><Logo className="text-xl" /></Link>
          <h1 className="mt-6 text-2xl font-extrabold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to continue building your resume</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">Email</label>
            <input type="email" className="input-base" placeholder="you@example.com" />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs font-semibold text-foreground">Password</label>
              <a className="text-xs font-semibold text-primary hover:underline" href="#">Forgot password?</a>
            </div>
            <input type="password" className="input-base" placeholder="••••••••" />
          </div>
          <button type="submit" className="btn-primary w-full py-3">Sign In</button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or continue with <span className="h-px flex-1 bg-border" />
        </div>

        <button className="btn-outline w-full py-3">
          <GoogleIcon /> Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account? <Link to="/signup" className="font-semibold text-primary hover:underline">Get started free →</Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09A6.997 6.997 0 0 1 5.47 12c0-.73.13-1.43.36-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" /></svg>
  );
}
