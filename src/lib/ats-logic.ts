import { ATS_WEIGHTS, ACTION_VERBS } from './ats-config';

export interface ATSResult {
  overallScore: number;
  subscores: {
    keyword: number;
    formatting: number;
    section: number;
    readability: number;
    metadata: number;
  };
  formattingIssues: string[];
  suggestions: string[];
  rawText: string;
}

export function calculateATSScore(text: string, links: string[] = [], aiKeywordScore: number = 0): ATSResult {
  const suggestions: string[] = [];
  const formattingIssues: string[] = [];
  
  // 1. Setup normalized text for parsing
  const lowerText = text.toLowerCase();
  
  // ---------------------------------------------------------
  // SECTION COMPLETENESS SCORE (15%)
  // ---------------------------------------------------------
  const sections = {
    contact: { weight: 20, present: false, regex: /phone|email|linkedin|github/i },
    summary: { weight: 10, present: false, regex: /\b(summary|objective|profile|about me)\b/i },
    skills: { weight: 20, present: false, regex: /\b(skills|technologies|technical skills|core competencies)\b/i },
    experience: { weight: 30, present: false, regex: /\b(experience|work history|employment|professional experience|internship)\b/i },
    education: { weight: 10, present: false, regex: /\b(education|academic|university|degree)\b/i },
    projects: { weight: 10, present: false, regex: /\b(projects|personal projects|academic projects)\b/i },
  };

  let sectionWeightSum = 0;
  let totalSectionWeight = 100;
  
  for (const [key, def] of Object.entries(sections)) {
    if (def.regex.test(lowerText)) {
      def.present = true;
      sectionWeightSum += def.weight;
    }
  }
  
  let sectionScore = Math.min(100, (sectionWeightSum / totalSectionWeight) * 100);
  
  if (!sections.skills.present) {
    suggestions.push("Add a dedicated 'Skills' section to make it easier for ATS to parse your technical abilities.");
    sectionScore -= 5;
  }
  if (!sections.projects.present) {
    suggestions.push("If you are a student or junior engineer, adding a 'Projects' section is highly recommended.");
  }
  
  // ---------------------------------------------------------
  // METADATA / CONTACT SCORE (5%)
  // ---------------------------------------------------------
  let metadataScore = 0;
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text) || links.some(l => l.startsWith('mailto:'));
  const hasPhone = /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(text) || links.some(l => l.startsWith('tel:'));
  const hasLinkedIn = /linkedin\.com\/in\//i.test(lowerText) || /linkedin profile/i.test(lowerText) || /linkedin url/i.test(lowerText) || links.some(l => /linkedin\.com\/in\//i.test(l));
  const hasGithub = /github\.com\//i.test(lowerText) || /github profile/i.test(lowerText) || /github url/i.test(lowerText) || links.some(l => /github\.com\//i.test(l));
  const hasProjectLink = /project link/i.test(lowerText) || /project website/i.test(lowerText) || links.some(l => /^https?:\/\//i.test(l) && !/linkedin|github|mailto|tel/i.test(l));
  
  if (hasEmail) metadataScore += 20;
  else formattingIssues.push("Email address missing or not formatted correctly.");
  
  if (hasPhone) metadataScore += 20;
  else formattingIssues.push("Phone number missing.");
  
  if (hasLinkedIn) metadataScore += 15;
  else suggestions.push("Include a LinkedIn URL.");
  
  if (hasGithub || hasProjectLink) metadataScore += 15;
  else suggestions.push("Include a GitHub or project URL to showcase your code.");
  
  // Assume Full Name (20) and Location (10) are usually present if there's text at the top
  metadataScore += 30; 
  
  // Extra Rule: Role-specific terms
  if (/\b(software engineer|full stack|backend|frontend|data engineer|devops)\b/i.test(lowerText)) {
    metadataScore += 5; // Bonus
  } else {
    suggestions.push("Add a target title (e.g., 'Software Engineer') near your name to explicitly match the role.");
  }
  metadataScore = Math.min(100, metadataScore);



  // ---------------------------------------------------------
  // READABILITY SCORE (10%)
  // ---------------------------------------------------------
  let readabilityScore = 100;
  let longBullets = 0;
  
  // Need lines for readability
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 10);
  
  lines.forEach(line => {
    // If a line is too long (over ~250 chars usually means >2 lines)
    if (line.length > 250) {
      longBullets++;
    }
  });
  
  if (longBullets > 0) {
    readabilityScore -= (longBullets * 5);
    formattingIssues.push(`${longBullets} bullet point(s) are too long (over 2 lines). Keep them concise.`);
  }
  readabilityScore = Math.max(0, Math.min(100, readabilityScore));

  // ---------------------------------------------------------
  // FORMATTING / PARSEABILITY SCORE (20%)
  // ---------------------------------------------------------
  let formattingScore = 100;
  
  // Basic Text Extraction sanity check
  if (text.length < 300) {
    formattingScore -= 20;
    formattingIssues.push("Very little text could be extracted. Make sure your PDF is not an image and uses selectable text.");
  }
  
  // Look for excessive weird spacing (can indicate multi-column or tables parsed badly)
  const excessiveSpacing = text.split(/\s{5,}/).length;
  if (excessiveSpacing > 20) {
    formattingScore -= 20;
    formattingIssues.push("Multi-column layout or tables detected. Many ATS parsers struggle to read multiple columns correctly.");
  }
  
  // Bonus: Clear single-column
  if (excessiveSpacing < 5 && text.length > 1000) {
    formattingScore += 10;
  }
  
  // Bonus: Standard Headings
  formattingScore += (sectionWeightSum / 100) * 10; // Up to 10 bonus points
  
  formattingScore = Math.max(0, Math.min(100, formattingScore));

  // ---------------------------------------------------------
  // OVERALL SCORE CALCULATION
  // ---------------------------------------------------------
  const overallScore = Math.round(
    (aiKeywordScore * ATS_WEIGHTS.keyword) +
    (formattingScore * ATS_WEIGHTS.formatting) +
    (sectionScore * ATS_WEIGHTS.section) +
    (readabilityScore * ATS_WEIGHTS.readability) +
    (metadataScore * ATS_WEIGHTS.metadata)
  );

  return {
    overallScore: Math.max(0, Math.min(100, overallScore)),
    subscores: {
      keyword: Math.round(aiKeywordScore),
      formatting: Math.round(formattingScore),
      section: Math.round(sectionScore),
      readability: Math.round(readabilityScore),
      metadata: Math.round(metadataScore),
    },
    formattingIssues,
    suggestions,
    rawText: text
  };
}
