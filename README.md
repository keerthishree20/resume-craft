# ResumeCraft

AI-powered resume toolkit that turns a single profile into tailored resumes, and
then tells you where that resume falls short for a specific job.

Built with Next.js 16, Google Gemini, Prisma and React PDF.

## What it does

| Feature | Description |
| --- | --- |
| **Resume generation** | Produces a tailored resume from your stored profile against a target role, rendered to PDF |
| **ATS score check** | Scores a resume for applicant-tracking-system compatibility and flags what is hurting it |
| **Skill gap analysis** | Compares your profile against a job description and visualises the gap on a radar chart |
| **LinkedIn optimizer** | Rewrites headline and About section for search visibility |
| **Interview prep** | Generates likely interview questions from the job description and your background |
| **Outreach drafts** | Writes recruiter and referral messages tied to the role |
| **Profile completeness** | Tracks how much of your profile is filled in and what to add next |

## Templates

Three PDF resume templates ship with the app: **Modern**, **Minimal** and **Classic**.

## Tech stack

- **Framework** — Next.js 16 (App Router), React 19, TypeScript
- **AI** — Google Gemini (`@google/generative-ai`)
- **Auth** — NextAuth
- **Database** — Prisma
- **PDF** — `@react-pdf/renderer`
- **Forms & validation** — React Hook Form + Zod

## Getting started

```bash
npm install
cp .env.example .env   # then fill in the values below
npx prisma generate
npm run dev
```

Open <http://localhost:3000>.

### Environment variables

```
GEMINI_API_KEY=       # Google AI Studio API key
DATABASE_URL=         # Prisma connection string
NEXTAUTH_SECRET=      # any random string
NEXTAUTH_URL=http://localhost:3000
```

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
    templates/      # Modern / Minimal / Classic PDF templates
  lib/
    gemini.ts       # Gemini client
    storage.ts      # profile persistence
```
