import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Camera, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/AppSidebar";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — OwlCV" }, { name: "description", content: "Manage your account settings." }] }),
  component: SettingsPage,
});

const tabs = ["Profile", "Password", "Notifications", "Danger Zone"] as const;

function SettingsPage() {
  const [tab, setTab] = useState<typeof tabs[number]>("Profile");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    };
    fetchUser();
  }, []);
  return (
    <AppShell>
      <div className="px-6 py-8 md:px-10">
        <h1 className="text-3xl font-extrabold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile, password and preferences.</p>

        <div className="mt-8 grid gap-8 md:grid-cols-[200px_1fr]">
          <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col md:overflow-visible">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition-colors ${tab === t ? (t === "Danger Zone" ? "bg-destructive/10 text-destructive" : "bg-primary-soft text-[color:var(--accent-foreground)]") : "text-muted-foreground hover:bg-muted"}`}
              >
                {t}
              </button>
            ))}
          </nav>

          <div className="card-soft p-6 md:p-8">
            {tab === "Profile" && <ProfileTab user={user} />}
            {tab === "Password" && <PasswordTab />}
            {tab === "Notifications" && <NotificationsTab />}
            {tab === "Danger Zone" && <DangerTab />}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ProfileTab({ user }: { user: any }) {
  const fullName = user?.user_metadata?.full_name || "User";
  const initials = fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2);
  const email = user?.email || "";

  return (
    <div>
      <h2 className="text-xl font-extrabold">Profile</h2>
      <div className="mt-6 flex items-center gap-5">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-xl font-extrabold text-primary-foreground">{initials}</div>
          <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-surface text-primary shadow-soft ring-1 ring-border">
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>
        <div>
          <p className="font-bold">{fullName}</p>
          <p className="text-xs text-muted-foreground">JPG or PNG, max 2MB</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Full Name" value={fullName} />
        <Field label="Email" value={email} />
        <Field label="Phone Number" value="+1 (555) 123-4567" />
      </div>
      <button className="btn-primary mt-6">Save Changes</button>
    </div>
  );
}

function PasswordTab() {
  return (
    <div>
      <h2 className="text-xl font-extrabold">Password</h2>
      <div className="mt-6 max-w-md space-y-4">
        <Field label="Current Password" value="" type="password" />
        <Field label="New Password" value="" type="password" />
        <Field label="Confirm New Password" value="" type="password" />
      </div>
      <button className="btn-primary mt-6">Update Password</button>
    </div>
  );
}

function NotificationsTab() {
  const items = [
    "Email me when someone views my resume",
    "Weekly job application tips",
    "Product updates and announcements",
  ];
  return (
    <div>
      <h2 className="text-xl font-extrabold">Notifications</h2>
      <div className="mt-6 space-y-3">
        {items.map((i, idx) => <Toggle key={i} label={i} defaultOn={idx !== 2} />)}
      </div>
    </div>
  );
}

function DangerTab() {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
      <div className="flex items-center gap-2 text-destructive">
        <AlertTriangle className="h-5 w-5" />
        <h2 className="text-xl font-extrabold">Danger Zone</h2>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">This will permanently delete all your resumes and data. This action cannot be undone.</p>
      <button className="mt-5 inline-flex items-center gap-2 rounded-full border border-destructive px-5 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground">
        Delete Account
      </button>
    </div>
  );
}

function Field({ label, value, type = "text" }: { label: string; value: string; type?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold">{label}</label>
      <input type={type} defaultValue={value} className="input-base" />
    </div>
  );
}

function Toggle({ label, defaultOn }: { label: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2/40 px-4 py-3">
      <span className="text-sm font-medium">{label}</span>
      <button onClick={() => setOn(!on)} className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted-foreground/30"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}
