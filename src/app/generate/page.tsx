"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProfile, hasProfile, getJDHistory, saveJD, deleteJD } from "@/lib/storage";
import type { SavedJD } from "@/lib/types";
import {
  Sparkles,
  AlertCircle,
  Loader2,
  FileText,
  Clock,
  Trash2,
  Building2,
} from "lucide-react";
import Link from "next/link";

export default function GeneratePage() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileExists, setProfileExists] = useState(false);
  const [jdHistory, setJdHistory] = useState<SavedJD[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [coverLetterTone, setCoverLetterTone] = useState("professional");

  useEffect(() => {
    setProfileExists(hasProfile());
    setJdHistory(getJDHistory());
  }, []);

  function loadJD(jd: SavedJD) {
    setJobDescription(jd.description);
    setJobTitle(jd.title);
    setCompanyName(jd.company);
  }

  function handleDeleteJD(id: string) {
    deleteJD(id);
    setJdHistory(getJDHistory());
  }

  async function handleGenerate() {
    if (!jobDescription.trim()) {
      setError("Please paste a job description");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const profile = getProfile();
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, jobDescription, coverLetterTone }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      const result = await res.json();

      if (jobTitle.trim() || companyName.trim()) {
        saveJD(jobTitle || "Untitled Role", companyName || "Unknown Company", jobDescription);
      }

      sessionStorage.setItem("resumecraft_result", JSON.stringify(result));
      sessionStorage.setItem("resumecraft_jd", jobDescription);
      router.push("/result");
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
          You need to create your profile before generating a resume.
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
        <h1 className="text-2xl font-bold">Generate Resume</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Paste a job description and let AI craft a tailored resume and cover
          letter for you
        </p>
      </div>

      {jdHistory.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Recent Job Descriptions
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {jdHistory.map((jd) => (
              <div
                key={jd.id}
                className="flex-shrink-0 group relative"
              >
                <button
                  onClick={() => loadJD(jd)}
                  className="flex items-start gap-2 p-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors text-left w-56"
                >
                  <Building2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{jd.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {jd.company}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {new Date(jd.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => handleDeleteJD(jd.id)}
                  className="absolute top-1 right-1 p-1 rounded text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Job Title
            </label>
            <input
              className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
              placeholder="e.g. Senior Software Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Company Name
            </label>
            <input
              className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
              placeholder="e.g. Google"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Job Description *
          </label>
          <textarea
            className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary h-56 resize-none font-mono text-sm"
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {jobDescription.length} characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Cover Letter Tone
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: "professional", label: "Professional", emoji: "💼" },
              { id: "confident", label: "Confident", emoji: "💪" },
              { id: "enthusiastic", label: "Enthusiastic", emoji: "🔥" },
              { id: "creative", label: "Creative", emoji: "🎨" },
            ].map((tone) => (
              <button
                key={tone.id}
                onClick={() => setCoverLetterTone(tone.id)}
                className={`p-3 rounded-lg border text-sm font-medium text-center transition-all ${
                  coverLetterTone === tone.id
                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "border-border bg-card text-muted-foreground hover:border-muted-foreground/30"
                }`}
              >
                <span className="text-lg block mb-0.5">{tone.emoji}</span>
                {tone.label}
              </button>
            ))}
          </div>
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
              Generating... (this may take 15-30 seconds)
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Resume & Cover Letter
            </>
          )}
        </button>

        <div className="p-4 rounded-xl border border-border bg-card">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Tips for best results
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              &bull; Paste the complete job description including requirements
            </li>
            <li>&bull; Include the job title and company name if available</li>
            <li>&bull; The more detail in the JD, the better the tailoring</li>
            <li>&bull; Make sure your profile is complete and up-to-date</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
