import { NextRequest } from "next/server";
import { model } from "@/lib/gemini";
import type { UserProfile } from "@/lib/types";

export async function POST(request: NextRequest) {
  const { profile, jobDescription } = (await request.json()) as {
    profile: UserProfile;
    jobDescription: string;
  };

  if (!profile || !jobDescription) {
    return Response.json(
      { error: "Profile and job description are required" },
      { status: 400 }
    );
  }

  const prompt = `You are an expert interview coach. Generate likely interview questions for a candidate based on their profile and the target job description. Include a mix of behavioral, technical, situational, and general questions.

## Candidate Profile
- Name: ${profile.personalInfo.fullName}
- Summary: ${profile.personalInfo.summary}
- Skills: ${profile.skills.join(", ")}
- Experience: ${profile.experience.map((e) => `${e.role} at ${e.company}: ${e.description}`).join("\n")}
- Education: ${profile.education.map((e) => `${e.degree} in ${e.field} from ${e.institution}`).join("\n")}

## Job Description
${jobDescription}

## Instructions
1. Analyze the JD for key requirements and responsibilities
2. Generate 10 interview questions that are likely to be asked for this role
3. Include a mix of types: behavioral (STAR method), technical, situational, general
4. Provide sample answers personalized to the candidate's background
5. Include tips for answering each question effectively

## Output Format
Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "role": "The job title from the JD",
  "questions": [
    {
      "question": "Tell me about a time you...",
      "type": "behavioral",
      "difficulty": "medium",
      "sampleAnswer": "A detailed sample answer using the candidate's actual experience...",
      "tips": "Use the STAR method. Focus on quantifiable results."
    }
  ]
}

Rules:
- Generate exactly 10 questions
- Mix of types: 3 behavioral, 3 technical, 2 situational, 2 general
- Sample answers should reference the candidate's ACTUAL experience and skills
- Difficulty should vary: 3 easy, 4 medium, 3 hard
- Tips should be concise and actionable`;

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
    console.error("Interview prep error:", error);
    const message = error instanceof Error ? error.message : "";
    if (message.includes("429") || message.includes("quota")) {
      return Response.json(
        { error: "API rate limit reached. Please wait a minute and try again, or check your Gemini API billing." },
        { status: 429 }
      );
    }
    return Response.json(
      { error: "Failed to generate interview questions. Please try again." },
      { status: 500 }
    );
  }
}
