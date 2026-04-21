import { useState, useCallback } from "react";

export type Experience = {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  isCurrent: boolean;
};

export type Education = {
  id: string;
  degree: string;
  institution: string;
  field: string;
  grade: string;
  startYear: string;
  endYear: string;
};

export type Project = {
  id: string;
  name: string;
  url: string;
  description: string;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  date: string;
};

export type ResumeData = {
  personal: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
    photoUrl?: string;
    removeBackground: boolean;
  };
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  certifications: Certification[];
  accentColor: string;
  template: "modern" | "classic" | "minimal";
};

const initialData: ResumeData = {
  personal: {
    fullName: "Sarah Johnson",
    jobTitle: "Senior UX Designer",
    email: "sarah@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/sarah",
    portfolio: "sarahjohnson.design",
    removeBackground: false,
  },
  experience: [
    {
      id: "1",
      company: "Acme Corp",
      role: "Senior Designer",
      startDate: "Jan 2022",
      endDate: "Present",
      description: "Led a team of 5 designers to redesign the core product, increasing user retention by 32%.",
      isCurrent: true,
    },
  ],
  education: [
    {
      id: "1",
      degree: "B.S. Computer Science",
      institution: "Stanford University",
      field: "Human-Computer Interaction",
      grade: "3.9 GPA",
      startYear: "2016",
      endYear: "2020",
    },
  ],
  skills: ["React", "TypeScript", "Figma", "Node.js", "Tailwind CSS"],
  projects: [
    {
      id: "1",
      name: "OwlCV Resume Builder",
      url: "github.com/sarah/owlcv",
      description: "Built a full-stack resume builder using React, TypeScript and Gemini AI for content optimization.",
    },
  ],
  certifications: [
    {
      id: "1",
      name: "AWS Solutions Architect",
      issuer: "Amazon",
      date: "2024",
    },
  ],
  accentColor: "emerald",
  template: "modern",
};

export function useResume() {
  const [data, setData] = useState<ResumeData>(initialData);

  const updatePersonal = useCallback((personal: Partial<ResumeData["personal"]>) => {
    setData((prev) => ({ ...prev, personal: { ...prev.personal, ...personal } }));
  }, []);

  const addExperience = useCallback(() => {
    const newExp: Experience = {
      id: Math.random().toString(36).substr(2, 9),
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      description: "",
      isCurrent: false,
    };
    setData((prev) => ({ ...prev, experience: [...prev.experience, newExp] }));
  }, []);

  const updateExperience = useCallback((id: string, exp: Partial<Experience>) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id === id ? { ...e, ...exp } : e)),
    }));
  }, []);

  const removeExperience = useCallback((id: string) => {
    setData((prev) => ({ ...prev, experience: prev.experience.filter((e) => e.id !== id) }));
  }, []);

  const updateSkills = useCallback((skills: string[]) => {
    setData((prev) => ({ ...prev, skills }));
  }, []);

  const addProject = useCallback(() => {
    const newProj: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      url: "",
      description: "",
    };
    setData((prev) => ({ ...prev, projects: [...prev.projects, newProj] }));
  }, []);

  const updateProject = useCallback((id: string, proj: Partial<Project>) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...proj } : p)),
    }));
  }, []);

  const setAccent = useCallback((accentColor: string) => {
    setData((prev) => ({ ...prev, accentColor }));
  }, []);

  const setTemplate = useCallback((template: ResumeData["template"]) => {
    setData((prev) => ({ ...prev, template }));
  }, []);

  return {
    data,
    setData,
    updatePersonal,
    addExperience,
    updateExperience,
    removeExperience,
    updateSkills,
    addProject,
    updateProject,
    setAccent,
    setTemplate,
  };
}
