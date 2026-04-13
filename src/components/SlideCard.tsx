"use client";

import React, { useRef } from "react";
import { Slide, Format, BrandConfig } from "@/types/studio";

interface SlideCardProps {
  slide: Slide;
  index: number;
  total: number;
  format: Format;
  brand: BrandConfig;
  isEditing: boolean;
  isGeneratingImage: boolean;
  onEdit: (id: string, field: "headline" | "subtext", value: string) => void;
  onRegenerateImage: (id: string) => void;
  onRegenerateSlide: (id: string) => void;
}

const FONT_MAP: Record<string, string> = {
  Inter: '"Inter", sans-serif',
  "Playfair Display": '"Playfair Display", serif',
  Poppins: '"Poppins", sans-serif',
  Montserrat: '"Montserrat", sans-serif',
};

export function SlideCard({
  slide,
  index,
  total,
  format,
  brand,
  isEditing,
  isGeneratingImage,
  onEdit,
  onRegenerateImage,
  onRegenerateSlide,
}: SlideCardProps) {
  const headlineRef = useRef<HTMLDivElement>(null);
  const subtextRef = useRef<HTMLDivElement>(null);

  const isStory = format === "story";
  const aspectRatio = isStory ? "9/16" : "1/1";
  const slideWidth = isStory ? 270 : 380;
  const slideHeight = isStory ? 480 : 380;

  const font = FONT_MAP[brand.fontFamily] || FONT_MAP["Inter"];

  const bgStyle = slide.imageUrl
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.55)), url(${slide.imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        background: `linear-gradient(135deg, ${brand.primaryColor} 0%, ${adjustColor(brand.primaryColor, -30)} 100%)`,
      };

  return (
    <div className="flex flex-col items-center gap-2 group">
      {/* Slide badge */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="bg-slate-700 px-2 py-0.5 rounded-full capitalize">{slide.type}</span>
        {total > 1 && (
          <span className="text-slate-500">
            {index + 1} / {total}
          </span>
        )}
      </div>

      {/* Slide canvas */}
      <div
        className="relative overflow-hidden rounded-2xl shadow-2xl select-none"
        style={{
          width: slideWidth,
          height: slideHeight,
          aspectRatio,
          fontFamily: font,
          ...bgStyle,
        }}
        data-slide-id={slide.id}
      >
        {/* Image loading overlay */}
        {isGeneratingImage && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-white text-xs">Generating visual…</span>
            </div>
          </div>
        )}

        {/* Slide number dot (carousel only) */}
        {total > 1 && (
          <div className="absolute top-4 right-4 flex gap-1 z-10">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: i === index ? brand.accentColor : "rgba(255,255,255,0.4)" }}
              />
            ))}
          </div>
        )}

        {/* Brand accent bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 z-10"
          style={{ backgroundColor: brand.accentColor }}
        />

        {/* Content */}
        <div
          className={`absolute inset-0 z-10 flex flex-col justify-center p-6 ${
            slide.layout === "left" ? "items-start text-left" : "items-center text-center"
          }`}
        >
          {/* Type indicator for hook */}
          {slide.type === "hook" && (
            <div
              className="text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
              style={{ backgroundColor: brand.accentColor, color: "#fff" }}
            >
              {index === 0 ? "Did you know?" : "Key insight"}
            </div>
          )}

          {/* Stat highlight */}
          {slide.type === "stat" && (
            <div
              className="text-6xl font-black mb-2"
              style={{ color: brand.accentColor, fontFamily: font }}
            >
              {extractStat(slide.headline)}
            </div>
          )}

          {/* Headline */}
          <div
            ref={headlineRef}
            contentEditable={isEditing}
            suppressContentEditableWarning
            className={`font-black leading-tight mb-3 text-white ${
              isStory ? "text-3xl" : slide.type === "stat" ? "text-lg" : "text-2xl"
            } ${isEditing ? "outline outline-2 outline-white/40 rounded px-1 cursor-text" : "cursor-default"}`}
            onBlur={(e) => {
              if (isEditing) onEdit(slide.id, "headline", e.currentTarget.textContent || "");
            }}
          >
            {slide.headline}
          </div>

          {/* Subtext */}
          <div
            ref={subtextRef}
            contentEditable={isEditing}
            suppressContentEditableWarning
            className={`text-white/80 leading-relaxed ${
              isStory ? "text-base" : "text-sm"
            } ${isEditing ? "outline outline-2 outline-white/40 rounded px-1 cursor-text" : "cursor-default"}`}
            onBlur={(e) => {
              if (isEditing) onEdit(slide.id, "subtext", e.currentTarget.textContent || "");
            }}
          >
            {slide.subtext}
          </div>

          {/* CTA button */}
          {slide.type === "cta" && (
            <button
              className="mt-5 px-6 py-2 rounded-full text-sm font-bold text-white shadow-lg"
              style={{ backgroundColor: brand.accentColor }}
            >
              Learn More →
            </button>
          )}
        </div>
      </div>

      {/* Slide actions */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onRegenerateImage(slide.id)}
          disabled={isGeneratingImage}
          className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition disabled:opacity-40"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          New Visual
        </button>
        <button
          onClick={() => onRegenerateSlide(slide.id)}
          className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Regenerate
        </button>
      </div>
    </div>
  );
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function extractStat(headline: string): string {
  const match = headline.match(/\d+[%xX]?/);
  return match ? match[0] : "✦";
}
