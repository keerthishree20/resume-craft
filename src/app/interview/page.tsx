"use client";

import { useState, useEffect } from "react";
import { getProfile, hasProfile } from "@/lib/storage";
import type { InterviewPrepResult, InterviewQuestion } from "@/lib/types";
import {
  Sparkles,
  AlertCircle,
  Loader2,
  MessageSquare,
  Code,
  Users,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Target,
} from "lucide-react";
import Link from "next/link";

const typeConfig = {
  behavioral: { icon: Users, label: "Behavioral", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  technical: { icon: Code, label: "Technical", color: "text-green-400 bg-green-500/10 border-green-500/20" },
  situational: { icon: Target, label: "Situational", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  general: { icon: HelpCircle, label: "General", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
};

const difficultyColor = {
  easy: "text-green-400",
  medium: "text-yellow-400",
  hard: "text-red-400",
};

function QuestionCard({ q, index }: { q: InterviewQuestion; index: number }) {
  const [open, setOpen] = useState(false);
  const config = typeConfig[q.type] || typeConfig.general;
  const Icon = config.icon;

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-4 p-5 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="text-2xl font-bold text-muted-foreground/30 mt-0.5">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground leading-snug">{q.question}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs ${config.color}`}>
              <Icon className="w-3 h-3" />
              {config.label}
            </span>
            <span className={`text-xs font-medium ${difficultyColor[q.difficulty]}`}>
              {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
            </span>
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-border">
          <div className="mt-4 mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Sample Answer
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
              {q.sampleAnswer}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
              Tips
            </h4>
            <p className="text-sm text-muted-foreground">{q.tips}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InterviewPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<InterviewPrepResult | null>(null);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    setProfileExists(hasProfile());
    const savedJD = sessionStorage.getItem("resumecraft_jd");
    if (savedJD) setJobDescription(savedJD);
  }, []);

  async function handleGenerate() {
    if (!jobDescription.trim()) {
      setError("Please paste a job description");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const profile = getProfile();
      const res = await fetch("/api/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, jobDescription }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
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
          Create your profile first so we can personalize interview questions.
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          Interview Prep
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Get AI-generated interview questions with personalized sample answers
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
            onClick={handleGenerate}
            disabled={loading || !jobDescription.trim()}
            className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating questions... (15-30 seconds)
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Interview Questions
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-semibold">
                Questions for: {result.role}
              </h2>
              <p className="text-sm text-muted-foreground">
                {result.questions.length} questions — click to expand answers
              </p>
            </div>
            <button
              onClick={() => setResult(null)}
              className="px-4 py-2 text-sm border border-border hover:bg-muted rounded-lg transition-colors"
            >
              New Questions
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            {(["behavioral", "technical", "situational", "general"] as const).map((type) => {
              const count = result.questions.filter((q) => q.type === type).length;
              const config = typeConfig[type];
              return (
                <span key={type} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs ${config.color}`}>
                  {config.label}: {count}
                </span>
              );
            })}
          </div>

          {result.questions.map((q, i) => (
            <QuestionCard key={i} q={q} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
