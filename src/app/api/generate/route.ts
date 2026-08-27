import { NextRequest } from "next/server";
import { model } from "@/lib/gemini";
import type { UserProfile } from "@/lib/types";

export async function POST(request: NextRequest) {
  const { profile, jobDescription, coverLetterTone } = (await request.json()) as {
    profile: UserProfile;
    jobDescription: string;
    coverLetterTone?: string;
  };

  const toneInstruction = {
    professional: "Use a formal, polished, and businesslike tone. Be direct and structured.",
    confident: "Use a bold, assertive tone. Lead with achievements and strong statements. Show conviction.",
    enthusiastic: "Use an energetic, passionate tone. Show genuine excitement about the role and company.",
    creative: "Use a distinctive, memorable tone. Stand out with unique phrasing while staying professional.",
  }[coverLetterTone || "professional"] || "Use a professional tone.";

  if (!profile || !jobDescription) {
    return Response.json(
      { error: "Profile and job description are required" },
      { status: 400 }
    );
  }

  const prompt = `You are an expert resume writer and career coach. Your task is to create a highly tailored resume and cover letter based on the candidate's profile and the target job description.

## Candidate Profile
- Name: ${profile.personalInfo.fullName}
- Email: ${profile.personalInfo.email}
- Phone: ${profile.personalInfo.phone}
- Location: ${profile.personalInfo.location}
- LinkedIn: ${profile.personalInfo.linkedin}
- Portfolio: ${profile.personalInfo.portfolio}
- Summary: ${profile.personalInfo.summary}

### Experience
${profile.experience.map((e) => `- ${e.role} at ${e.company} (${e.startDate} - ${e.current ? "Present" : e.endDate})\n  ${e.description}`).join("\n")}

### Education
${profile.education.map((e) => `- ${e.degree} in ${e.field} from ${e.institution} (${e.startDate} - ${e.endDate}) GPA: ${e.gpa}`).join("\n")}

### Skills
${profile.skills.join(", ")}

### Projects
${profile.projects.map((p) => `- ${p.name}: ${p.description} (Tech: ${p.techStack})`).join("\n")}

## Target Job Description
${jobDescription}

## Instructions
1. Analyze the job description for key requirements, skills, and qualifications.
2. Match the candidate's profile against these requirements.
3. Create a tailored resume that emphasizes relevant experience and skills.
4. Write achievement-oriented bullet points using action verbs and quantifiable results where possible.
5. Write a compelling cover letter that connects the candidate's experience to the job requirements.
6. Cover letter tone: ${toneInstruction}

## Output Format
Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "resume": {
    "name": "Candidate's full name",
    "title": "A professional title tailored to the job (e.g., 'Senior Software Engineer')",
    "contact": {
      "email": "...",
      "phone": "...",
      "location": "...",
      "linkedin": "...",
      "portfolio": "..."
    },
    "summary": "A 2-3 sentence professional summary tailored to this specific job",
    "experience": [
      {
        "company": "...",
        "role": "Tailored role title if appropriate",
        "duration": "Start - End",
        "bullets": ["Achievement-oriented bullet point 1", "Bullet point 2", "..."]
      }
    ],
    "education": [
      {
        "institution": "...",
        "degree": "Degree in Field",
        "duration": "Start - End",
        "gpa": "..."
      }
    ],
    "skills": ["Skill 1", "Skill 2", "..."],
    "projects": [
      {
        "name": "...",
        "description": "Brief tailored description",
        "techStack": "..."
      }
    ]
  },
  "coverLetter": {
    "greeting": "Dear Hiring Manager,",
    "paragraphs": [
      "Opening paragraph expressing interest and mentioning the specific role",
      "Body paragraph connecting your most relevant experience to the job requirements",
      "Additional body paragraph highlighting key achievements and skills",
      "Closing paragraph with call to action"
    ],
    "closing": "Sincerely,",
    "signature": "Candidate's Name"
  }
}`;

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
    console.error("Generation error:", error);
    const message = error instanceof Error ? error.message : "";
    if (message.includes("429") || message.includes("quota")) {
      return Response.json(
        { error: "API rate limit reached. Please wait a minute and try again, or check your Gemini API billing." },
        { status: 429 }
      );
    }
    return Response.json(
      { error: "Failed to generate resume. Please try again." },
      { status: 500 }
    );
  }
}
