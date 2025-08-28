import { streamText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(req: Request) {
  try {
    const { message, concepts, userId } = await req.json()

    const conceptContext =
      concepts && concepts.length > 0
        ? `\n\nUser's current concepts:\n${concepts
            .map((c: any) => `- ${c.title} (${c.status}, ${c.priority} priority, category: ${c.category})`)
            .join("\n")}`
        : "\n\nUser has no concepts yet."

    const result = await streamText({
      model: groq("llama-3.1-8b-instant"),
      system: `You are MCT Assistant, a helpful AI assistant for the Micro Concept Tracker app. You help users:

1. **Organize and prioritize concepts**: Help break down complex ideas into manageable micro-concepts
2. **Productivity advice**: Provide time management tips and workflow optimization
3. **Concept creation**: Suggest new concepts based on user needs and goals
4. **Status management**: Help users understand when to move concepts between pending, in-progress, and completed
5. **Priority setting**: Guide users on setting appropriate priorities (low, medium, high, urgent)
6. **Category organization**: Suggest relevant categories for better concept organization

**Available categories**: Work, Personal, Learning, Health, Finance, Creative, Technology, Business

**Guidelines**:
- Keep responses concise but helpful (2-3 sentences max unless asked for detail)
- Be encouraging and supportive
- When suggesting concept creation, be specific about title, category, and priority
- Reference user's existing concepts when relevant
- Focus on actionable advice

${conceptContext}`,
      prompt: message,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return Response.json({ error: "Failed to process message" }, { status: 500 })
  }
}
