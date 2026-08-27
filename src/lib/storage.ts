import { UserProfile, SavedJD } from "./types";

const PROFILE_KEY = "resumecraft_profile";
const JD_HISTORY_KEY = "resumecraft_jd_history";

const emptyProfile: UserProfile = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    portfolio: "",
    summary: "",
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
};

export function getProfile(): UserProfile {
  if (typeof window === "undefined") return emptyProfile;
  const stored = localStorage.getItem(PROFILE_KEY);
  if (!stored) return emptyProfile;
  return JSON.parse(stored);
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function hasProfile(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(PROFILE_KEY);
  if (!stored) return false;
  const profile: UserProfile = JSON.parse(stored);
  return profile.personalInfo.fullName.trim() !== "";
}

export function getJDHistory(): SavedJD[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(JD_HISTORY_KEY);
  if (!stored) return [];
  return JSON.parse(stored);
}

export function saveJD(title: string, company: string, description: string): void {
  const history = getJDHistory();
  const newJD: SavedJD = {
    id: Math.random().toString(36).substring(2, 9),
    title,
    company,
    description,
    savedAt: Date.now(),
  };
  const updated = [newJD, ...history].slice(0, 10);
  localStorage.setItem(JD_HISTORY_KEY, JSON.stringify(updated));
}

export function deleteJD(id: string): void {
  const history = getJDHistory().filter((jd) => jd.id !== id);
  localStorage.setItem(JD_HISTORY_KEY, JSON.stringify(history));
}
