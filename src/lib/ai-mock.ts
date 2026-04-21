/**
 * AI Simulation Logic for Project Entry Generation
 */

export interface AIGeneratedProject {
  title: string;
  description: string[];
  techStack: string[];
}

export async function generateProjectEntry(
  repoName: string,
  readme: string,
  fileTree: any[]
): Promise<AIGeneratedProject> {
  // Simulate AI delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 1. Infer Title
  const title = repoName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // 2. Infer Tech Stack from file tree
  const techStack = new Set<string>();
  const fileExtensions = new Set<string>();
  
  fileTree.forEach((file) => {
    const ext = file.path.split(".").pop()?.toLowerCase();
    if (ext) fileExtensions.add(ext);
    
    // Check for specific files
    if (file.path === "package.json") techStack.add("Node.js");
    if (file.path === "tsconfig.json") techStack.add("TypeScript");
    if (file.path === "tailwind.config.js") techStack.add("Tailwind CSS");
    if (file.path.includes("docker")) techStack.add("Docker");
    if (file.path.includes("go.mod")) techStack.add("Go");
    if (file.path.includes("requirements.txt")) techStack.add("Python");
    if (file.path.includes("Cargo.toml")) techStack.add("Rust");
  });

  if (fileExtensions.has("tsx") || fileExtensions.has("jsx")) techStack.add("React");
  if (fileExtensions.has("vue")) techStack.add("Vue.js");
  if (fileExtensions.has("svelte")) techStack.add("Svelte");
  if (fileExtensions.has("py")) techStack.add("Python");
  if (fileExtensions.has("go")) techStack.add("Go");
  if (fileExtensions.has("rs")) techStack.add("Rust");

  // 3. Generate resume-style bullet points (Mocked based on common repo features)
  const description = [
    `Developed a robust ${title} application using ${Array.from(techStack).slice(0, 3).join(", ") || "modern web technologies"}.`,
    `Implemented high-performance features architecture ensuring scalability and efficient data processing.`,
    `Architected a clean and maintainable codebase with an emphasis on developer experience and component modularity.`,
  ];

  // If readme is available, try to extract a more specific first line
  if (readme) {
    const firstParagraph = readme.split("\n\n")[0]?.replace(/[#*]/g, "").trim();
    if (firstParagraph && firstParagraph.length > 20 && firstParagraph.length < 200) {
      description[0] = firstParagraph;
    }
  }

  return {
    title,
    description,
    techStack: Array.from(techStack).slice(0, 6), // Limit to top 6
  };
}
