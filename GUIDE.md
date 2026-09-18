# ResumeCraft — Complete Project Guide

## Table of Contents
1. [What is ResumeCraft?](#what-is-resumecraft)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Where Data Lives](#where-data-lives)
5. [Pages](#pages)
6. [API Routes](#api-routes)
7. [Code Walkthrough](#code-walkthrough)
8. [Feature Walkthrough](#feature-walkthrough)
9. [Installed but Unused Packages](#installed-but-unused-packages)
10. [Troubleshooting](#troubleshooting)

---

## What is ResumeCraft?

A resume toolkit built on Google Gemini. You fill in one profile, then for any job description it
can:
- write a tailored resume and a cover letter,
- score the resume for applicant tracking system compatibility,
- compare your skills with the job and draw the gap on a radar chart,
- rewrite your LinkedIn headline and About section,
- generate likely interview questions,
- draft recruiter and referral messages.

Resumes render in three templates, Classic, Modern and Minimal, and are saved as PDF through the
browser's print dialog.

---

## Quick Start

Needs Node.js 18 or newer and a Gemini API key from Google AI Studio.

```bash
npm install
cp .env.example .env         # add your GEMINI_API_KEY
npm run dev                  # http://localhost:3000
```

`GEMINI_API_KEY` is the only variable the code reads.

---

## Architecture

```
  Browser
   pages: /  /profile  /generate  /result  /skill-gap  /linkedin  /interview
   profile and job history in localStorage  (src/lib/storage.ts)
         │ fetch
         ▼
  Next.js API routes (src/app/api/*/route.ts, run on the server)
   generate, ats-check, skill-gap, linkedin-optimize,
   interview-prep, outreach, parse-resume
         │ prompt, JSON back
         ▼
  Google Gemini  gemini-2.0-flash   (src/lib/gemini.ts)
```

There is no database and no login. Each API route builds a prompt, sends it to Gemini, and returns
the JSON the model produces. The key stays on the server.

---

## Where Data Lives

Everything is in the browser's `localStorage`:

| key | contents |
|---|---|
| `resumecraft_profile` | your profile: personal info, experience, education, skills, projects |
| `resumecraft_jd_history` | job descriptions you have used, with title and company |

Clearing site data in the browser deletes your profile. Another browser or device starts empty.

---

## Pages

| route | purpose |
|---|---|
| `/` | home |
| `/profile` | edit your profile, or paste a resume to fill it automatically. Shows `ProfileCompleteness` |
| `/generate` | paste a job description, pick a cover letter tone, generate |
| `/result` | the generated resume in a chosen template, cover letter, ATS score and outreach drafts, in tabs |
| `/skill-gap` | skill comparison with a radar chart |
| `/linkedin` | headline and About rewrite |
| `/interview` | likely interview questions |

The navigation bar in `components/Navbar.tsx` links Home, Profile, Generate, Interview, Skill Gap and
LinkedIn.

---

## API Routes

All are `POST` handlers under `src/app/api/`, each calling Gemini.

| route | input | returns |
|---|---|---|
| `/api/parse-resume` | `resumeText`, at least 20 characters | a structured profile |
| `/api/generate` | `profile`, `jobDescription`, optional `coverLetterTone` | tailored resume and cover letter |
| `/api/ats-check` | a resume and job description | a score and what is hurting it |
| `/api/skill-gap` | profile and job description | matched and missing skills with scores |
| `/api/linkedin-optimize` | profile | new headline and About text |
| `/api/interview-prep` | profile and job description | questions and guidance |
| `/api/outreach` | profile and role | recruiter and referral messages with `[Name]`-style placeholders |

Each route asks for JSON with no markdown fences and parses the reply. If the model returns something
else, the route returns an error.

---

## Code Walkthrough

| file | purpose |
|---|---|
| `src/lib/gemini.ts` | creates the client and exports `model`, set to `gemini-2.0-flash` |
| `src/lib/storage.ts` | `getProfile`, `saveProfile`, `hasProfile`, `getJDHistory`, `saveJD` |
| `src/lib/types.ts` | the profile, result and history types |
| `src/components/templates/` | `ClassicTemplate`, `ModernTemplate`, `MinimalTemplate` as React components |
| `src/components/ATSScoreCard.tsx` | shows the ATS score and issues |
| `src/components/RadarChart.tsx` | a hand-built SVG radar chart, no chart library |
| `src/components/EditableText.tsx` | inline editing of generated text before printing, used by the Classic template |
| `src/components/ProfileCompleteness.tsx` | how much of the profile is filled in |

To change the model, edit the one line in `src/lib/gemini.ts`.

---

## Feature Walkthrough

1. **Profile.** Paste your existing resume on `/profile` and let `parse-resume` fill the fields, then
   correct anything it missed.
2. **Generate.** On `/generate`, paste the job description and choose a cover letter tone.
3. **Review.** On `/result`, pick Classic, Modern or Minimal. The Classic template lets you edit
   text inline before printing.
4. **Check.** Open the ATS tab for a score and fixes.
5. **Save as PDF.** Press the download button. It opens the browser's print dialog. Choose "Save as
   PDF".
6. **Outreach.** Open the outreach tab for messages to send, and replace the placeholders.
7. **Prepare.** Use `/skill-gap`, `/linkedin` and `/interview` for the same job.

---

## Installed but Unused Packages

`package.json` still lists packages that nothing in `src/` imports:

| package | status |
|---|---|
| `next-auth` | never imported. There is no login |
| `prisma`, `@prisma/client` | never imported. `prisma/schema.prisma` defines no models, and data is in `localStorage` |
| `@react-pdf/renderer` | never imported. PDFs come from `window.print()` |
| `react-hook-form`, `@hookform/resolvers`, `zod` | never imported |

They do no harm at runtime but make installs larger. Remove them with `npm uninstall`, along with
`prisma/` and `prisma.config.ts`, or use them if you add login, a database or form validation later.

---

## Troubleshooting

### Every AI feature fails with a server error
`GEMINI_API_KEY` is missing from `.env`, or invalid. Restart `npm run dev` after changing it.

### "Please paste your resume content"
`/api/parse-resume` needs at least 20 characters of resume text.

### A feature fails with a JSON parse error
Gemini returned text that was not valid JSON. Try again. If it keeps happening, the prompt in that
route may need tightening.

### My profile disappeared
It lives in `localStorage`. Clearing site data, using a private window, or switching browsers loses
it. Keep a copy of your source resume to paste back in.

### The PDF has browser headers and footers
Turn off "Headers and footers" in the print dialog's settings.
