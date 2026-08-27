"use client";

import { useState, useEffect } from "react";
import { getProfile, hasProfile } from "@/lib/storage";
import {
  Sparkles,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Lightbulb,
  Hash,
  User,
  Briefcase,
  PenTool,
  BadgeCheck,
} from "lucide-react";
import Link from "next/link";

interface LinkedInResult {
  headlines: string[];
  about: string;
  experience: { company: string; role: string; bullets: string[] }[];
  skillsToAdd: string[];
  postIdeas: { hook: string; topic: string; angle: string }[];
  profileTips: string[];
}

export default function LinkedInPage() {
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<LinkedInResult | null>(null);
  const [profileExists, setProfileExists] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    setProfileExists(hasProfile());
  }, []);

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function CopyBtn({ text, id }: { text: string; id: string }) {
    return (
      <button
        onClick={() => copyText(text, id)}
        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs border border-border hover:bg-muted transition-colors shrink-0"
      >
        {copiedKey === id ? (
          <><Check className="w-3 h-3 text-green-500" /> Copied</>
        ) : (
          <><Copy className="w-3 h-3" /> Copy</>
        )}
      </button>
    );
  }

  async function handleOptimize() {
    setLoading(true);
    setError("");

    try {
      const profile = getProfile();
      const res = await fetch("/api/linkedin-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, targetRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Optimization failed");
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
          Create your profile first so we can optimize your LinkedIn.
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
          <BadgeCheck className="w-6 h-6 text-blue-500" />
          LinkedIn Profile Optimizer
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Generate an optimized headline, about section, and experience bullets
          for your LinkedIn profile
        </p>
      </div>

      {!result ? (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Target Role (optional)
            </label>
            <input
              className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              placeholder="e.g. Senior Software Engineer, Product Manager, Data Scientist"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Specifying a target role helps optimize for recruiter searches
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handleOptimize}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Optimizing your LinkedIn...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Optimize My LinkedIn
              </>
            )}
          </button>

          <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
            <h3 className="font-medium mb-2 text-blue-400 text-sm">
              What you&apos;ll get
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>&bull; 3 optimized headline options</li>
              <li>&bull; Full &quot;About&quot; section with hook</li>
              <li>&bull; Rewritten experience bullets with metrics</li>
              <li>&bull; Top skills to add to your profile</li>
              <li>&bull; LinkedIn post ideas to boost visibility</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setResult(null)}
              className="px-4 py-2 text-sm border border-border hover:bg-muted rounded-lg"
            >
              Regenerate
            </button>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              Headlines — pick one
            </h3>
            <div className="space-y-3">
              {result.headlines.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <p className="text-sm font-medium">{h}</p>
                  <CopyBtn text={h} id={`headline-${i}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <PenTool className="w-4 h-4 text-blue-500" />
                About Section
              </h3>
              <CopyBtn text={result.about} id="about" />
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-sm whitespace-pre-line leading-relaxed">
              {result.about}
            </div>
          </div>

          {result.experience.length > 0 && (
            <div className="p-5 rounded-xl border border-border bg-card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-500" />
                Optimized Experience
              </h3>
              <div className="space-y-5">
                {result.experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{exp.role}</p>
                        <p className="text-sm text-muted-foreground">
                          {exp.company}
                        </p>
                      </div>
                      <CopyBtn
                        text={exp.bullets.map((b) => `• ${b}`).join("\n")}
                        id={`exp-${i}`}
                      />
                    </div>
                    <ul className="space-y-1.5">
                      {exp.bullets.map((b, j) => (
                        <li
                          key={j}
                          className="text-sm text-muted-foreground pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-blue-500"
                        >
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-5 rounded-xl border border-border bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Hash className="w-4 h-4 text-blue-500" />
              Skills to Add ({result.skillsToAdd.length})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {result.skillsToAdd.map((skill, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/20"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Post Ideas to Boost Visibility
            </h3>
            <div className="space-y-3">
              {result.postIdeas.map((idea, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium">&ldquo;{idea.hook}&rdquo;</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium">Topic:</span> {idea.topic}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Angle:</span> {idea.angle}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {result.profileTips.length > 0 && (
            <div className="p-5 rounded-xl border border-primary/20 bg-primary/5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Pro Tips
              </h3>
              <ul className="space-y-2">
                {result.profileTips.map((tip, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-primary font-bold">{i + 1}.</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
