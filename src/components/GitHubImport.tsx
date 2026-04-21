import React, { useState } from "react";
import { Github, Loader2, Check, AlertCircle } from "lucide-react";

interface GitHubImportProps {
  onImport: (data: any) => void;
}

export function GitHubImport({ onImport }: GitHubImportProps) {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleImport = async () => {
    if (!username.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      // Fetch user profile
      const userRes = await fetch(`https://api.github.com/users/${username}`);
      if (!userRes.ok) throw new Error("User not found");
      const userData = await userRes.json();

      // Fetch repos
      const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
      const reposData = await reposRes.json();

      const projects = reposData
        .filter((repo: any) => !repo.fork)
        .slice(0, 5)
        .map((repo: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: repo.name,
          url: repo.html_url.replace("https://", ""),
          description: repo.description || "Open source project on GitHub",
        }));

      const importedData = {
        personal: {
          fullName: userData.name || userData.login,
          jobTitle: userData.bio?.split(".")[0] || "Software Engineer",
          location: userData.location || "",
          portfolio: userData.blog || "",
          photoUrl: userData.avatar_url,
        },
        projects,
        skills: reposData.map((r: any) => r.language).filter((l: any, i: number, a: any) => l && a.indexOf(l) === i),
      };

      onImport(importedData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to import");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-soft p-4">
      <div className="flex items-center gap-2 mb-3">
        <Github className="h-5 w-5" />
        <h3 className="text-sm font-bold">Import from GitHub</h3>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="GitHub username"
          className="input-base text-xs h-9"
        />
        <button
          onClick={handleImport}
          disabled={isLoading || !username}
          className="btn-primary px-4 py-1.5 text-xs whitespace-nowrap disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : success ? <Check className="h-3 w-3" /> : "Import"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-[10px] text-destructive flex items-center gap-1 font-medium">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
      <p className="mt-2 text-[10px] text-muted-foreground">
        Fetches your profile, bio, and top 5 recent projects.
      </p>
    </div>
  );
}
