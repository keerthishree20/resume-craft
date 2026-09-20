# ResumeCraft — Complete Project Guide

A complete guide from zero to a working AI resume toolkit. Covers every feature, every design decision
and the reason behind it, with the real code. It is self-contained: you can paste it into any AI chat
and ask questions about the project without sharing the repository.

**Repository:** https://github.com/keerthishree20/resume-craft
**All projects:** https://github.com/keerthishree20

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Why](#2-tech-stack--why)
3. [Project Setup from Scratch](#3-project-setup-from-scratch)
4. [Project Structure](#4-project-structure)
5. [Architecture: No Database, No Login](#5-architecture-no-database-no-login)
6. [The Data Model](#6-the-data-model)
7. [Where Data Lives](#7-where-data-lives)
8. [The Gemini Client](#8-the-gemini-client)
9. [The Shared API Route Pattern](#9-the-shared-api-route-pattern)
10. [Profile: Paste a Resume to Fill It](#10-profile-paste-a-resume-to-fill-it)
11. [Profile Completeness](#11-profile-completeness)
12. [Tailored Resume & Cover Letter](#12-tailored-resume--cover-letter)
13. [Three Templates & Inline Editing](#13-three-templates--inline-editing)
14. [PDF via the Print Dialog](#14-pdf-via-the-print-dialog)
15. [ATS Score & the Radar Chart](#15-ats-score--the-radar-chart)
16. [Outreach Messages](#16-outreach-messages)
17. [Skill Gap & Learning Plan](#17-skill-gap--learning-plan)
18. [LinkedIn Optimizer](#18-linkedin-optimizer)
19. [Interview Prep](#19-interview-prep)
20. [API Reference](#20-api-reference)
21. [Environment Variables](#21-environment-variables)
22. [Installed but Unused Packages](#22-installed-but-unused-packages)
23. [Known Issues](#23-known-issues)
24. [Troubleshooting](#24-troubleshooting)
25. [Complete Feature Summary](#25-complete-feature-summary)

---

## 1. Project Overview

ResumeCraft is a **resume toolkit powered by Google Gemini**. You fill in one profile (or paste your
existing resume and let the AI fill it), then for any job description it can:

- write a **tailored resume and cover letter** (four cover-letter tones),
- **score the resume** the way an applicant tracking system (ATS) would, with a radar chart,
- write **outreach messages**: LinkedIn connection request, follow-up, cold email, referral request,
- compare your skills with the job and build a **learning plan** for the gaps,
- rewrite your **LinkedIn** headline, About section and experience bullets,
- generate **10 likely interview questions** with sample answers based on your real experience.

Resumes render in three templates (Classic, Modern, Minimal) and are saved as PDF through the browser's
print dialog.

**Status:** works locally. Not deployed. No automated tests. The Gemini key in the local `.env` was
found to be invalid on 2026-09-18 — you need a fresh key (see [Troubleshooting](#24-troubleshooting)).

---

## 2. Tech Stack & Why

| Technology | Role | Why We Chose It |
|---|---|---|
| **Next.js 16** (App Router) | Pages and API routes in one app | the API routes keep the Gemini key on the server; no separate backend |
| **React 19** | UI | |
| **TypeScript** | Types | the profile and AI results have fixed shapes (`src/lib/types.ts`) |
| **Tailwind CSS 4** | Styling | dark UI, plus print rules for the resume |
| **Google Gemini** via `@google/generative-ai` | All AI features | free tier, good at following a JSON structure |
| **localStorage / sessionStorage** | Storage | no database or account needed for a single-user tool |
| **Lucide React** | Icons | |
| Hand-built **SVG radar chart** | ATS visual | one chart does not justify a chart library |

### Why no backend server?
Every AI feature is "build a prompt, call Gemini, return JSON". Next.js API routes do that on the
server, so the key never reaches the browser, and there is only one thing to run.

---

## 3. Project Setup from Scratch

### Prerequisites
- Node.js 18+
- A Gemini API key from https://aistudio.google.com/apikey

### Steps
```bash
git clone https://github.com/keerthishree20/resume-craft.git
cd resume-craft
npm install
cp .env.example .env         # put your key in GEMINI_API_KEY
npm run dev                  # http://localhost:3000
```

### Build for production
```bash
npm run build && npm start
```

---

## 4. Project Structure

```
src/
  app/
    page.tsx                  home
    profile/page.tsx          profile form + "paste your resume"
    generate/page.tsx         job description + cover letter tone
    result/page.tsx           tabs: resume, cover letter, ATS, outreach
    skill-gap/page.tsx        skill comparison and learning plan
    linkedin/page.tsx         LinkedIn optimizer
    interview/page.tsx        interview questions
    api/
      parse-resume/route.ts   resume text → profile
      generate/route.ts       profile + JD → resume + cover letter
      ats-check/route.ts      resume + JD → score
      outreach/route.ts       profile + JD → four messages
      skill-gap/route.ts      profile + JD → gaps + plan
      linkedin-optimize/route.ts  profile → LinkedIn content
      interview-prep/route.ts profile + JD → 10 questions
    globals.css               theme + @media print rules
  components/
    Navbar.tsx  ProfileCompleteness.tsx  ATSScoreCard.tsx  RadarChart.tsx  EditableText.tsx
    templates/ClassicTemplate.tsx  ModernTemplate.tsx  MinimalTemplate.tsx
  lib/
    gemini.ts                 the model client
    storage.ts                localStorage helpers
    types.ts                  all data shapes
prisma/  prisma.config.ts     unused leftovers (see section 22)
```

---

## 5. Architecture: No Database, No Login

```
Browser
  /profile ──► localStorage "resumecraft_profile"
  /generate ─► POST /api/generate ─► sessionStorage "resumecraft_result" + "resumecraft_jd"
  /result ───► reads sessionStorage; ATS tab ─► /api/ats-check; Outreach tab ─► /api/outreach
  /skill-gap, /interview ─► reuse the JD from sessionStorage
  /linkedin ─► /api/linkedin-optimize
        │
        ▼
Next.js API routes (server) ──► Gemini (GEMINI_MODEL) ──► JSON back
```

The browser holds all your data. The server holds only the key.

---

## 6. The Data Model

`src/lib/types.ts`. The profile you fill in:

```ts
export interface UserProfile {
  personalInfo: PersonalInfo;   // fullName, email, phone, location, linkedin, portfolio, summary
  experience: Experience[];     // id, company, role, startDate, endDate, current, description
  education: Education[];       // id, institution, degree, field, startDate, endDate, gpa
  skills: string[];
  projects: Project[];          // id, name, description, techStack, link
}
```

What the AI generates:

```ts
export interface GeneratedResume {
  name: string; title: string;
  contact: { email; phone; location; linkedin; portfolio };
  summary: string;
  experience: { company; role; duration; bullets: string[] }[];
  education: { institution; degree; duration; gpa }[];
  skills: string[];
  projects: { name; description; techStack }[];
}
export interface GeneratedCoverLetter { greeting; paragraphs: string[]; closing; signature }

export interface ATSResult {
  overallScore: number;
  sections: { name; score; feedback }[];
  matchedKeywords: string[]; missingKeywords: string[]; suggestions: string[];
}

export interface InterviewQuestion {
  question: string;
  type: "behavioral" | "technical" | "situational" | "general";
  difficulty: "easy" | "medium" | "hard";
  sampleAnswer: string; tips: string;
}
```

### Why separate "profile" from "generated resume"?
The profile is the raw truth about you. The generated resume is a rewrite for one job. Keeping them
apart means generating for job B never overwrites what you wrote.

---

## 7. Where Data Lives

| Storage | Key | Contents | Lifetime |
|---|---|---|---|
| localStorage | `resumecraft_profile` | your profile | until you clear site data |
| localStorage | `resumecraft_jd_history` | the last **10** job descriptions (title, company, text) | until cleared |
| sessionStorage | `resumecraft_result` | the last generated resume and cover letter | this tab only |
| sessionStorage | `resumecraft_jd` | the job description in use | this tab only |

`src/lib/storage.ts`:

```ts
export function hasProfile(): boolean {
  if (typeof window === "undefined") return false;       // server render: no storage
  const stored = localStorage.getItem(PROFILE_KEY);
  if (!stored) return false;
  const profile: UserProfile = JSON.parse(stored);
  return profile.personalInfo.fullName.trim() !== "";
}

export function saveJD(title: string, company: string, description: string): void {
  const history = getJDHistory();
  const newJD: SavedJD = { id: Math.random().toString(36).substring(2, 9),
                           title, company, description, savedAt: Date.now() };
  const updated = [newJD, ...history].slice(0, 10);       // keep the newest 10
  localStorage.setItem(JD_HISTORY_KEY, JSON.stringify(updated));
}
```

The `typeof window === "undefined"` checks are there because Next.js also renders pages on the server,
where `localStorage` does not exist.

---

## 8. The Gemini Client

`src/lib/gemini.ts`:

```ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// gemini-2.0-flash was retired and every call returned 404. The model is a
// setting so the next retirement is an .env edit, not a code change.
export const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
});
```

### Why a setting?
The app originally hard-coded `gemini-2.0-flash`. Google retired it and every feature broke. Now a
retirement is a one-line `.env` change.

---

## 9. The Shared API Route Pattern

All seven routes follow the same shape. From `api/ats-check/route.ts`:

```ts
export async function POST(request: NextRequest) {
  const { resume, jobDescription } = await request.json();
  if (!resume || !jobDescription) {
    return Response.json({ error: "Resume and job description are required" }, { status: 400 });
  }

  const prompt = `You are an expert ATS analyzer ... Return ONLY valid JSON (no markdown, no code fences)
with this exact structure: { "overallScore": 72, "sections": [...], ... }`;

  try {
    const result = await model.generateContent(prompt);
    const cleaned = result.response.text()
      .replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();   // strip fences anyway
    return Response.json(JSON.parse(cleaned));
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("429") || message.includes("quota")) {
      return Response.json({ error: "API rate limit reached. Please wait a minute ..." }, { status: 429 });
    }
    return Response.json({ error: "Failed to analyze resume. Please try again." }, { status: 500 });
  }
}
```

1. **Validate** the input → 400.
2. **Prompt** with an example of the exact JSON wanted. Showing an example works better than
   describing the shape.
3. **Strip code fences**, because models often wrap JSON in ```json even when told not to.
4. **Parse**. If parsing fails, it's a 500.
5. **Rate limits** get their own 429 message, because the free tier hits them often.

---

## 10. Profile: Paste a Resume to Fill It

`/profile` is a form for every field in `UserProfile`. To avoid typing, paste your existing resume and
press parse, which calls `POST /api/parse-resume`:

- needs at least **20 characters** (otherwise 400 "Please paste your resume content"),
- keeps the original wording of experience descriptions,
- splits skills into separate items,
- uses short date formats like "Jan 2023",
- leaves missing fields as empty strings,
- gives each experience, education and project entry a 7-character id.

Always check the result, then save. It goes to `localStorage`.

---

## 11. Profile Completeness

`components/ProfileCompleteness.tsx` scores the profile out of 100 with weighted sections:

| Section | Complete when | Weight |
|---|---|---|
| Name & Email | both filled | 20 |
| Contact Details | phone and location | 10 |
| Professional Summary | at least 20 characters | 15 |
| Experience (1+) | one entry with a company | 25 |
| Education (1+) | one entry with an institution | 15 |
| Skills (3+) | three or more | 10 |
| Projects (1+) | one with a name | 5 |

The bar is green at 80+, yellow at 50+, red below that.

### Why weights?
Experience matters most to a tailored resume, so it counts most. The AI can't invent what isn't there.

---

## 12. Tailored Resume & Cover Letter

`/generate`: paste a job description, choose a cover letter tone, press generate. The route
`api/generate/route.ts` gets `{ profile, jobDescription, coverLetterTone }`.

```ts
const toneInstruction = {
  professional: "Use a formal, polished, and businesslike tone. Be direct and structured.",
  confident:    "Use a bold, assertive tone. Lead with achievements and strong statements. Show conviction.",
  enthusiastic: "Use an energetic, passionate tone. Show genuine excitement about the role and company.",
  creative:     "Use a distinctive, memorable tone. Stand out with unique phrasing while staying professional.",
}[coverLetterTone || "professional"] || "Use a professional tone.";
```

The prompt lists the whole profile and the JD, and asks the model to:
1. find the key requirements in the JD,
2. match the profile against them,
3. emphasise relevant experience,
4. write achievement-oriented bullets with action verbs and numbers where possible,
5. write a cover letter that connects experience to requirements, in the chosen tone.

It returns `{ resume, coverLetter }`. The page stores it in `sessionStorage` with the JD, and opens
`/result`.

---

## 13. Three Templates & Inline Editing

`/result` has four tabs: **Resume**, **Cover Letter**, **ATS**, **Outreach**. On the Resume tab you pick
a template:

| Template | Component |
|---|---|
| Classic | `ClassicTemplate.tsx`, with **inline editing** |
| Modern | `ModernTemplate.tsx` |
| Minimal | `MinimalTemplate.tsx` |

All three take the same `GeneratedResume` props, so switching is instant with no new AI call.

### Inline editing
`components/EditableText.tsx` shows text normally. Click it and it becomes an input (or a textarea
when `multiline`). Leaving the field (`onBlur`) saves the change, and Escape cancels. Use it to fix
anything the AI got wrong before printing.

---

## 14. PDF via the Print Dialog

The download button calls `window.print()`. `globals.css` has print rules:

```css
@media print {
  body { background: white !important; color: black !important; }
  .no-print { display: none !important; }        /* hide navbar, tabs, buttons */
  .print-only { display: block !important; }
}
```

Choose "Save as PDF" in the dialog, and turn off "Headers and footers".

### Why print instead of a PDF library?
The browser already renders the template exactly as you see it. Printing it gives real selectable text
(ATS systems need to read it) with no extra code. `@react-pdf/renderer` is installed but was never used.

---

## 15. ATS Score & the Radar Chart

The ATS tab calls `POST /api/ats-check` with the generated resume and the JD. The route flattens the
resume into plain text (name, title, summary, roles, bullets, education, skills, projects) and asks the
model to be "strict but fair — real ATS systems are harsh". It returns:

- `overallScore` 0–100,
- five section scores with feedback: Skills Match, Experience Relevance, Education Fit, Keywords &
  Formatting, Overall Tailoring,
- `matchedKeywords` (in both) and `missingKeywords` (in the JD only),
- 4–6 specific suggestions.

`ATSScoreCard.tsx` shows it, using `RadarChart.tsx` to draw the section scores.

### The radar chart, by hand
```ts
function polarToCartesian(angle: number, r: number) {
  const radian = (Math.PI / 180) * (angle - 90);      // -90 puts the first axis at the top
  return { x: cx + r * Math.cos(radian), y: cy + r * Math.sin(radian) };
}
const angleStep = 360 / count;                         // one axis per section
const dataPoints = values.map((v, i) => polarToCartesian(i * angleStep, (v / maxValue) * radius));
const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ") + " Z";
```
Five grid polygons, one axis line per section, and a filled path for the scores, in a 300×300 SVG.

---

## 16. Outreach Messages

The Outreach tab calls `POST /api/outreach` with the profile (from `localStorage`) and the JD. It
returns four messages, each with `type`, `subject`, `body`, `tips` and `charCount`:

| Type | Tip from the prompt |
|---|---|
| LinkedIn Connection Request | under 300 characters, mention something specific |
| LinkedIn Follow-up | send within 24 hours of connecting |
| Cold Email | under 150 words, lead with value |
| Referral Request | make it easy to forward |

Messages use `[Name]`, `[Company]`, `[Role]` placeholders. Replace them before sending.

---

## 17. Skill Gap & Learning Plan

`/skill-gap` reuses the JD from `sessionStorage` (or you paste one). `POST /api/skill-gap` returns:

```json
{
  "overallReadiness": 72,
  "strongMatches":  [{"skill": "Python", "evidence": "Listed in skills + used at TechCorp"}],
  "partialMatches": [{"skill": "AWS", "evidence": "...", "gap": "Needs hands-on AWS (EC2, S3, Lambda)"}],
  "gaps": [{"skill": "Kubernetes", "importance": "high", "timeToLearn": "2-3 weeks",
            "resources": [{"name": "...", "type": "docs", "url": "..."}],
            "actionPlan": "..."}],
  "priorityOrder": ["Kubernetes", "CI/CD", "GraphQL"],
  "weeklyPlan": [{"week": 1, "focus": "Kubernetes basics", "goal": "Deploy a container on minikube"}]
}
```

`importance` is high (required in the JD), medium (preferred) or low (nice to have). The weekly plan is
2–4 weeks.

**Caution:** resource links come from the model. They point to real sites but paths may be generic or
wrong. Check before relying on them.

---

## 18. LinkedIn Optimizer

`/linkedin` sends the profile and an optional target role to `POST /api/linkedin-optimize`. It returns:

- `headlines`: 3 options under 220 characters (achievement-, role- and value-focused),
- `about`: 1500–2000 characters, with a hook in the first two lines (visible before "see more") and a
  call to action,
- `experience`: rewritten achievement bullets per role,
- `skillsToAdd`: 15 skills,
- `postIdeas`: 3 posts with hook, topic and angle,
- `profileTips`.

---

## 19. Interview Prep

`/interview` sends the profile and JD to `POST /api/interview-prep`. The prompt fixes the mix:

- exactly **10** questions,
- **3 behavioral, 3 technical, 2 situational, 2 general**,
- difficulty **3 easy, 4 medium, 3 hard**,
- sample answers must use **your actual experience**,
- short, actionable tips (behavioral ones suggest the STAR method).

---

## 20. API Reference

All are `POST`, JSON in and out.

| Route | Body | Returns | 400 when |
|---|---|---|---|
| `/api/parse-resume` | `resumeText` | `UserProfile` | text under 20 characters |
| `/api/generate` | `profile, jobDescription, coverLetterTone?` | `{ resume, coverLetter }` | profile or JD missing |
| `/api/ats-check` | `resume, jobDescription` | `ATSResult` | either missing |
| `/api/outreach` | `profile, jobDescription, recipientRole?` | `{ messages: [...] }` | profile or JD missing |
| `/api/skill-gap` | `profile, jobDescription` | readiness, matches, gaps, plan | profile or JD missing |
| `/api/linkedin-optimize` | `profile, targetRole?` | headlines, about, ... | profile missing |
| `/api/interview-prep` | `profile, jobDescription` | `{ role, questions }` | profile or JD missing |

Errors: **429** on rate limit or quota, **500** on anything else, including invalid JSON from the model.

---

## 21. Environment Variables

| Variable | Required | Default | Notes |
|---|---|---|---|
| `GEMINI_API_KEY` | yes | — | https://aistudio.google.com/apikey |
| `GEMINI_MODEL` | no | `gemini-3.6-flash` | change when Google retires it |

`.env` is git-ignored. The key is only read on the server, in `src/lib/gemini.ts`.

---

## 22. Installed but Unused Packages

These are in `package.json` but nothing in `src/` imports them:

| Package | Status |
|---|---|
| `next-auth` | no login exists |
| `prisma`, `@prisma/client` | `prisma/schema.prisma` has no models; data is in localStorage |
| `@react-pdf/renderer` | PDFs come from `window.print()` |
| `react-hook-form`, `@hookform/resolvers`, `zod` | forms are plain React state |

They are harmless at runtime but make installs bigger. Remove them with `npm uninstall`, along with
`prisma/` and `prisma.config.ts`, or use them if you add login, a database or validation later.

---

## 23. Known Issues

- **The local Gemini key is invalid** (found 2026-09-18). Make a new one.
- **Everything is per-browser.** Another device, a private window, or clearing site data starts empty.
- **Model output is trusted.** The resume, links and scores are AI-written. Read before sending.
- **No tests.**
- **Not deployed.** On Vercel, set `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`) in project settings.

---

## 24. Troubleshooting

| Problem | Fix |
|---|---|
| every feature returns a server error; terminal says "API key not valid" | new key at https://aistudio.google.com/apikey into `.env`, restart `npm run dev` |
| 404 or "no longer available" in the terminal | Google retired the model; set `GEMINI_MODEL` to a current one |
| "API rate limit reached" | free-tier limit; wait a minute |
| "Failed to ..." with a JSON parse error in the terminal | the model returned non-JSON; retry |
| `/result` sends me back to `/generate` | the result lives in `sessionStorage` for this tab only; generate again |
| my profile disappeared | it was in `localStorage`; paste your resume into `/profile` again |
| the PDF has URLs and dates at the edges | turn off "Headers and footers" in the print dialog |

---

## 25. Complete Feature Summary

### All Features Built

| # | Feature | Type | Key Files |
|---|---|---|---|
| 1 | Profile form | Frontend | `profile/page.tsx`, `lib/storage.ts` |
| 2 | Resume paste → profile | AI | `api/parse-resume/route.ts` |
| 3 | Weighted profile completeness | Frontend | `ProfileCompleteness.tsx` |
| 4 | Tailored resume + cover letter in four tones | AI | `api/generate/route.ts`, `generate/page.tsx` |
| 5 | Three resume templates | Frontend | `components/templates/` |
| 6 | Inline editing | Frontend | `EditableText.tsx`, `ClassicTemplate.tsx` |
| 7 | PDF through print | Frontend | `result/page.tsx`, `globals.css` |
| 8 | ATS score with SVG radar chart | AI + Frontend | `api/ats-check/route.ts`, `ATSScoreCard.tsx`, `RadarChart.tsx` |
| 9 | Four outreach messages | AI | `api/outreach/route.ts` |
| 10 | Skill gap + weekly plan | AI | `api/skill-gap/route.ts`, `skill-gap/page.tsx` |
| 11 | LinkedIn optimizer | AI | `api/linkedin-optimize/route.ts`, `linkedin/page.tsx` |
| 12 | 10 interview questions | AI | `api/interview-prep/route.ts`, `interview/page.tsx` |
| 13 | Last 10 job descriptions saved | Frontend | `lib/storage.ts` |
| 14 | Configurable model, 429 handling | Backend | `lib/gemini.ts`, every route |

### Data Flow Architecture

```
┌──────────────────────── Browser ────────────────────────┐
│ /profile ── paste resume ──► /api/parse-resume          │
│    └─ save ──► localStorage (profile, last 10 JDs)      │
│ /generate ── profile + JD + tone ──► /api/generate      │
│    └─ sessionStorage (result, JD) ──► /result           │
│ /result tabs: Resume (3 templates, edit, print)         │
│               Cover Letter                              │
│               ATS ──► /api/ats-check ──► radar chart    │
│               Outreach ──► /api/outreach                │
│ /skill-gap ──► /api/skill-gap                           │
│ /linkedin ──► /api/linkedin-optimize                    │
│ /interview ──► /api/interview-prep                      │
└──────────────────────────┬──────────────────────────────┘
                           ▼
         Next.js API routes (server, key stays here)
                           ▼
            Google Gemini (GEMINI_MODEL) ──► JSON
```

### Tech Stack at a Glance

```
Framework:  Next.js 16 (App Router) + React 19 + TypeScript
Styling:    Tailwind CSS 4 + print CSS
AI:         Google Gemini via @google/generative-ai (GEMINI_MODEL, default gemini-3.6-flash)
Storage:    localStorage (profile, JD history) + sessionStorage (current result)
Charts:     hand-built SVG radar chart
PDF:        window.print()
```
