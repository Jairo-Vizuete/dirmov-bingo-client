'use client';

import { useEffect, useState, useMemo } from 'react';

interface BingoBallProps {
  letter: string;
  value: number;
  key?: string | number;
}

// Paleta de colores vibrantes para las bolitas de bingo
const BALL_COLORS = [
  { from: 'from-red-400', via: 'via-red-500', to: 'to-red-600' },
  { from: 'from-blue-400', via: 'via-blue-500', to: 'to-blue-600' },
  { from: 'from-yellow-400', via: 'via-yellow-500', to: 'to-yellow-600' },
  { from: 'from-green-400', via: 'via-green-500', to: 'to-green-600' },
  { from: 'from-purple-400', via: 'via-purple-500', to: 'to-purple-600' },
  { from: 'from-pink-400', via: 'via-pink-500', to: 'to-pink-600' },
  { from: 'from-orange-400', via: 'via-orange-500', to: 'to-orange-600' },
  { from: 'from-cyan-400', via: 'via-cyan-500', to: 'to-cyan-600' },
  { from: 'from-indigo-400', via: 'via-indigo-500', to: 'to-indigo-600' },
  { from: 'from-emerald-400', via: 'via-emerald-500', to: 'to-emerald-600' },
];

export function BingoBall({ letter, value }: BingoBallProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Generar color aleatorio basado en el valor y letra para que sea consistente
  // pero diferente para cada combinación única
  const ballColor = useMemo(() => {
    const seed = `${letter}-${value}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % BALL_COLORS.length;
    return BALL_COLORS[index];
  }, [letter, value]);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [letter, value]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`
          relative w-24 h-24 rounded-full
          bg-gradient-to-br ${ballColor.from} ${ballColor.via} ${ballColor.to}
          shadow-[0_8px_16px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(255,255,255,0.3)]
          flex items-center justify-center
          transition-all duration-300
          ${isAnimating ? 'animate-bounce-in' : ''}
        `}
      >
        {/* Brillo superior para efecto 3D */}
        <div className="absolute top-2 left-4 w-8 h-8 rounded-full bg-white/20 blur-sm" />
        
        {/* Contenido: número arriba (más pequeño), letra abajo (más grande) */}
        <div className="relative z-10 text-center flex flex-col items-center justify-center">
          <div className="text-xl font-black text-slate-950 leading-none mb-1">
            {value}
          </div>
          <div className="text-4xl font-black text-slate-950 leading-none">
            {letter}
          </div>
        </div>
      </div>
    </div>
  );
}

