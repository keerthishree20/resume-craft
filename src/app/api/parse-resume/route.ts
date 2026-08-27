import { NextRequest } from "next/server";
import { model } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  const { resumeText } = (await request.json()) as { resumeText: string };

  if (!resumeText || resumeText.trim().length < 20) {
    return Response.json(
      { error: "Please paste your resume content" },
      { status: 400 }
    );
  }

  const prompt = `You are an expert resume parser. Extract structured profile data from the following resume text. Be thorough — capture all experience, education, skills, and projects mentioned.

## Resume Text
${resumeText}

## Instructions
- Extract every piece of information available
- For experience descriptions, keep the original wording
- For skills, extract individual skills as separate items
- For dates, use simple formats like "Jan 2023" or "2023"
- If a field is not found, use an empty string
- Generate a unique ID (7 random lowercase letters/numbers) for each experience, education, and project entry

## Output Format
Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "personalInfo": {
    "fullName": "...",
    "email": "...",
    "phone": "...",
    "location": "...",
    "linkedin": "...",
    "portfolio": "...",
    "summary": "..."
  },
  "experience": [
    {
      "id": "abc1234",
      "company": "...",
      "role": "...",
      "startDate": "...",
      "endDate": "...",
      "current": false,
      "description": "Full description of responsibilities and achievements"
    }
  ],
  "education": [
    {
      "id": "def5678",
      "institution": "...",
      "degree": "...",
      "field": "...",
      "startDate": "...",
      "endDate": "...",
      "gpa": "..."
    }
  ],
  "skills": ["Skill1", "Skill2", "Skill3"],
  "projects": [
    {
      "id": "ghi9012",
      "name": "...",
      "description": "...",
      "techStack": "...",
      "link": "..."
    }
  ]
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
    console.error("Resume parse error:", error);
    const message = error instanceof Error ? error.message : "";
    if (message.includes("429") || message.includes("quota")) {
      return Response.json(
        { error: "API rate limit reached. Please wait a minute and try again, or check your Gemini API billing." },
        { status: 429 }
      );
    }
    return Response.json(
      { error: "Failed to parse resume. Please try again." },
      { status: 500 }
    );
  }
}
