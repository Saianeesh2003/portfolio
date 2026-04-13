# Social Media Studio

A studio where you turn a rough idea into a polished, ready-to-post social media creative — built for Cuemath's brand problem.

## What it does

- **Input**: Type a rough idea in plain English  
- **Formats**: Instagram Post (1:1), Story (9:16), Carousel (multi-slide)  
- **AI Content**: GPT-4o structures each slide with hook → build → takeaway storytelling  
- **AI Visuals**: DALL·E 3 generates thumb-stopping illustrations for every slide  
- **Edit**: Click any text on a slide to edit it inline  
- **Per-slide regenerate**: Regenerate copy or visuals for a single slide  
- **Brand settings**: Color palettes, custom colors, fonts, and tone  
- **Export**: Download every slide as a PNG  

## Tech Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS  
- **OpenAI** — GPT-4o for content, DALL·E 3 for images (server-side API routes only)  
- **html2canvas** for PNG export  

## Setup

1. Clone the repo  
2. `npm install`  
3. Copy `.env.example` to `.env.local` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-...
   ```
4. `npm run dev` → open http://localhost:3000

## Deploy (Vercel)

```bash
npx vercel --prod
```

Set `OPENAI_API_KEY` in the Vercel dashboard under Environment Variables. It stays server-side — never exposed to the browser.

## Security

- API keys are only used in Next.js API routes (server-side), never in client-side code  
- `.env.local` is gitignored  
- No credentials appear in the browser bundle  
