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

  const prompt = `You are an expert career coach and skill gap analyst. Analyze the gap between a candidate's current skills and a job's requirements. Provide actionable learning recommendations with FREE resources.

## Candidate Profile
- Skills: ${profile.skills.join(", ")}
- Experience: ${profile.experience.map((e) => `${e.role} at ${e.company}: ${e.description}`).join("\n")}
- Education: ${profile.education.map((e) => `${e.degree} in ${e.field}`).join(", ")}

## Job Description
${jobDescription}

## Instructions
1. Extract ALL required and preferred skills/qualifications from the JD
2. Compare against the candidate's profile
3. Categorize each skill as: strong match, partial match, or gap
4. For each gap, recommend specific FREE learning resources (YouTube channels, courses on Coursera/edX free tier, official docs, GitHub repos)
5. Estimate realistic time to close each gap
6. Provide a priority ranking — which gaps to close first for maximum impact

## Output Format
Return ONLY valid JSON (no markdown, no code fences):
{
  "overallReadiness": 72,
  "strongMatches": [
    {"skill": "Python", "evidence": "Listed in skills + used at TechCorp"}
  ],
  "partialMatches": [
    {"skill": "AWS", "evidence": "Has cloud experience but not AWS specifically", "gap": "Needs hands-on AWS (EC2, S3, Lambda)"}
  ],
  "gaps": [
    {
      "skill": "Kubernetes",
      "importance": "high",
      "timeToLearn": "2-3 weeks",
      "resources": [
        {"name": "Kubernetes Official Tutorial", "type": "docs", "url": "https://kubernetes.io/docs/tutorials/"},
        {"name": "TechWorld with Nana - K8s Crash Course", "type": "youtube", "url": "https://youtube.com"},
        {"name": "Introduction to Kubernetes - edX", "type": "course", "url": "https://edx.org"}
      ],
      "actionPlan": "Start with official tutorials, then deploy a sample app on minikube"
    }
  ],
  "priorityOrder": ["Kubernetes", "CI/CD", "GraphQL"],
  "weeklyPlan": [
    {"week": 1, "focus": "Kubernetes basics", "goal": "Deploy a container on minikube"},
    {"week": 2, "focus": "CI/CD with GitHub Actions", "goal": "Set up a pipeline for a sample project"},
    {"week": 3, "focus": "GraphQL fundamentals", "goal": "Build a simple GraphQL API"}
  ]
}

Rules:
- Be specific with resource recommendations — real, popular, free resources
- URLs should point to real domains (youtube.com, coursera.org, edx.org, freecodecamp.org, etc.) but you can use generic paths
- importance: "high" (required in JD), "medium" (preferred), "low" (nice to have)
- timeToLearn: realistic estimates for someone with existing tech background
- weeklyPlan: 2-4 weeks max, actionable goals`;

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
    console.error("Skill gap error:", error);
    const message = error instanceof Error ? error.message : "";
    if (message.includes("429") || message.includes("quota")) {
      return Response.json(
        { error: "API rate limit reached. Please wait a minute and try again." },
        { status: 429 }
      );
    }
    return Response.json(
      { error: "Failed to analyze skill gaps. Please try again." },
      { status: 500 }
    );
  }
}
