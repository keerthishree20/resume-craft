import { NextRequest } from "next/server";
import { model } from "@/lib/gemini";
import type { GeneratedResume } from "@/lib/types";

export async function POST(request: NextRequest) {
  const { resume, jobDescription } = (await request.json()) as {
    resume: GeneratedResume;
    jobDescription: string;
  };

  if (!resume || !jobDescription) {
    return Response.json(
      { error: "Resume and job description are required" },
      { status: 400 }
    );
  }

  const resumeText = [
    resume.name,
    resume.title,
    resume.summary,
    ...resume.experience.flatMap((e) => [e.role, e.company, ...e.bullets]),
    ...resume.education.map((e) => `${e.degree} ${e.institution}`),
    ...resume.skills,
    ...resume.projects.flatMap((p) => [p.name, p.description, p.techStack]),
  ].join(" ");

  const prompt = `You are an expert ATS (Applicant Tracking System) analyzer. Analyze how well this resume matches the job description. Be strict but fair — real ATS systems are harsh.

## Resume Content
${resumeText}

## Job Description
${jobDescription}

## Analysis Instructions
1. **Keyword Matching**: Extract important keywords/phrases from the JD (technical skills, tools, qualifications, certifications, soft skills). Check which ones appear in the resume.
2. **Section Scoring**: Score each resume section on how well it matches JD requirements.
3. **Gap Analysis**: Identify critical missing keywords that would hurt ATS ranking.
4. **Actionable Suggestions**: Give specific, actionable tips to improve the score.

## Output Format
Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "overallScore": 72,
  "sections": [
    {"name": "Skills Match", "score": 80, "feedback": "Good coverage of technical skills but missing cloud certifications mentioned in JD"},
    {"name": "Experience Relevance", "score": 70, "feedback": "Experience aligns well but bullet points lack quantifiable metrics"},
    {"name": "Education Fit", "score": 90, "feedback": "Education requirements fully met"},
    {"name": "Keywords & Formatting", "score": 65, "feedback": "Missing several industry-specific keywords from the JD"},
    {"name": "Overall Tailoring", "score": 68, "feedback": "Resume could be more specifically tailored to this role"}
  ],
  "matchedKeywords": ["Python", "React", "AWS", "agile", "REST APIs"],
  "missingKeywords": ["Kubernetes", "CI/CD", "GraphQL", "team leadership"],
  "suggestions": [
    "Add 'Kubernetes' to your skills — the JD lists it as a requirement",
    "Include quantifiable metrics in experience bullets (e.g., 'Reduced load time by 40%')",
    "Add a mention of CI/CD pipeline experience to match the DevOps requirement",
    "Consider adding the exact job title from the JD in your professional summary"
  ]
}

Rules:
- overallScore should be between 0-100
- section scores should be between 0-100
- Be realistic — don't inflate scores. A perfect match is rare.
- matchedKeywords: only keywords actually found in both resume and JD
- missingKeywords: important JD keywords NOT in the resume
- suggestions: 4-6 specific, actionable tips`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    return Response.json(parsed);
  } catch (error) {
    console.error("ATS check error:", error);
    const message = error instanceof Error ? error.message : "";
    if (message.includes("429") || message.includes("quota")) {
      return Response.json(
        { error: "API rate limit reached. Please wait a minute and try again, or check your Gemini API billing." },
        { status: 429 }
      );
    }
    return Response.json(
      { error: "Failed to analyze resume. Please try again." },
      { status: 500 }
    );
  }
}
