import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// gemini-2.0-flash was retired and every call returned 404. The model is a
// setting so the next retirement is an .env edit, not a code change.
export const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
});
