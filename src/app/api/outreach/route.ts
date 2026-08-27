import { NextRequest } from "next/server";
import { model } from "@/lib/gemini";
import type { UserProfile } from "@/lib/types";

export async function POST(request: NextRequest) {
  const { profile, jobDescription, recipientRole } = (await request.json()) as {
    profile: UserProfile;
    jobDescription: string;
    recipientRole: string;
  };

  if (!profile || !jobDescription) {
    return Response.json(
      { error: "Profile and job description are required" },
      { status: 400 }
    );
  }

  const prompt = `You are an expert networking and cold outreach specialist. Generate professional outreach messages for a job applicant to send to people at their target company.

## Candidate
- Name: ${profile.personalInfo.fullName}
- Role seeking: Based on the JD below
- Key skills: ${profile.skills.join(", ")}
- Current/recent experience: ${profile.experience[0] ? `${profile.experience[0].role} at ${profile.experience[0].company}` : "N/A"}

## Target Job Description
${jobDescription}

## Recipient Role
${recipientRole || "Hiring Manager"}

## Generate 4 outreach messages:
1. **LinkedIn Connection Request** (300 char limit, brief and personal)
2. **LinkedIn Follow-up Message** (after connecting, express interest in the role)
3. **Cold Email to Hiring Manager** (professional, concise, showing genuine interest and value)
4. **Referral Request** (to someone who works at the company, asking for an internal referral)

## Output Format
Return ONLY valid JSON (no markdown, no code fences):
{
  "messages": [
    {
      "type": "LinkedIn Connection Request",
      "subject": "",
      "body": "Hi [Name], I noticed your team at [Company] is hiring for...",
      "tips": "Keep it under 300 chars. Mention something specific about their work.",
      "charCount": 180
    },
    {
      "type": "LinkedIn Follow-up",
      "subject": "",
      "body": "Thanks for connecting! I saw the [Role] opening...",
      "tips": "Send within 24 hours of connecting. Reference something from their profile.",
      "charCount": 500
    },
    {
      "type": "Cold Email",
      "subject": "Experienced [Role] interested in [Company]'s mission",
      "body": "Dear [Hiring Manager],\\n\\n...",
      "tips": "Keep under 150 words. Lead with value, not need.",
      "charCount": 800
    },
    {
      "type": "Referral Request",
      "subject": "Quick question about [Company]",
      "body": "Hi [Name],\\n\\nI hope this message finds you well...",
      "tips": "Make it easy for them to forward your info. Include a brief summary of your fit.",
      "charCount": 600
    }
  ]
}

Rules:
- Use [Name], [Company], [Role] as placeholders where appropriate
- Messages should feel genuine, not templated
- Reference specific details from the JD to show research
- Each message should have a different angle/approach
- Include actionable tips for each message`;

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
    console.error("Outreach error:", error);
    const message = error instanceof Error ? error.message : "";
    if (message.includes("429") || message.includes("quota")) {
      return Response.json(
        { error: "API rate limit reached. Please wait a minute and try again." },
        { status: 429 }
      );
    }
    return Response.json(
      { error: "Failed to generate outreach messages. Please try again." },
      { status: 500 }
    );
  }
}
