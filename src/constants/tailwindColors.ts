export interface PaletteColor {
  hex: string;
  name: string;
  tailwindClass: string;
}

export const TAILWIND_PALETTE: PaletteColor[] = [
  // 500 variants
  { hex: '#ef4444', name: 'Red 500', tailwindClass: 'bg-red-500' },
  { hex: '#f97316', name: 'Orange 500', tailwindClass: 'bg-orange-500' },
  { hex: '#f59e0b', name: 'Amber 500', tailwindClass: 'bg-amber-500' },
  { hex: '#10b981', name: 'Emerald 500', tailwindClass: 'bg-emerald-500' },
  { hex: '#14b8a6', name: 'Teal 500', tailwindClass: 'bg-teal-500' },
  { hex: '#0ea5e9', name: 'Sky 500', tailwindClass: 'bg-sky-500' },
  { hex: '#3b82f6', name: 'Blue 500', tailwindClass: 'bg-blue-500' },
  { hex: '#6366f1', name: 'Indigo 500', tailwindClass: 'bg-indigo-500' },
  { hex: '#8b5cf6', name: 'Violet 500', tailwindClass: 'bg-violet-500' },
  { hex: '#a855f7', name: 'Purple 500', tailwindClass: 'bg-purple-500' },
  { hex: '#ec4899', name: 'Pink 500', tailwindClass: 'bg-pink-500' },
  { hex: '#f43f5e', name: 'Rose 500', tailwindClass: 'bg-rose-500' },

  // 600 variants
  { hex: '#dc2626', name: 'Red 600', tailwindClass: 'bg-red-600' },
  { hex: '#ea580c', name: 'Orange 600', tailwindClass: 'bg-orange-600' },
  { hex: '#d97706', name: 'Amber 600', tailwindClass: 'bg-amber-600' },
  { hex: '#059669', name: 'Emerald 600', tailwindClass: 'bg-emerald-600' },
  { hex: '#0d9488', name: 'Teal 600', tailwindClass: 'bg-teal-600' },
  { hex: '#0284c7', name: 'Sky 600', tailwindClass: 'bg-sky-600' },
  { hex: '#2563eb', name: 'Blue 600', tailwindClass: 'bg-blue-600' },
  { hex: '#4f46e5', name: 'Indigo 600', tailwindClass: 'bg-indigo-600' },
  { hex: '#7c3aed', name: 'Violet 600', tailwindClass: 'bg-violet-600' },
  { hex: '#9333ea', name: 'Purple 600', tailwindClass: 'bg-purple-600' },
  { hex: '#db2777', name: 'Pink 600', tailwindClass: 'bg-pink-600' },
  { hex: '#e11d48', name: 'Rose 600', tailwindClass: 'bg-rose-600' },
];

export const DEFAULT_PERSON_COLORS = [
  '#3b82f6', // Blue 500
  '#10b981', // Emerald 500
  '#8b5cf6', // Violet 500
  '#f97316', // Orange 500
  '#ec4899', // Pink 500
  '#0ea5e9', // Sky 500
];

