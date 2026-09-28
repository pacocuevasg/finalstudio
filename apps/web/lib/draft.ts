"use client";

// The MVP keeps the working draft (exercise, settings, storyboard) in the
// browser session until auth and the Supabase tables are wired to the UI.

import type { Storyboard } from "@finalstudio/core";

export type Settings = {
  level: "secundaria" | "prepa" | "universidad";
  language: "es-MX" | "es-ES";
  mode: "paso a paso" | "solo la idea clave" | "hazme uno parecido" | "error común";
  captions: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  level: "prepa",
  language: "es-MX",
  mode: "paso a paso",
  captions: true,
};

export type Draft = { exercise: string; settings: Settings; storyboard?: Storyboard; demo?: boolean };

const KEY = "finalstudio.draft";

export function loadDraft(): Draft | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

export function saveDraft(d: Draft) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(d));
  } catch {}
}
