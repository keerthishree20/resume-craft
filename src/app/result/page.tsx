"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { GenerationResult, ATSResult } from "@/lib/types";
import type { GeneratedResume } from "@/lib/types";
import {
  Download,
  FileText,
  Mail,
  ArrowLeft,
  Printer,
  Layout,
  ShieldCheck,
  Loader2,
  Pencil,
  RotateCcw,
  Send,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";
import ClassicTemplate from "@/components/templates/ClassicTemplate";
import ModernTemplate from "@/components/templates/ModernTemplate";
import MinimalTemplate from "@/components/templates/MinimalTemplate";
import ATSScoreCard from "@/components/ATSScoreCard";

type TemplateName = "classic" | "modern" | "minimal";
type ViewTab = "resume" | "coverLetter" | "ats" | "outreach";

interface OutreachMessage {
  type: string;
  subject: string;
  body: string;
  tips: string;
  charCount: number;
}

interface OutreachResult {
  messages: OutreachMessage[];
}

const templates: { id: TemplateName; label: string; desc: string }[] = [
  { id: "classic", label: "Classic", desc: "Traditional single-column layout" },
  { id: "modern", label: "Modern", desc: "Two-column with colored sidebar" },
  { id: "minimal", label: "Minimal", desc: "Elegant serif typography" },
];

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [activeView, setActiveView] = useState<ViewTab>("resume");
  const [template, setTemplate] = useState<TemplateName>("classic");
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsError, setAtsError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editedResume, setEditedResume] = useState<GeneratedResume | null>(null);
  const [outreachResult, setOutreachResult] = useState<OutreachResult | null>(null);
  const [outreachLoading, setOutreachLoading] = useState(false);
  const [outreachError, setOutreachError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("resumecraft_result");
    if (!stored) {
      router.push("/generate");
      return;
    }
    const parsed = JSON.parse(stored);
    setResult(parsed);
    setEditedResume(JSON.parse(JSON.stringify(parsed.resume)));
  }, [router]);

  if (!result || !editedResume) return null;

  const resume = editMode ? editedResume : result.resume;
  const { coverLetter } = result;

  function updateResume(updater: (r: GeneratedResume) => GeneratedResume) {
    setEditedResume((prev) => (prev ? updater({ ...prev }) : prev));
  }

  function resetEdits() {
    setEditedResume(JSON.parse(JSON.stringify(result!.resume)));
    setEditMode(false);
  }

  function handlePrint() {
    window.print();
  }

  async function runATSCheck() {
    if (atsResult) {
      setActiveView("ats");
      return;
    }

    setActiveView("ats");
    setAtsLoading(true);
    setAtsError("");

    try {
      const jd = sessionStorage.getItem("resumecraft_jd") || "";
      const res = await fetch("/api/ats-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription: jd }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "ATS check failed");
      }

      const data = await res.json();
      setAtsResult(data);
    } catch (err) {
      setAtsError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setAtsLoading(false);
    }
  }

  async function runOutreach() {
    if (outreachResult) {
      setActiveView("outreach");
      return;
    }

    setActiveView("outreach");
    setOutreachLoading(true);
    setOutreachError("");

    try {
      const jd = sessionStorage.getItem("resumecraft_jd") || "";
      const profileStr = localStorage.getItem("resumecraft_profile");
      const profile = profileStr ? JSON.parse(profileStr) : null;

      const res = await fetch("/api/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, jobDescription: jd, recipientRole: "Hiring Manager" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      setOutreachResult(await res.json());
    } catch (err) {
      setOutreachError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setOutreachLoading(false);
    }
  }

  function copyToClipboard(text: string, index: number) {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  function renderTemplate() {
    const props = { resume, editMode, onUpdate: updateResume };
    switch (template) {
      case "modern":
        return <ModernTemplate {...props} />;
      case "minimal":
        return <MinimalTemplate {...props} />;
      default:
        return <ClassicTemplate {...props} />;
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="no-print flex items-center justify-between mb-6">
        <Link
          href="/generate"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Generate Another
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setActiveView("resume")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeView === "resume"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Resume
            </button>
            <button
              onClick={() => setActiveView("coverLetter")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeView === "coverLetter"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Cover Letter
            </button>
            <button
              onClick={runATSCheck}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeView === "ats"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              ATS
            </button>
            <button
              onClick={runOutreach}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeView === "outreach"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              Outreach
            </button>
          </div>
          {activeView === "resume" && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEditMode(!editMode)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  editMode
                    ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30"
                    : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                {editMode ? "Editing" : "Edit"}
              </button>
              {editMode && (
                <button
                  onClick={resetEdits}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-border text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
            </div>
          )}
          {activeView !== "ats" && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
          )}
        </div>
      </div>

      {activeView === "resume" && (
        <div className="no-print mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Layout className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Choose Template</span>
          </div>
          <div className="flex gap-3">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className={`flex-1 p-3 rounded-lg border text-left transition-all ${
                  template === t.id
                    ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                    : "border-border bg-card hover:border-muted-foreground/30"
                }`}
              >
                <p
                  className={`text-sm font-medium ${template === t.id ? "text-primary" : "text-foreground"}`}
                >
                  {t.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeView === "resume" && (
        <div className="rounded-lg shadow-xl print:shadow-none print:rounded-none overflow-hidden">
          {renderTemplate()}
        </div>
      )}

      {activeView === "coverLetter" && (
        <div className="bg-white text-black rounded-lg shadow-xl p-8 md:p-12 max-w-[210mm] mx-auto print:shadow-none print:rounded-none print:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{resume.name}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
              {resume.contact.email && <span>{resume.contact.email}</span>}
              {resume.contact.phone && <span>{resume.contact.phone}</span>}
              {resume.contact.location && (
                <span>{resume.contact.location}</span>
              )}
            </div>
          </div>
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p>{coverLetter.greeting}</p>
            {coverLetter.paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
            <div className="mt-8">
              <p>{coverLetter.closing}</p>
              <p className="font-semibold mt-1">{coverLetter.signature}</p>
            </div>
          </div>
        </div>
      )}

      {activeView === "ats" && (
        <div className="no-print">
          {atsLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-lg font-medium">Analyzing your resume...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Checking keyword matches, formatting, and ATS compatibility
              </p>
            </div>
          )}
          {atsError && (
            <div className="text-center py-20">
              <p className="text-destructive mb-4">{atsError}</p>
              <button
                onClick={runATSCheck}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm"
              >
                Try Again
              </button>
            </div>
          )}
          {atsResult && <ATSScoreCard result={atsResult} />}
        </div>
      )}

      {activeView === "outreach" && (
        <div className="no-print">
          {outreachLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-lg font-medium">Generating outreach messages...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Creating personalized networking messages
              </p>
            </div>
          )}
          {outreachError && (
            <div className="text-center py-20">
              <p className="text-destructive mb-4">{outreachError}</p>
              <button
                onClick={runOutreach}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm"
              >
                Try Again
              </button>
            </div>
          )}
          {outreachResult && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Personalized messages ready to send. Click copy and customize with real names.
              </p>
              {outreachResult.messages.map((msg, i) => (
                <div key={i} className="p-5 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Send className="w-4 h-4 text-primary" />
                      {msg.type}
                    </h3>
                    <button
                      onClick={() => copyToClipboard(msg.subject ? `Subject: ${msg.subject}\n\n${msg.body}` : msg.body, i)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-border hover:bg-muted transition-colors"
                    >
                      {copiedIndex === i ? (
                        <><Check className="w-3.5 h-3.5 text-green-500" /> Copied!</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" /> Copy</>
                      )}
                    </button>
                  </div>
                  {msg.subject && (
                    <p className="text-xs text-muted-foreground mb-2">
                      <span className="font-medium">Subject:</span> {msg.subject}
                    </p>
                  )}
                  <div className="p-4 rounded-lg bg-muted/50 text-sm whitespace-pre-line leading-relaxed">
                    {msg.body}
                  </div>
                  <p className="mt-2 text-xs text-primary/70 flex items-center gap-1">
                    <Send className="w-3 h-3" />
                    {msg.tips}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(activeView === "resume" || activeView === "coverLetter") && (
        <div className="no-print mt-6 flex justify-center gap-4">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </button>
          <Link
            href="/generate"
            className="flex items-center gap-2 px-6 py-3 border border-border hover:bg-muted font-medium rounded-lg transition-colors"
          >
            Generate for Another Job
          </Link>
        </div>
      )}
    </div>
  );
}
