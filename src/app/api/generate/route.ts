import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GenerateRequest, GenerateResponse, Slide } from "@/types/studio";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured on the server." }, { status: 500 });
  }
  const openai = new OpenAI({ apiKey });
  try {
    const body: GenerateRequest = await req.json();
    const { prompt, format, brand, slideCount } = body;

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const count = slideCount ?? (format === "carousel" ? 6 : 1);

    const systemPrompt = `You are a world-class social media content designer for an educational brand.
Brand tone: ${brand.tone}
You create stunning, engaging social media content that educates parents about children's learning.

Return ONLY valid JSON matching this exact schema:
{
  "title": "string — internal title for this creative",
  "slides": [
    {
      "type": "hook|content|stat|quote|cta",
      "headline": "string — short, punchy (max 10 words)",
      "subtext": "string — 1-2 sentences, conversational, educational (max 40 words)",
      "imagePrompt": "string — a vivid DALL-E image prompt describing a beautiful illustration or visual",
      "layout": "centered|left|split"
    }
  ]
}

Slide types:
- hook: Attention-grabbing opener, emotional hook, intriguing question or bold statement
- content: Explains a concept clearly, uses analogies, simple language
- stat: Features a striking statistic or data point (make it visually prominent)
- quote: An inspiring or thought-provoking quote relevant to the topic
- cta: Clear takeaway or call to action, empowering tone

Format guidance:
- post (1 slide): Single impactful message, strong visual, clear CTA
- story (1 slide): Vertical-friendly, bold text, quick consumption
- carousel (${count} slides): Hook → build → reveal → takeaway. Each slide must stand alone but flow together.

Image prompts should describe: minimalist flat illustrations, bright colors, educational theme, no text in images.`;

    const userPrompt = `Create a ${format} social media creative for this idea: "${prompt}"
${format === "carousel" ? `Make exactly ${count} slides following the hook-build-takeaway structure.` : "Make exactly 1 slide."}
Ensure the content is educational, parent-friendly, and builds genuine value.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const raw = completion.choices[0].message.content;
    if (!raw) throw new Error("No content from OpenAI");

    const parsed = JSON.parse(raw) as { title: string; slides: Omit<Slide, "id">[] };

    const result: GenerateResponse = {
      title: parsed.title,
      format,
      slides: parsed.slides.map((s) => ({ ...s, id: randomUUID() })),
    };

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Generate error:", err);
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
