"use client";

import type { ATSResult } from "@/lib/types";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import RadarChart from "@/components/RadarChart";

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80
      ? "#22c55e"
      : score >= 60
        ? "#eab308"
        : score >= 40
          ? "#f97316"
          : "#ef4444";

  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#27272a"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function SectionBar({ name, score, feedback }: { name: string; score: number; feedback: string }) {
  const color =
    score >= 80
      ? "bg-green-500"
      : score >= 60
        ? "bg-yellow-500"
        : score >= 40
          ? "bg-orange-500"
          : "bg-red-500";

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{name}</span>
        <span className="text-sm text-muted-foreground">{score}%</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{feedback}</p>
    </div>
  );
}

export default function ATSScoreCard({ result }: { result: ATSResult }) {
  const scoreLabel =
    result.overallScore >= 80
      ? "Excellent"
      : result.overallScore >= 60
        ? "Good"
        : result.overallScore >= 40
          ? "Needs Work"
          : "Low Match";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 p-6 rounded-xl border border-border bg-card">
        <ScoreRing score={result.overallScore} />
        <div>
          <h3 className="text-xl font-bold">ATS Score: {scoreLabel}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {result.overallScore >= 80
              ? "Your resume is well-optimized for ATS systems. Great job!"
              : result.overallScore >= 60
                ? "Your resume has a good foundation but could be improved with targeted changes."
                : "Your resume needs significant optimization to pass ATS filters."}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3" />
            Most companies use ATS to filter 75% of resumes before a human sees them
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-6 rounded-xl border border-border bg-card">
          <h3 className="font-semibold mb-4">Section Breakdown</h3>
          <div className="space-y-4">
            {result.sections.map((section, i) => (
              <SectionBar key={i} {...section} />
            ))}
          </div>
        </div>
        <div className="p-6 rounded-xl border border-border bg-card">
          <h3 className="font-semibold mb-2">Job Fit Radar</h3>
          <RadarChart
            labels={result.sections.map((s) => s.name.replace(/ & /g, " & ").split(" ").slice(0, 2).join(" "))}
            values={result.sections.map((s) => s.score)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-border bg-card">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Matched Keywords ({result.matchedKeywords.length})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {result.matchedKeywords.map((kw, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full border border-green-500/20"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            Missing Keywords ({result.missingKeywords.length})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {result.missingKeywords.map((kw, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded-full border border-red-500/20"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-500" />
          Suggestions to Improve
        </h3>
        <ul className="space-y-2">
          {result.suggestions.map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
