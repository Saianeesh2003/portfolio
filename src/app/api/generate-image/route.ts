import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured on the server." }, { status: 500 });
  }
  const openai = new OpenAI({ apiKey });
  try {
    const { imagePrompt } = await req.json();

    if (!imagePrompt || imagePrompt.trim().length === 0) {
      return NextResponse.json({ error: "Image prompt is required" }, { status: 400 });
    }

    const enhancedPrompt = `${imagePrompt}. Style: clean minimalist flat illustration, vibrant educational colors, no text or letters in the image, suitable for social media, high quality, digital art.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const url = (response.data ?? [])[0]?.url;
    if (!url) throw new Error("No image URL returned");

    return NextResponse.json({ url });
  } catch (err: unknown) {
    console.error("Image generation error:", err);
    const message = err instanceof Error ? err.message : "Image generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
