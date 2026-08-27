"use client";

import { useState, useEffect } from "react";
import { getProfile, hasProfile } from "@/lib/storage";
import {
  Sparkles,
  AlertCircle,
  Loader2,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  XCircle,
  BookOpen,
  Calendar,
  ExternalLink,
  Target,
} from "lucide-react";
import Link from "next/link";

interface Resource {
  name: string;
  type: string;
  url: string;
}

interface SkillGapResult {
  overallReadiness: number;
  strongMatches: { skill: string; evidence: string }[];
  partialMatches: { skill: string; evidence: string; gap: string }[];
  gaps: {
    skill: string;
    importance: string;
    timeToLearn: string;
    resources: Resource[];
    actionPlan: string;
  }[];
  priorityOrder: string[];
  weeklyPlan: { week: number; focus: string; goal: string }[];
}

const importanceColor = {
  high: "text-red-400 bg-red-500/10 border-red-500/20",
  medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  low: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

const resourceIcon: Record<string, string> = {
  youtube: "YT",
  course: "C",
  docs: "D",
  github: "GH",
};

export default function SkillGapPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SkillGapResult | null>(null);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    setProfileExists(hasProfile());
    const savedJD = sessionStorage.getItem("resumecraft_jd");
    if (savedJD) setJobDescription(savedJD);
  }, []);

  async function handleAnalyze() {
    if (!jobDescription.trim()) {
      setError("Please paste a job description");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const profile = getProfile();
      const res = await fetch("/api/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, jobDescription }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!profileExists) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Profile Required</h1>
        <p className="text-muted-foreground mb-6">
          Create your profile first so we can analyze your skill gaps.
        </p>
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors"
        >
          Create Your Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Skill Gap Analyzer
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Identify skill gaps and get a personalized learning plan with free
          resources
        </p>
      </div>

      {!result ? (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Job Description *
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary h-48 resize-none font-mono text-sm"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          <button
            onClick={handleAnalyze}
            disabled={loading || !jobDescription.trim()}
            className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing skill gaps...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze My Skill Gaps
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center">
                <span className="text-xl font-bold text-primary">
                  {result.overallReadiness}%
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Job Readiness Score</h2>
                <p className="text-sm text-muted-foreground">
                  {result.overallReadiness >= 80
                    ? "You're a strong match! A few tweaks will seal it."
                    : result.overallReadiness >= 60
                      ? "Good foundation. Focus on the high-priority gaps below."
                      : "Some upskilling needed. Follow the learning plan to get there."}
                </p>
              </div>
            </div>
            <button
              onClick={() => setResult(null)}
              className="px-4 py-2 text-sm border border-border hover:bg-muted rounded-lg"
            >
              New Analysis
            </button>
          </div>

          {result.strongMatches.length > 0 && (
            <div className="p-5 rounded-xl border border-green-500/20 bg-green-500/5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Strong Matches ({result.strongMatches.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.strongMatches.map((m, i) => (
                  <div
                    key={i}
                    className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20"
                  >
                    <span className="text-sm font-medium text-green-400">
                      {m.skill}
                    </span>
                    <p className="text-xs text-green-400/60">{m.evidence}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.partialMatches.length > 0 && (
            <div className="p-5 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                Partial Matches ({result.partialMatches.length})
              </h3>
              <div className="space-y-2">
                {result.partialMatches.map((m, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-sm font-medium text-yellow-400 min-w-[100px]">
                      {m.skill}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {m.gap}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.gaps.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                Skill Gaps — Learning Recommendations
              </h3>
              <div className="space-y-4">
                {result.gaps.map((gap, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-xl border border-border bg-card"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{gap.skill}</h4>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${importanceColor[gap.importance as keyof typeof importanceColor] || importanceColor.low}`}
                        >
                          {gap.importance} priority
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {gap.timeToLearn}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {gap.actionPlan}
                    </p>
                    <div className="space-y-1.5">
                      {gap.resources.map((res, j) => (
                        <a
                          key={j}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors group"
                        >
                          <span className="w-6 h-6 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                            {resourceIcon[res.type] || "R"}
                          </span>
                          <span className="group-hover:underline">
                            {res.name}
                          </span>
                          <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.weeklyPlan.length > 0 && (
            <div className="p-5 rounded-xl border border-primary/20 bg-primary/5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Your Learning Plan
              </h3>
              <div className="space-y-3">
                {result.weeklyPlan.map((week) => (
                  <div key={week.week} className="flex gap-4">
                    <div className="w-20 shrink-0">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                        Week {week.week}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{week.focus}</p>
                      <p className="text-xs text-muted-foreground">
                        Goal: {week.goal}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
