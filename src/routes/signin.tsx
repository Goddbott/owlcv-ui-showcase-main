import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/signin")({
  head: () => ({ meta: [{ title: "Sign In — OwlCV" }, { name: "description", content: "Sign in to your OwlCV account." }] }),
  component: SignIn,
});

function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.session) {
        router.navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
  };

  const handleGitHubSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-soft/40 via-background to-amber-soft/30 px-4 py-12">
      <div className="w-full max-w-md card-soft p-8 shadow-card">
        <div className="text-center">
          <Link to="/" className="inline-block"><Logo className="text-xl" /></Link>
          <h1 className="mt-6 text-2xl font-extrabold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to continue building your resume</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSignIn}>
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 ring-1 ring-red-200">
              {error}
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">Email</label>
            <input type="email" className="input-base" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs font-semibold text-foreground">Password</label>
              <a className="text-xs font-semibold text-primary hover:underline" href="#">Forgot password?</a>
            </div>
            <input type="password" className="input-base" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-70">
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or continue with <span className="h-px flex-1 bg-border" />
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={handleGoogleSignIn} type="button" className="btn-outline w-full py-3">
            <GoogleIcon /> Continue with Google
          </button>
          
          <button onClick={handleGitHubSignIn} type="button" className="btn-outline w-full py-3">
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
            Continue with GitHub
          </button>
        </div>

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
