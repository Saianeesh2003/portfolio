"use client";

import React, { useState, useRef, useCallback } from "react";
import { Slide, Format, BrandConfig, GenerateResponse, DEFAULT_BRAND } from "@/types/studio";
import { SlideCard } from "@/components/SlideCard";
import { BrandPanel } from "@/components/BrandPanel";

const FORMAT_OPTIONS: { value: Format; label: string; icon: string; desc: string }[] = [
  { value: "post", label: "Post", icon: "⬜", desc: "1:1 · Single image" },
  { value: "story", label: "Story", icon: "📱", desc: "9:16 · Vertical" },
  { value: "carousel", label: "Carousel", icon: "🎠", desc: "Multi-slide" },
];

const EXAMPLE_PROMPTS = [
  "Carousel for parents about why kids forget what they learn — explain the forgetting curve — end with how spaced repetition fixes it",
  "Instagram post about the importance of mistakes in learning — growth mindset for kids",
  "Story showing 5 signs your child has strong number sense",
  "Carousel: What great math education looks like — 3 myths vs reality",
];

export default function StudioPage() {
  const [prompt, setPrompt] = useState("");
  const [format, setFormat] = useState<Format>("carousel");
  const [slideCount, setSlideCount] = useState(6);
  const [brand, setBrand] = useState<BrandConfig>(DEFAULT_BRAND);
  const [showBrandPanel, setShowBrandPanel] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingImageIds, setGeneratingImageIds] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [generateImages, setGenerateImages] = useState(true);

  const previewRef = useRef<HTMLDivElement>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    setResult(null);
    setSlides([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, format, brand, slideCount: format === "carousel" ? slideCount : 1 }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Generation failed");
      }
      const data: GenerateResponse = await res.json();
      setResult(data);
      setSlides(data.slides);

      // Generate images for each slide in parallel
      if (generateImages) {
        data.slides.forEach((slide) => {
          generateImageForSlide(slide.id, slide.imagePrompt);
        });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, format, brand, slideCount, generateImages]);

  const generateImageForSlide = useCallback(async (slideId: string, imagePrompt: string) => {
    setGeneratingImageIds((prev) => new Set([...prev, slideId]));
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagePrompt }),
      });
      if (res.ok) {
        const { url } = await res.json();
        setSlides((prev) =>
          prev.map((s) => (s.id === slideId ? { ...s, imageUrl: url } : s))
        );
      }
    } catch {
      // Image generation failed silently — gradient fallback is shown
    } finally {
      setGeneratingImageIds((prev) => {
        const next = new Set(prev);
        next.delete(slideId);
        return next;
      });
    }
  }, []);

  const handleRegenerateSlide = useCallback(async (slideId: string) => {
    const slide = slides.find((s) => s.id === slideId);
    if (!slide) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Regenerate only the "${slide.type}" slide for this topic: ${prompt}. Make it different from before.`,
          format,
          brand,
          slideCount: 1,
        }),
      });
      if (res.ok) {
        const data: GenerateResponse = await res.json();
        if (data.slides[0]) {
          const newSlide = { ...data.slides[0], id: slideId, imageUrl: undefined };
          setSlides((prev) => prev.map((s) => (s.id === slideId ? newSlide : s)));
          if (generateImages) {
            generateImageForSlide(slideId, newSlide.imagePrompt);
          }
        }
      }
    } finally {
      setIsGenerating(false);
    }
  }, [slides, prompt, format, brand, generateImages, generateImageForSlide]);

  const handleEditSlide = useCallback((id: string, field: "headline" | "subtext", value: string) => {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }, []);

  const handleExport = useCallback(async () => {
    if (slides.length === 0) return;
    setIsExporting(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const slideEls = previewRef.current?.querySelectorAll("[data-slide-id]");
      if (!slideEls || slideEls.length === 0) return;

      for (let i = 0; i < slideEls.length; i++) {
        const el = slideEls[i] as HTMLElement;
        const canvas = await html2canvas(el, {
          useCORS: true,
          allowTaint: true,
          scale: 2,
          backgroundColor: null,
        });
        const link = document.createElement("a");
        link.download = `slide-${i + 1}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    } finally {
      setIsExporting(false);
    }
  }, [slides]);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-[var(--font-inter)]">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">
              S
            </div>
            <div>
              <h1 className="text-sm font-bold">Social Media Studio</h1>
              <p className="text-[10px] text-slate-400">Idea → Ready-to-post creative</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {slides.length > 0 && (
              <>
                <button
                  onClick={() => setIsEditing((v) => !v)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                    isEditing
                      ? "border-indigo-400 bg-indigo-500/20 text-indigo-300"
                      : "border-slate-600 text-slate-400 hover:border-slate-400"
                  }`}
                >
                  {isEditing ? "✏️ Editing" : "✏️ Edit"}
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                >
                  {isExporting ? (
                    <span>Exporting…</span>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export PNG
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Left panel — inputs */}
        <div className="w-80 flex-shrink-0 space-y-4">
          {/* Prompt */}
          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Your Idea
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-3 py-3 text-sm text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Describe your social media idea in plain English… e.g. Carousel for parents about why kids forget what they learn"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {EXAMPLE_PROMPTS.slice(0, 2).map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(p)}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded-md transition truncate max-w-full"
                  title={p}
                >
                  {p.length > 45 ? p.slice(0, 45) + "…" : p}
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Format
            </label>
            <div className="space-y-2">
              {FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFormat(opt.value)}
                  className={`w-full text-left p-3 rounded-xl border transition flex items-center gap-3 ${
                    format === opt.value
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-slate-600 hover:border-slate-500"
                  }`}
                >
                  <span className="text-xl">{opt.icon}</span>
                  <div>
                    <div className="text-sm font-semibold">{opt.label}</div>
                    <div className="text-[11px] text-slate-400">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {format === "carousel" && (
              <div className="mt-3">
                <label className="block text-xs text-slate-400 mb-1.5">
                  Number of slides: <span className="text-white font-bold">{slideCount}</span>
                </label>
                <input
                  type="range"
                  min={3}
                  max={10}
                  value={slideCount}
                  onChange={(e) => setSlideCount(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>3</span><span>10</span>
                </div>
              </div>
            )}
          </div>

          {/* Image generation toggle */}
          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">AI Visuals</div>
                <div className="text-[11px] text-slate-400">Generate images with DALL·E 3</div>
              </div>
              <button
                onClick={() => setGenerateImages((v) => !v)}
                className={`relative w-10 h-6 rounded-full transition-colors ${
                  generateImages ? "bg-indigo-600" : "bg-slate-600"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    generateImages ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            {generateImages && (
              <p className="text-[10px] text-slate-500 mt-2">
                Uses OpenAI DALL·E 3. Requires OPENAI_API_KEY with image permissions.
              </p>
            )}
          </div>

          {/* Brand */}
          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <button
              onClick={() => setShowBrandPanel((v) => !v)}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <div className="text-sm font-semibold">Brand Settings</div>
                <div className="text-[11px] text-slate-400">Colors, fonts, tone</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: brand.primaryColor }} />
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: brand.accentColor }} />
                </div>
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform ${showBrandPanel ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {showBrandPanel && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <BrandPanel brand={brand} onChange={setBrand} />
              </div>
            )}
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-500/20"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Creative
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-xl p-3 text-sm text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Right panel — preview */}
        <div className="flex-1 min-w-0">
          {slides.length === 0 && !isGenerating && (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center gap-6">
              <div className="text-6xl">✨</div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Ready to create?</h2>
                <p className="text-slate-400 max-w-sm">
                  Type your idea on the left, choose a format, and hit Generate to create beautiful social media content.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                {EXAMPLE_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(p)}
                    className="text-left p-3 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-sm text-slate-300 transition"
                  >
                    {p.length > 80 ? p.slice(0, 80) + "…" : p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isGenerating && slides.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] gap-4">
              <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Crafting your creative…</p>
            </div>
          )}

          {slides.length > 0 && (
            <div>
              {result && (
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold">{result.title}</h2>
                    <p className="text-sm text-slate-400">
                      {slides.length} slide{slides.length !== 1 ? "s" : ""} · {result.format}
                      {isEditing && (
                        <span className="ml-2 text-indigo-400">Click text on slides to edit</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="text-xs text-slate-400 hover:text-white border border-slate-600 hover:border-slate-400 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate All
                  </button>
                </div>
              )}

              <div ref={previewRef} className="flex flex-wrap gap-6 justify-start">
                {slides.map((slide, i) => (
                  <SlideCard
                    key={slide.id}
                    slide={slide}
                    index={i}
                    total={slides.length}
                    format={format}
                    brand={brand}
                    isEditing={isEditing}
                    isGeneratingImage={generatingImageIds.has(slide.id)}
                    onEdit={handleEditSlide}
                    onRegenerateImage={(id) => {
                      const s = slides.find((sl) => sl.id === id);
                      if (s) generateImageForSlide(id, s.imagePrompt);
                    }}
                    onRegenerateSlide={handleRegenerateSlide}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
