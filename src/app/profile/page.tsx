"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProfile, saveProfile } from "@/lib/storage";
import type { UserProfile, Experience, Education, Project } from "@/lib/types";
import ProfileCompleteness from "@/components/ProfileCompleteness";
import {
  Save,
  Plus,
  Trash2,
  User,
  Briefcase,
  GraduationCap,
  Code,
  FolderOpen,
  Upload,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [saved, setSaved] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [showAutofill, setShowAutofill] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [autofillLoading, setAutofillLoading] = useState(false);
  const [autofillError, setAutofillError] = useState("");

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  if (!profile) return null;

  async function handleAutofill() {
    if (!resumeText.trim()) {
      setAutofillError("Please paste your resume content");
      return;
    }

    setAutofillLoading(true);
    setAutofillError("");

    try {
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Parsing failed");
      }

      const parsed = await res.json();
      setProfile(parsed);
      saveProfile(parsed);
      setShowAutofill(false);
      setResumeText("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setAutofillError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setAutofillLoading(false);
    }
  }

  function handleSave() {
    if (!profile) return;
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function updatePersonal(field: string, value: string) {
    setProfile((p) =>
      p ? { ...p, personalInfo: { ...p.personalInfo, [field]: value } } : p
    );
  }

  function addExperience() {
    const newExp: Experience = {
      id: generateId(),
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    };
    setProfile((p) =>
      p ? { ...p, experience: [...p.experience, newExp] } : p
    );
  }

  function updateExperience(id: string, field: string, value: string | boolean) {
    setProfile((p) =>
      p
        ? {
            ...p,
            experience: p.experience.map((e) =>
              e.id === id ? { ...e, [field]: value } : e
            ),
          }
        : p
    );
  }

  function removeExperience(id: string) {
    setProfile((p) =>
      p ? { ...p, experience: p.experience.filter((e) => e.id !== id) } : p
    );
  }

  function addEducation() {
    const newEdu: Education = {
      id: generateId(),
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      gpa: "",
    };
    setProfile((p) =>
      p ? { ...p, education: [...p.education, newEdu] } : p
    );
  }

  function updateEducation(id: string, field: string, value: string) {
    setProfile((p) =>
      p
        ? {
            ...p,
            education: p.education.map((e) =>
              e.id === id ? { ...e, [field]: value } : e
            ),
          }
        : p
    );
  }

  function removeEducation(id: string) {
    setProfile((p) =>
      p ? { ...p, education: p.education.filter((e) => e.id !== id) } : p
    );
  }

  function addSkill() {
    const skill = skillInput.trim();
    if (!skill || !profile) return;
    if (profile.skills.includes(skill)) return;
    setProfile((p) => (p ? { ...p, skills: [...p.skills, skill] } : p));
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setProfile((p) =>
      p ? { ...p, skills: p.skills.filter((s) => s !== skill) } : p
    );
  }

  function addProject() {
    const newProj: Project = {
      id: generateId(),
      name: "",
      description: "",
      techStack: "",
      link: "",
    };
    setProfile((p) =>
      p ? { ...p, projects: [...p.projects, newProj] } : p
    );
  }

  function updateProject(id: string, field: string, value: string) {
    setProfile((p) =>
      p
        ? {
            ...p,
            projects: p.projects.map((proj) =>
              proj.id === id ? { ...proj, [field]: value } : proj
            ),
          }
        : p
    );
  }

  function removeProject(id: string) {
    setProfile((p) =>
      p ? { ...p, projects: p.projects.filter((proj) => proj.id !== id) } : p
    );
  }

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "skills", label: "Skills", icon: Code },
    { id: "projects", label: "Projects", icon: FolderOpen },
  ];

  const inputClass =
    "w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Your Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Fill in your details once — reuse for every job application
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAutofill(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 font-medium rounded-lg transition-colors text-sm"
          >
            <Sparkles className="w-4 h-4" />
            Autofill from Resume
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save Profile"}
          </button>
        </div>
      </div>

      {showAutofill && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Autofill Profile from Resume
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Paste your existing resume text and AI will extract your details
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAutofill(false);
                  setAutofillError("");
                }}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex-1 overflow-auto">
              <textarea
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary h-64 resize-none text-sm"
                placeholder={"Paste your full resume text here...\n\nExample:\nJohn Doe\njohn@email.com | +1 234 567 8900 | New York, NY\n\nSoftware Engineer with 3+ years of experience...\n\nExperience:\nSenior Developer at TechCorp (2022 - Present)\n- Built microservices architecture serving 1M+ users\n..."}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
              {autofillError && (
                <p className="text-destructive text-sm mt-2">{autofillError}</p>
              )}
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAutofill(false);
                  setAutofillError("");
                }}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleAutofill}
                disabled={autofillLoading || !resumeText.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
              >
                {autofillLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Parsing resume...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Extract & Fill Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ProfileCompleteness profile={profile} />

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === id
                ? "bg-primary/10 text-primary border border-primary/30"
                : "text-muted-foreground hover:bg-muted border border-transparent"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "personal" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name *
              </label>
              <input
                className={inputClass}
                placeholder="John Doe"
                value={profile.personalInfo.fullName}
                onChange={(e) => updatePersonal("fullName", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                className={inputClass}
                type="email"
                placeholder="john@example.com"
                value={profile.personalInfo.email}
                onChange={(e) => updatePersonal("email", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                className={inputClass}
                placeholder="+1 234 567 8900"
                value={profile.personalInfo.phone}
                onChange={(e) => updatePersonal("phone", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Location
              </label>
              <input
                className={inputClass}
                placeholder="City, Country"
                value={profile.personalInfo.location}
                onChange={(e) => updatePersonal("location", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                LinkedIn URL
              </label>
              <input
                className={inputClass}
                placeholder="linkedin.com/in/johndoe"
                value={profile.personalInfo.linkedin}
                onChange={(e) => updatePersonal("linkedin", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Portfolio URL
              </label>
              <input
                className={inputClass}
                placeholder="johndoe.com"
                value={profile.personalInfo.portfolio}
                onChange={(e) => updatePersonal("portfolio", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Professional Summary
            </label>
            <textarea
              className={`${inputClass} h-28 resize-none`}
              placeholder="Brief overview of your professional background, key skills, and career goals..."
              value={profile.personalInfo.summary}
              onChange={(e) => updatePersonal("summary", e.target.value)}
            />
          </div>
        </div>
      )}

      {activeTab === "experience" && (
        <div className="space-y-6">
          {profile.experience.map((exp) => (
            <div
              key={exp.id}
              className="p-5 rounded-xl border border-border bg-card"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium">
                  {exp.role || exp.company || "New Experience"}
                </h3>
                <button
                  onClick={() => removeExperience(exp.id)}
                  className="text-destructive hover:bg-destructive/10 p-1 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Company
                  </label>
                  <input
                    className={inputClass}
                    placeholder="Company Name"
                    value={exp.company}
                    onChange={(e) =>
                      updateExperience(exp.id, "company", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Role
                  </label>
                  <input
                    className={inputClass}
                    placeholder="Software Engineer"
                    value={exp.role}
                    onChange={(e) =>
                      updateExperience(exp.id, "role", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date
                  </label>
                  <input
                    className={inputClass}
                    placeholder="Jan 2023"
                    value={exp.startDate}
                    onChange={(e) =>
                      updateExperience(exp.id, "startDate", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Date
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      className={`${inputClass} ${exp.current ? "opacity-50" : ""}`}
                      placeholder="Dec 2024"
                      value={exp.current ? "Present" : exp.endDate}
                      disabled={exp.current}
                      onChange={(e) =>
                        updateExperience(exp.id, "endDate", e.target.value)
                      }
                    />
                    <label className="flex items-center gap-1 text-sm whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) =>
                          updateExperience(exp.id, "current", e.target.checked)
                        }
                        className="accent-primary"
                      />
                      Current
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  className={`${inputClass} h-24 resize-none`}
                  placeholder="Describe your responsibilities and achievements..."
                  value={exp.description}
                  onChange={(e) =>
                    updateExperience(exp.id, "description", e.target.value)
                  }
                />
              </div>
            </div>
          ))}
          <button
            onClick={addExperience}
            className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-border hover:border-primary/50 rounded-lg text-sm text-muted-foreground hover:text-primary transition-colors w-full justify-center"
          >
            <Plus className="w-4 h-4" />
            Add Experience
          </button>
        </div>
      )}

      {activeTab === "education" && (
        <div className="space-y-6">
          {profile.education.map((edu) => (
            <div
              key={edu.id}
              className="p-5 rounded-xl border border-border bg-card"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium">
                  {edu.institution || "New Education"}
                </h3>
                <button
                  onClick={() => removeEducation(edu.id)}
                  className="text-destructive hover:bg-destructive/10 p-1 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Institution
                  </label>
                  <input
                    className={inputClass}
                    placeholder="University Name"
                    value={edu.institution}
                    onChange={(e) =>
                      updateEducation(edu.id, "institution", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Degree
                  </label>
                  <input
                    className={inputClass}
                    placeholder="B.Tech"
                    value={edu.degree}
                    onChange={(e) =>
                      updateEducation(edu.id, "degree", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Field of Study
                  </label>
                  <input
                    className={inputClass}
                    placeholder="Computer Science"
                    value={edu.field}
                    onChange={(e) =>
                      updateEducation(edu.id, "field", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">GPA</label>
                  <input
                    className={inputClass}
                    placeholder="8.5/10"
                    value={edu.gpa}
                    onChange={(e) =>
                      updateEducation(edu.id, "gpa", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date
                  </label>
                  <input
                    className={inputClass}
                    placeholder="2020"
                    value={edu.startDate}
                    onChange={(e) =>
                      updateEducation(edu.id, "startDate", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Date
                  </label>
                  <input
                    className={inputClass}
                    placeholder="2024"
                    value={edu.endDate}
                    onChange={(e) =>
                      updateEducation(edu.id, "endDate", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addEducation}
            className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-border hover:border-primary/50 rounded-lg text-sm text-muted-foreground hover:text-primary transition-colors w-full justify-center"
          >
            <Plus className="w-4 h-4" />
            Add Education
          </button>
        </div>
      )}

      {activeTab === "skills" && (
        <div>
          <div className="flex gap-2 mb-6">
            <input
              className={inputClass}
              placeholder="Type a skill and press Enter (e.g. Python, React, AWS)"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <button
              onClick={addSkill}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
            {profile.skills.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No skills added yet. Start typing above to add your skills.
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === "projects" && (
        <div className="space-y-6">
          {profile.projects.map((proj) => (
            <div
              key={proj.id}
              className="p-5 rounded-xl border border-border bg-card"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium">{proj.name || "New Project"}</h3>
                <button
                  onClick={() => removeProject(proj.id)}
                  className="text-destructive hover:bg-destructive/10 p-1 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Project Name
                  </label>
                  <input
                    className={inputClass}
                    placeholder="My Awesome Project"
                    value={proj.name}
                    onChange={(e) =>
                      updateProject(proj.id, "name", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tech Stack
                  </label>
                  <input
                    className={inputClass}
                    placeholder="React, Node.js, PostgreSQL"
                    value={proj.techStack}
                    onChange={(e) =>
                      updateProject(proj.id, "techStack", e.target.value)
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Link
                  </label>
                  <input
                    className={inputClass}
                    placeholder="github.com/user/project"
                    value={proj.link}
                    onChange={(e) =>
                      updateProject(proj.id, "link", e.target.value)
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    className={`${inputClass} h-24 resize-none`}
                    placeholder="What does this project do? What was your contribution?"
                    value={proj.description}
                    onChange={(e) =>
                      updateProject(proj.id, "description", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addProject}
            className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-border hover:border-primary/50 rounded-lg text-sm text-muted-foreground hover:text-primary transition-colors w-full justify-center"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => {
            const currentIndex = tabs.findIndex((t) => t.id === activeTab);
            if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].id);
          }}
          disabled={activeTab === "personal"}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {activeTab === "projects" ? (
          <button
            onClick={() => {
              handleSave();
              router.push("/generate");
            }}
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors"
          >
            Save & Generate Resume
          </button>
        ) : (
          <button
            onClick={() => {
              const currentIndex = tabs.findIndex((t) => t.id === activeTab);
              if (currentIndex < tabs.length - 1)
                setActiveTab(tabs[currentIndex + 1].id);
            }}
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
