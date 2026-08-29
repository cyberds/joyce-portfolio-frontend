import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const HIGH_TRAFFIC_MESSAGE =
  "We're currently experiencing unusually high traffic and couldn't process your request right now. Please try again in a moment, or feel free to reach out directly to Joyce on [WhatsApp](https://wa.me/447436836888) (+44 7436 836888) or by email at [hello@joycewadawasina.com](mailto:hello@joycewadawasina.com).";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();

    // If API key is not configured, return polite fallback message
    if (!apiKey) {
      return NextResponse.json({
        reply: HIGH_TRAFFIC_MESSAGE,
      });
    }

    // Load knowledge base from public/llms.txt
    let knowledgeBase = "";
    try {
      const llmsPath = path.join(process.cwd(), "public", "llms.txt");
      knowledgeBase = await fs.promises.readFile(llmsPath, "utf-8");
    } catch {
      knowledgeBase = "";
    }

    const systemPrompt = `You are the official AI Assistant for Joyce Wadawasina's portfolio website.
Joyce Wadawasina is a premier AI & Business Automation Consultant with 10+ years across operations, 300+ businesses served, and 11,000+ hours of business time saved.

Here is your authoritative knowledge base about Joyce, her services, philosophy, 6-step customer pipeline, and case studies:
=== KNOWLEDGE BASE (llms.txt) ===
${knowledgeBase}
================================

GUIDELINES FOR YOUR RESPONSES:
1. Ground your answers strictly on the knowledge base provided above.
2. Tone: Warm, pragmatic, conversational, concise, professional, and clear (matching Joyce's style).
3. If a user asks how to start or contact Joyce, always provide her WhatsApp: [Message on WhatsApp](https://wa.me/447436836888) (+44 7436 836888) and Email: [hello@joycewadawasina.com](mailto:hello@joycewadawasina.com).
4. Use crisp markdown formatting (bullet points, bold highlights, markdown links). Keep responses concise and easy to read.
5. If the user asks something outside the scope of Joyce's services or operations automation, politely guide them back to what Joyce helps with.`;

    // Map conversation history to Gemini format
    const contents = [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\nPlease acknowledge and get ready to answer user queries.` }],
      },
      {
        role: "model",
        parts: [{ text: "Understood. I am Joyce's AI assistant, ready to assist users with accurate information from the knowledge base." }],
      },
      ...messages.map((m: { sender: string; text: string }) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      })),
    ];

    // Call Gemini API (using gemini-2.5-flash with fallback to gemini-1.5-flash)
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 600,
        },
      }),
    });

    if (!geminiRes.ok) {
      // If 429 rate limit or any other API failure, return polite traffic message
      console.warn("Gemini API error status:", geminiRes.status);
      return NextResponse.json({
        reply: HIGH_TRAFFIC_MESSAGE,
      });
    }

    const data = await geminiRes.json();
    const candidateText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!candidateText) {
      return NextResponse.json({
        reply: HIGH_TRAFFIC_MESSAGE,
      });
    }

    return NextResponse.json({ reply: candidateText });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      reply: HIGH_TRAFFIC_MESSAGE,
    });
  }
}
