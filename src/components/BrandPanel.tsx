"use client";

import React from "react";
import { BrandConfig, PALETTES } from "@/types/studio";

interface BrandPanelProps {
  brand: BrandConfig;
  onChange: (brand: BrandConfig) => void;
}

const FONTS = ["Inter", "Playfair Display", "Poppins", "Montserrat"];

export function BrandPanel({ brand, onChange }: BrandPanelProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Color Palette
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PALETTES.map((p) => (
            <button
              key={p.name}
              onClick={() =>
                onChange({ ...brand, primaryColor: p.primary, secondaryColor: p.secondary, accentColor: p.accent })
              }
              className={`p-2 rounded-xl border-2 transition text-left ${
                brand.primaryColor === p.primary
                  ? "border-white/60 shadow-lg scale-105"
                  : "border-transparent hover:border-white/30"
              }`}
            >
              <div className="flex gap-1 mb-1">
                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: p.primary }} />
                <div className="w-5 h-5 rounded-full border border-slate-600" style={{ backgroundColor: p.secondary }} />
                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: p.accent }} />
              </div>
              <span className="text-[10px] text-slate-300 leading-none">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Custom Colors
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(["primaryColor", "secondaryColor", "accentColor"] as const).map((key) => (
            <div key={key} className="flex flex-col items-center gap-1.5">
              <input
                type="color"
                value={brand[key]}
                onChange={(e) => onChange({ ...brand, [key]: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <span className="text-[10px] text-slate-400 capitalize">
                {key.replace("Color", "")}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Font
        </label>
        <div className="grid grid-cols-2 gap-2">
          {FONTS.map((f) => (
            <button
              key={f}
              onClick={() => onChange({ ...brand, fontFamily: f })}
              className={`py-2 px-3 rounded-lg text-sm border transition ${
                brand.fontFamily === f
                  ? "border-white/60 bg-white/10 text-white"
                  : "border-slate-600 text-slate-400 hover:border-white/30"
              }`}
              style={{ fontFamily: f }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Brand Tone
        </label>
        <textarea
          value={brand.tone}
          onChange={(e) => onChange({ ...brand, tone: e.target.value })}
          rows={2}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g. educational, warm, confident"
        />
      </div>
    </div>
  );
}
