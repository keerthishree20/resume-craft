export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  summary: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string;
  link: string;
}

export interface UserProfile {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
}

export interface GeneratedResume {
  name: string;
  title: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
  };
  summary: string;
  experience: {
    company: string;
    role: string;
    duration: string;
    bullets: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    duration: string;
    gpa: string;
  }[];
  skills: string[];
  projects: {
    name: string;
    description: string;
    techStack: string;
  }[];
}

export interface GeneratedCoverLetter {
  greeting: string;
  paragraphs: string[];
  closing: string;
  signature: string;
}

export interface GenerationResult {
  resume: GeneratedResume;
  coverLetter: GeneratedCoverLetter;
}

export interface ATSResult {
  overallScore: number;
  sections: {
    name: string;
    score: number;
    feedback: string;
  }[];
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

export interface InterviewQuestion {
  question: string;
  type: "behavioral" | "technical" | "situational" | "general";
  difficulty: "easy" | "medium" | "hard";
  sampleAnswer: string;
  tips: string;
}

export interface InterviewPrepResult {
  role: string;
  questions: InterviewQuestion[];
}

export interface SavedJD {
  id: string;
  title: string;
  company: string;
  description: string;
  savedAt: number;
}
