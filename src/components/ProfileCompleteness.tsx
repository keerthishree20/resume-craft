"use client";

import type { UserProfile } from "@/lib/types";
import { CheckCircle, Circle } from "lucide-react";

interface Section {
  name: string;
  complete: boolean;
  weight: number;
}

function getCompleteness(profile: UserProfile): { score: number; sections: Section[] } {
  const p = profile.personalInfo;
  const sections: Section[] = [
    {
      name: "Name & Email",
      complete: p.fullName.trim() !== "" && p.email.trim() !== "",
      weight: 20,
    },
    {
      name: "Contact Details",
      complete: p.phone.trim() !== "" && p.location.trim() !== "",
      weight: 10,
    },
    {
      name: "Professional Summary",
      complete: p.summary.trim().length >= 20,
      weight: 15,
    },
    {
      name: "Experience (1+)",
      complete: profile.experience.length > 0 && profile.experience.some((e) => e.company.trim() !== ""),
      weight: 25,
    },
    {
      name: "Education (1+)",
      complete: profile.education.length > 0 && profile.education.some((e) => e.institution.trim() !== ""),
      weight: 15,
    },
    {
      name: "Skills (3+)",
      complete: profile.skills.length >= 3,
      weight: 10,
    },
    {
      name: "Projects (1+)",
      complete: profile.projects.length > 0 && profile.projects.some((p) => p.name.trim() !== ""),
      weight: 5,
    },
  ];

  const score = sections.reduce((acc, s) => acc + (s.complete ? s.weight : 0), 0);
  return { score, sections };
}

export default function ProfileCompleteness({ profile }: { profile: UserProfile }) {
  const { score, sections } = getCompleteness(profile);

  const color =
    score >= 80 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500";
  const textColor =
    score >= 80 ? "text-green-400" : score >= 50 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="p-4 rounded-xl border border-border bg-card mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Profile Completeness</span>
        <span className={`text-sm font-bold ${textColor}`}>{score}%</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {sections.map((s) => (
          <div key={s.name} className="flex items-center gap-1.5 text-xs">
            {s.complete ? (
              <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
            <span className={s.complete ? "text-muted-foreground" : "text-foreground"}>
              {s.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
