export const runtime = "nodejs"

import { streamText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(req: Request) {
  try {
    let body: any = null
    try {
      body = await req.json()
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const { message, concepts, userId } = body || {}
    if (!message || typeof message !== "string") {
      return Response.json({ error: "Missing 'message' string" }, { status: 400 })
    }

    const conceptContext =
      concepts && Array.isArray(concepts) && concepts.length > 0
        ? `\n\nUser's current concepts:\n${concepts
            .map(
              (c: any) =>
                `- ${c?.title ?? "Untitled"} (${c?.status ?? "pending"}, ${c?.priority ?? "medium"} priority, category: ${
                  c?.category ?? "General"
                })`,
            )
            .join("\n")}`
        : "\n\nUser has no concepts yet."

    const result = await streamText({
      model: groq("llama-3.1-8b-instant"),
      system: `You are MCT Assistant, a helpful AI assistant for the Micro Concept Tracker app. You help users:

1. Organize and prioritize concepts
2. Productivity advice
3. Concept creation suggestions
4. Status management guidance
5. Priority setting
6. Category organization

Available categories: Work, Personal, Learning, Health, Finance, Creative, Technology, Business

Guidelines:
- Keep responses concise (2-3 sentences)
- Be encouraging
- When suggesting concept creation, include a title, category, and priority
- Reference user's existing concepts when relevant
- Focus on actionable advice

${conceptContext}`,
      prompt: message,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return Response.json({ error: "Failed to process message" }, { status: 500 })
  }
}
