/**
 * GitHub API Utilities
 */

export interface GitHubRepoInfo {
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  default_branch: string;
  html_url: string;
  language: string;
}

export interface GitHubFile {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size?: number;
  url: string;
}

export async function fetchRepoInfo(owner: string, repo: string): Promise<GitHubRepoInfo> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (response.status === 404) throw new Error("Repository not found.");
  if (!response.ok) throw new Error("Failed to fetch repository information.");
  
  const data = await response.json();
  if (data.private) throw new Error("This repository is private or cannot be accessed.");
  
  return data;
}

export async function fetchReadme(owner: string, repo: string): Promise<string> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`);
  if (!response.ok) return ""; // README might not exist
  
  const data = await response.json();
  // GitHub returns content in base64
  return decodeURIComponent(escape(atob(data.content)));
}

export async function fetchFileTree(owner: string, repo: string, branch: string): Promise<GitHubFile[]> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
  if (!response.ok) return [];
  
  const data = await response.json();
  return data.tree || [];
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const cleanUrl = url.trim().replace(/\/$/, "");
    const parts = cleanUrl.split("/");
    if (parts.length < 2) return null;
    
    // Support formats like:
    // https://github.com/owner/repo
    // github.com/owner/repo
    // owner/repo
    
    const repo = parts.pop()!;
    const owner = parts.pop()!;
    
    if (!owner || !repo) return null;
    
    return { owner, repo: repo.replace(".git", "") };
  } catch {
    return null;
  }
}
