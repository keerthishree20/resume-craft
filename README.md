# ResumeCraft

AI-powered resume toolkit that turns a single profile into tailored resumes, and
then tells you where that resume falls short for a specific job.

Built with Next.js 16 and Google Gemini. No database and no login: your profile
stays in your own browser.

## What it does

| Feature | Description |
| --- | --- |
| **Resume generation** | Produces a tailored resume and cover letter from your stored profile against a target role |
| **ATS score check** | Scores a resume for applicant-tracking-system compatibility and flags what is hurting it |
| **Skill gap analysis** | Compares your profile against a job description and visualises the gap on a radar chart |
| **LinkedIn optimizer** | Rewrites headline and About section for search visibility |
| **Interview prep** | Generates likely interview questions from the job description and your background |
| **Outreach drafts** | Writes recruiter and referral messages tied to the role |
| **Profile completeness** | Tracks how much of your profile is filled in and what to add next |
| **Resume import** | Paste an existing resume and have the profile filled in for you |

## Templates

Three resume templates ship with the app: **Modern**, **Minimal** and **Classic**.
Save one as a PDF with the download button, which opens the browser's print dialog;
choose "Save as PDF".

## Tech stack

- **Framework** — Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **AI** — Google Gemini (`gemini-2.0-flash` via `@google/generative-ai`), called only from server-side API routes
- **Storage** — the browser's `localStorage` (profile and job description history)
- **PDF** — the browser's print-to-PDF
- **Charts** — a hand-built SVG radar chart

## Getting started

```bash
npm install
cp .env.example .env   # then add your Gemini key
npm run dev
```

Open <http://localhost:3000>.

### Environment variables

```
GEMINI_API_KEY=       # Google AI Studio API key
```

That is the only variable the app reads.

## Project structure

```
src/
  app/
    api/            # generate, ats-check, skill-gap, linkedin-optimize,
                    # interview-prep, outreach, parse-resume
    generate/       # resume generation flow
    profile/        # profile editor
    result/         # generated resume view
    skill-gap/      # gap analysis + radar chart
    linkedin/       # LinkedIn optimizer
    interview/      # interview prep
  components/
    templates/      # Modern / Minimal / Classic resume templates
  lib/
    gemini.ts       # Gemini client
    storage.ts      # profile persistence in localStorage
```

See [GUIDE.md](GUIDE.md) for the full walkthrough.
