import { useState, useCallback } from "react";

export type Experience = {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  location: string;
  isCurrent: boolean;
};

export type Por = {
  id: string;
  role: string;
  event: string;
  duration: string;
  description: string;
};


export type Education = {
  id: string;
  degree: string;
  institution: string;
  field: string;
  grade: string;
  startYear: string;
  endYear: string;
  location: string;
};

export type Project = {
  id: string;
  name: string;
  url: string;
  techStack: string;
  description: string;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  date: string;
};

export type SkillCategory = {
  id: string;
  name: string;
  items: string;
};

export type CodingProfile = {
  id: string;
  platform: string;
  username: string;
  rating: string;
  url: string;
};

export type ResumeData = {
  personal: {
    fullName: string;
    email: string;
    email2?: string;
    phone: string;
    location: string;
    linkedin: string;
    github?: string;
    portfolio: string;
    photoUrl?: string;
    collegeLogo?: string;
    rollNo?: string;
    course?: string;
    removeBackground: boolean;
  };
  experience: Experience[];
  por: Por[];
  education: Education[];
  skills: SkillCategory[];
  projects: Project[];
  certifications: Certification[];
  achievements: string[];
  codingProfiles: CodingProfile[];
  accentColor: string;
  template: "modern" | "classic" | "minimal" | "latex" | "iiita";
  settings: {
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
    fontFamily: string;
    padding: number;
  };
};

const initialData: ResumeData = {
  personal: {
    fullName: "Sarah Johnson",
    email: "sarah@example.com",
    email2: "",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/sarah",
    github: "",
    portfolio: "sarahjohnson.design",
    collegeLogo: "",
    rollNo: "",
    course: "",
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
      location: "San Francisco, CA",
      isCurrent: true,
    },
  ],
  por: [],
  education: [
    {
      id: "1",
      degree: "B.S. Computer Science",
      institution: "Stanford University",
      field: "Human-Computer Interaction",
      grade: "3.9 GPA",
      startYear: "2016",
      endYear: "2020",
      location: "Stanford, CA",
    },
  ],
  skills: [
    { id: "1", name: "Languages", items: "C++, C, Python, JavaScript, TypeScript, Java, SQL" },
    { id: "2", name: "Web Development", items: "Next.js, React, Tailwind CSS, HTML5, CSS3" },
    { id: "3", name: "Backend & Databases", items: "Drizzle ORM, PostgreSQL (Neon), Clerk Auth, Socket Programming" },
    { id: "4", name: "Libraries & Tools", items: "Git, GitHub, OpenCV, NumPy, Pandas, Sandpack, Figma" },
    { id: "5", name: "Relevant Coursework", items: "Data Structures and Algorithms, Operating Systems, OOPS, Computer Networks, DBMS" },
  ],
  projects: [
    {
      id: "1",
      name: "OwlCV Resume Builder",
      url: "github.com/sarah/owlcv",
      techStack: "React, TypeScript, Gemini AI, Tailwind CSS",
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
    { id: "2", name: "Google Analytics Certified", issuer: "Google", date: "2022" },
  ],
  achievements: [
    "Winner of National Hackathon 2023",
    "Secured Global Rank 152 in Google Kickstart Round F",
  ],
  codingProfiles: [
    { id: "1", platform: "CodeForces", username: "sarah_j", rating: "Expert (1644)", url: "codeforces.com/profile/sarah_j" },
    { id: "2", platform: "LeetCode", username: "sarahj", rating: "Knight (1851)", url: "leetcode.com/sarahj" },
  ],
  accentColor: "emerald",
  template: "latex",
  settings: {
    fontSize: 11,
    lineHeight: 1.5,
    letterSpacing: 0,
    fontFamily: "Inter",
    padding: 32,
  },
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
      location: "",
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

  const addPor = useCallback(() => {
    const newPor: Por = {
      id: Math.random().toString(36).substr(2, 9),
      role: "",
      event: "",
      duration: "",
      description: "",
    };
    setData((prev) => ({ ...prev, por: [...prev.por, newPor] }));
  }, []);

  const updatePor = useCallback((id: string, porData: Partial<Por>) => {
    setData((prev) => ({
      ...prev,
      por: prev.por.map((p) => (p.id === id ? { ...p, ...porData } : p)),
    }));
  }, []);

  const removePor = useCallback((id: string) => {
    setData((prev) => ({ ...prev, por: prev.por.filter((p) => p.id !== id) }));
  }, []);

  const addEducation = useCallback(() => {
    const newEdu: Education = {
      id: Math.random().toString(36).substr(2, 9),
      degree: "",
      institution: "",
      field: "",
      grade: "",
      startYear: "",
      endYear: "",
      location: "",
    };
    setData((prev) => ({ ...prev, education: [...prev.education, newEdu] }));
  }, []);

  const updateEducation = useCallback((id: string, edu: Partial<Education>) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? { ...e, ...edu } : e)),
    }));
  }, []);

  const removeEducation = useCallback((id: string) => {
    setData((prev) => ({ ...prev, education: prev.education.filter((e) => e.id !== id) }));
  }, []);

  const addCertification = useCallback(() => {
    const newCert: Certification = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      issuer: "",
      date: "",
    };
    setData((prev) => ({ ...prev, certifications: [...prev.certifications, newCert] }));
  }, []);

  const updateCertification = useCallback((id: string, cert: Partial<Certification>) => {
    setData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((c) => (c.id === id ? { ...c, ...cert } : c)),
    }));
  }, []);

  const removeCertification = useCallback((id: string) => {
    setData((prev) => ({ ...prev, certifications: prev.certifications.filter((c) => c.id !== id) }));
  }, []);

  const addSkillCategory = useCallback(() => {
    const newCat: SkillCategory = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      items: "",
    };
    setData((prev) => ({ ...prev, skills: [...prev.skills, newCat] }));
  }, []);

  const updateSkillCategory = useCallback((id: string, cat: Partial<SkillCategory>) => {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.id === id ? { ...s, ...cat } : s)),
    }));
  }, []);

  const removeSkillCategory = useCallback((id: string) => {
    setData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s.id !== id) }));
  }, []);

  const addProject = useCallback(() => {
    const newProj: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      url: "",
      techStack: "",
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

  const removeProject = useCallback((id: string) => {
    setData((prev) => ({ ...prev, projects: prev.projects.filter((p) => p.id !== id) }));
  }, []);

  const addAchievement = useCallback(() => {
    setData((prev) => ({ ...prev, achievements: [...prev.achievements, ""] }));
  }, []);

  const updateAchievement = useCallback((index: number, val: string) => {
    setData((prev) => ({
      ...prev,
      achievements: prev.achievements.map((a, i) => (i === index ? val : a)),
    }));
  }, []);

  const removeAchievement = useCallback((index: number) => {
    setData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
    }));
  }, []);

  const addCodingProfile = useCallback(() => {
    const newProfile: CodingProfile = {
      id: Math.random().toString(36).substr(2, 9),
      platform: "",
      username: "",
      rating: "",
      url: "",
    };
    setData((prev) => ({ ...prev, codingProfiles: [...prev.codingProfiles, newProfile] }));
  }, []);

  const updateCodingProfile = useCallback((id: string, profile: Partial<CodingProfile>) => {
    setData((prev) => ({
      ...prev,
      codingProfiles: prev.codingProfiles.map((p) => (p.id === id ? { ...p, ...profile } : p)),
    }));
  }, []);

  const removeCodingProfile = useCallback((id: string) => {
    setData((prev) => ({ ...prev, codingProfiles: prev.codingProfiles.filter((p) => p.id !== id) }));
  }, []);

  const updateSettings = useCallback((settings: Partial<ResumeData["settings"]>) => {
    setData((prev) => {
      const currentSettings = prev.settings || initialData.settings;
      return { ...prev, settings: { ...currentSettings, ...settings } };
    });
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
    addPor,
    updatePor,
    removePor,
    addEducation,
    updateEducation,
    removeEducation,
    addCertification,
    updateCertification,
    removeCertification,
    addSkillCategory,
    updateSkillCategory,
    removeSkillCategory,
    addProject,
    updateProject,
    removeProject,
    addAchievement,
    updateAchievement,
    removeAchievement,
    addCodingProfile,
    updateCodingProfile,
    removeCodingProfile,
    setAccent,
    setTemplate,
    updateSettings,
  };
}
