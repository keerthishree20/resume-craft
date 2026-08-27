import { NextRequest } from "next/server";
import { model } from "@/lib/gemini";
import type { UserProfile } from "@/lib/types";

export async function POST(request: NextRequest) {
  const { profile, targetRole } = (await request.json()) as {
    profile: UserProfile;
    targetRole: string;
  };

  if (!profile) {
    return Response.json(
      { error: "Profile is required" },
      { status: 400 }
    );
  }

  const prompt = `You are a LinkedIn optimization expert who has helped thousands of professionals increase their profile visibility and get recruited. Generate an optimized LinkedIn profile based on the candidate's information.

## Candidate Profile
- Name: ${profile.personalInfo.fullName}
- Current Summary: ${profile.personalInfo.summary}
- Skills: ${profile.skills.join(", ")}
- Experience: ${profile.experience.map((e) => `${e.role} at ${e.company} (${e.startDate} - ${e.current ? "Present" : e.endDate}): ${e.description}`).join("\n")}
- Education: ${profile.education.map((e) => `${e.degree} in ${e.field} from ${e.institution}`).join("\n")}
- Projects: ${profile.projects.map((p) => `${p.name}: ${p.description} (${p.techStack})`).join("\n")}
${targetRole ? `- Target Role: ${targetRole}` : ""}

## Generate:

### 1. LinkedIn Headlines (3 options)
- Under 220 characters each
- Include keywords recruiters search for
- Mix of: achievement-focused, role-focused, and value-proposition

### 2. About Section
- 1500-2000 characters
- Hook in first 2 lines (visible before "see more")
- Include: what you do, key achievements, what you're looking for
- Use line breaks for readability
- End with a call-to-action

### 3. Experience Bullets (for each role)
- Rewrite experience descriptions as achievement-focused bullets
- Start with action verbs
- Include metrics/numbers where possible
- Optimized for LinkedIn search

### 4. Skills to Add
- Top 15 LinkedIn skills to add (ordered by recruiter search volume relevance)

### 5. Post Ideas
- 3 LinkedIn post ideas the candidate could write to boost visibility

## Output Format
Return ONLY valid JSON (no markdown, no code fences):
{
  "headlines": [
    "Headline option 1",
    "Headline option 2",
    "Headline option 3"
  ],
  "about": "Full about section text with \\n for line breaks",
  "experience": [
    {
      "company": "Company Name",
      "role": "Role Title",
      "bullets": ["Achievement bullet 1", "Achievement bullet 2", "Achievement bullet 3"]
    }
  ],
  "skillsToAdd": ["Skill 1", "Skill 2", "..."],
  "postIdeas": [
    {
      "hook": "First line of the post (the hook)",
      "topic": "What the post is about",
      "angle": "The unique angle or value"
    }
  ],
  "profileTips": [
    "Tip 1 for improving their LinkedIn presence",
    "Tip 2",
    "Tip 3"
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
    console.error("LinkedIn optimize error:", error);
    const message = error instanceof Error ? error.message : "";
    if (message.includes("429") || message.includes("quota")) {
      return Response.json(
        { error: "API rate limit reached. Please wait a minute and try again." },
        { status: 429 }
      );
    }
    return Response.json(
      { error: "Failed to optimize LinkedIn profile. Please try again." },
      { status: 500 }
    );
  }
}
