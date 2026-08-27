import Link from "next/link";
import {
  FileText,
  Sparkles,
  Download,
  UserCircle,
  ShieldCheck,
  Layout,
  Zap,
  MessageSquare,
  Pencil,
  Clock,
  ChevronDown,
  BadgeCheck,
} from "lucide-react";

const faqs = [
  {
    q: "Is ResumeCraft free to use?",
    a: "Yes! You can create your profile and generate resumes for free. We plan to add premium features like advanced templates and unlimited generations in the future.",
  },
  {
    q: "How does the ATS Score Checker work?",
    a: "Our AI compares your resume against the job description, checking for keyword matches, formatting issues, and missing qualifications. It gives you a score out of 100 with specific suggestions to improve.",
  },
  {
    q: "Can I edit the generated resume?",
    a: "Absolutely! Click the Edit button on the result page to modify any text directly on the resume. Your changes are reflected in real-time across all templates.",
  },
  {
    q: "What AI model powers the generation?",
    a: "We use Google's Gemini 2.0 Flash model for fast, high-quality resume and cover letter generation tailored to each job description.",
  },
  {
    q: "Is my data safe?",
    a: "Your profile data is stored locally in your browser. We don't store your information on any server. Your data never leaves your device except during AI generation.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="flex flex-col items-center justify-center px-4 pt-24 pb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Resume Builder
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-center max-w-3xl leading-tight">
          Land Your Dream Job with{" "}
          <span className="text-primary">AI-Crafted</span> Resumes
        </h1>
        <p className="mt-6 text-lg text-muted-foreground text-center max-w-xl">
          Build your profile once. Paste any job description. Get a perfectly
          tailored resume and cover letter in seconds.
        </p>
        <div className="flex gap-4 mt-10">
          <Link
            href="/profile"
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors"
          >
            Get Started Free
          </Link>
          <Link
            href="#how-it-works"
            className="px-6 py-3 border border-border hover:bg-muted font-medium rounded-lg transition-colors"
          >
            How It Works
          </Link>
        </div>
      </section>

      <section className="py-12 px-4 border-t border-border bg-card/30">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "10K+", label: "Resumes Generated" },
            { value: "3", label: "Pro Templates" },
            { value: "85%", label: "Avg ATS Score" },
            { value: "30s", label: "Generation Time" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl md:text-4xl font-bold text-primary">
                {value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Three Simple Steps
          </h2>
          <p className="text-muted-foreground text-center mb-12">
            From profile to polished resume in minutes
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: UserCircle,
                step: "01",
                title: "Build Your Profile",
                desc: "Enter your experience, education, skills, and projects once. Or paste an existing resume to auto-fill.",
              },
              {
                icon: Sparkles,
                step: "02",
                title: "Paste a Job Description",
                desc: "Copy any job posting. Our AI analyzes requirements and matches them to your profile.",
              },
              {
                icon: Download,
                step: "03",
                title: "Download & Apply",
                desc: "Get a tailored resume, cover letter, ATS score, and interview prep. Download as PDF.",
              },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div
                key={step}
                className="p-6 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-mono text-muted-foreground">
                    {step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground text-center mb-12">
            A complete toolkit for your job search
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: "ATS Score Checker",
                desc: "Get a detailed ATS compatibility score with keyword analysis, gap detection, and actionable tips.",
              },
              {
                icon: MessageSquare,
                title: "Interview Prep",
                desc: "AI generates likely interview questions with personalized sample answers based on your profile and the job.",
              },
              {
                icon: Layout,
                title: "3 Pro Templates",
                desc: "Classic, Modern, and Minimal designs. Switch instantly and download whichever fits the role.",
              },
              {
                icon: Pencil,
                title: "Inline Editing",
                desc: "Click any text on your resume to edit it directly. Fine-tune before downloading.",
              },
              {
                icon: Clock,
                title: "JD History",
                desc: "Your past job descriptions are saved for quick reuse. Generate for multiple roles in seconds.",
              },
              {
                icon: Zap,
                title: "Instant Tailoring",
                desc: "AI rewrites your resume to match each job — highlighting the right skills and experience.",
              },
              {
                icon: BadgeCheck,
                title: "LinkedIn Optimizer",
                desc: "Get optimized headlines, about sections, experience bullets, and post ideas for your LinkedIn profile.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
              >
                <Icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">FAQ</h2>
          <p className="text-muted-foreground text-center mb-10">
            Common questions about ResumeCraft
          </p>
          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <details
                key={q}
                className="group p-4 rounded-xl border border-border bg-card"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none font-medium">
                  {q}
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Stand Out?</h2>
          <p className="text-muted-foreground mb-8">
            Stop sending generic resumes. Let AI tailor every application.
          </p>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors text-lg"
          >
            <FileText className="w-5 h-5" />
            Create Your Profile
          </Link>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-border text-center text-sm text-muted-foreground">
        <p>ResumeCraft &mdash; AI-Powered Resume & Cover Letter Generator</p>
      </footer>
    </div>
  );
}
