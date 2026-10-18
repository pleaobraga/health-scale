export interface PaletteColor {
  hex: string;
  name: string;
  tailwindClass: string;
}

export const TAILWIND_PALETTE: PaletteColor[] = [
  // 1. Tons Primários Vibrantes (Destaque imediato)
  { hex: '#1d4ed8', name: 'Azul Royal', tailwindClass: 'bg-blue-700' },
  { hex: '#059669', name: 'Verde Esmeralda', tailwindClass: 'bg-emerald-600' },
  { hex: '#ea580c', name: 'Laranja Fogo', tailwindClass: 'bg-orange-600' },
  { hex: '#7c3aed', name: 'Roxo Imperial', tailwindClass: 'bg-violet-600' },
  { hex: '#dc2626', name: 'Vermelho Carmim', tailwindClass: 'bg-red-600' },
  { hex: '#0f766e', name: 'Azul Petróleo', tailwindClass: 'bg-teal-700' },
  { hex: '#c026d3', name: 'Magenta Vibrante', tailwindClass: 'bg-fuchsia-600' },
  { hex: '#ca8a04', name: 'Amarelo Ouro', tailwindClass: 'bg-yellow-600' },

  // 2. Tons de Amarelo, Dourado & Âmbar
  { hex: '#eab308', name: 'Amarelo Canário', tailwindClass: 'bg-yellow-500' },
  { hex: '#a16207', name: 'Amarelo Mostarda', tailwindClass: 'bg-yellow-700' },
  { hex: '#854d0e', name: 'Amarelo Ocre Escuro', tailwindClass: 'bg-yellow-800' },
  { hex: '#d97706', name: 'Âmbar Dourado', tailwindClass: 'bg-amber-600' },
  { hex: '#b45309', name: 'Mostarda Queimada', tailwindClass: 'bg-amber-700' },

  // 3. Tons Secundários & Saturados
  { hex: '#0284c7', name: 'Azul Oceano', tailwindClass: 'bg-sky-600' },
  { hex: '#4d7c0f', name: 'Verde Oliva', tailwindClass: 'bg-lime-700' },
  { hex: '#9a3412', name: 'Terracota Queimada', tailwindClass: 'bg-orange-800' },
  { hex: '#4f46e5', name: 'Índigo Elétrico', tailwindClass: 'bg-indigo-600' },
  { hex: '#be123c', name: 'Rosa Coral Escuro', tailwindClass: 'bg-rose-700' },
  { hex: '#6d28d9', name: 'Púrpura Profunda', tailwindClass: 'bg-violet-700' },
  { hex: '#0d9488', name: 'Verde Água Escuro', tailwindClass: 'bg-teal-600' },

  // 4. Tons Nobres & Intensos (Alto Contraste)
  { hex: '#1e40af', name: 'Azul Cobalto Profundo', tailwindClass: 'bg-blue-800' },
  { hex: '#047857', name: 'Verde Floresta', tailwindClass: 'bg-emerald-700' },
  { hex: '#c2410c', name: 'Laranja Queimado', tailwindClass: 'bg-orange-700' },
  { hex: '#3730a3', name: 'Índigo Real', tailwindClass: 'bg-indigo-800' },
  { hex: '#991b1b', name: 'Vinho Bordô', tailwindClass: 'bg-red-800' },
  { hex: '#115e59', name: 'Petróleo Noturno', tailwindClass: 'bg-teal-800' },
  { hex: '#9d174d', name: 'Framboesa Intensa', tailwindClass: 'bg-pink-800' },
  { hex: '#78350f', name: 'Chocolate Café', tailwindClass: 'bg-amber-900' },

  // 5. Tons Escuros de Máximo Contraste
  { hex: '#1e3a8a', name: 'Azul Marinho Meia-Noite', tailwindClass: 'bg-blue-900' },
  { hex: '#064e3b', name: 'Verde Pinheiro Escuro', tailwindClass: 'bg-emerald-900' },
  { hex: '#7c2d12', name: 'Mogno / Canela', tailwindClass: 'bg-orange-900' },
  { hex: '#581c87', name: 'Ameixa Noturna', tailwindClass: 'bg-purple-900' },
  { hex: '#881337', name: 'Cereja Bordeaux', tailwindClass: 'bg-rose-900' },
  { hex: '#334155', name: 'Grafite Chumbo', tailwindClass: 'bg-slate-700' },
  { hex: '#1e293b', name: 'Aço Escuro', tailwindClass: 'bg-slate-800' },
  { hex: '#0f172a', name: 'Preto Ônix', tailwindClass: 'bg-slate-900' },
];

export const DEFAULT_PERSON_COLORS = [
  '#1d4ed8', // 1. Azul Royal
  '#059669', // 2. Verde Esmeralda
  '#ea580c', // 3. Laranja Fogo
  '#ca8a04', // 4. Amarelo Ouro
  '#7c3aed', // 5. Roxo Imperial
  '#dc2626', // 6. Vermelho Carmim
  '#0f766e', // 7. Azul Petróleo
  '#c026d3', // 8. Magenta Vibrante
  '#78350f', // 9. Chocolate Café
  '#1e293b', // 10. Aço Escuro
];
