import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GitHubFile } from "./github-api";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

export interface AIGeneratedProject {
  title: string;
  description: string[];
  techStack: string[];
}

export async function generateProjectEntry(
  repoName: string,
  readme: string,
  fileTree: GitHubFile[]
): Promise<AIGeneratedProject> {
  console.log(`[GitHub API] Successfully fetched data for ${repoName}`);
  console.log(`[GitHub API] File tree contains ${fileTree.length} items. Content:`, fileTree);
  console.log(`[GitHub API] README length: ${readme.length} characters. Content preview:\n`, readme.substring(0, 500) + (readme.length > 500 ? "\n...[truncated]" : ""));

  const prompt = `
You are an expert technical resume writer and software architect.
I am providing you with the details of a GitHub repository:
Repository Name: ${repoName}

File Tree (first 100 files):
${fileTree.slice(0, 100).map(f => f.path).join("\n")}

README.md Content (truncated):
${readme.substring(0, 3000)}

Based on this information, please generate a comprehensive project summary.
Respond in pure JSON format (without markdown code blocks, just raw JSON) matching this structure:
{
  "title": "A clean, capitalized version of the repo name",
  "description": [
    "A detailed paragraph explaining what the project is, its core functionality, and architecture.",
    "Another paragraph detailing the technical implementation, challenges solved, or features."
  ],
  "techStack": ["React", "TypeScript", "Node.js", "Docker", "etc"]
}
Ensure the techStack contains the top 3-8 technologies inferred from the file tree and README.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // Clean up potential markdown formatting from the response
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText) as AIGeneratedProject;
  } catch (error) {
    console.error("Error generating project entry:", error);
    // Fallback if API fails
    return {
      title: repoName,
      description: ["Failed to generate description from Gemini. Please enter manually."],
      techStack: ["Unknown"]
    };
  }
}

export async function summarizeProjectForResume(
  projectDetails: any,
  numBullets: number
): Promise<string[]> {
  const prompt = `
You are an expert technical resume writer. Your goal is to write ATS-optimized, action-oriented bullet points for a resume project section.
I am providing you with a detailed project summary from a user's project library:

Title: ${projectDetails.title}
Tech Stack: ${projectDetails.techStack?.join(", ") || "Unknown"}
Detailed Description:
${projectDetails.description?.join("\n") || "No description provided."}

Please condense this information into EXACTLY ${numBullets} bullet points.
Rules for the bullet points:
1. Start each bullet point with a strong action verb (e.g., Developed, Architected, Optimized, Implemented).
2. Mention the relevant tech stack naturally within the bullets.
3. Make them highly ATS-optimized.
4. Return ONLY a JSON array of strings, with no markdown formatting or other text. Example: ["Bullet 1", "Bullet 2"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText) as string[];
  } catch (error) {
    console.error("Error summarizing project:", error);
    return Array.isArray(projectDetails.description) 
        ? projectDetails.description.slice(0, numBullets) 
        : ["Error summarizing project"]; // Fallback
  }
}
