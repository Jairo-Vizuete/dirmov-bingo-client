'use client';

import { MyCard, BingoNumber } from '../store/bingoStore';
import { getPattern } from '../lib/alphabet-patterns';

interface BingoCardGridProps {
  card: MyCard;
  onToggleCell?: (row: number, col: number) => void;
  disabled?: boolean;
  drawnNumbers?: BingoNumber[];
  selectedLetter?: string | null;
}

export function BingoCardGrid({
  card,
  onToggleCell,
  disabled,
  drawnNumbers = [],
  selectedLetter,
}: BingoCardGridProps) {
  // Obtener el patrón de la letra seleccionada
  const pattern = getPattern(selectedLetter || null);

  // Función helper para verificar si un valor está en los números dibujados
  const isDrawn = (value: number | null): boolean => {
    if (value === null) return false;
    return drawnNumbers.some((n) => n.value === value);
  };

  return (
    <div className="flex justify-center w-full overflow-x-auto px-2">
      <div className="inline-flex flex-col gap-1 sm:gap-2 bg-slate-100 p-2 sm:p-3 rounded-lg border border-slate-300 shadow-md min-w-0">
        <div className="grid grid-cols-5 gap-1 sm:gap-2 mb-1">
          {['B', 'I', 'N', 'G', 'O'].map((letter) => (
            <div
              key={letter}
              className="w-12 h-6 sm:w-16 sm:h-10 flex items-center justify-center text-sm sm:text-lg font-bold text-emerald-600"
            >
              {letter}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-1 sm:gap-2">
          {card.numbers.map((row, rowIndex) =>
            row.map((value, colIndex) => {
              const isCenter = rowIndex === 2 && colIndex === 2;
              const isMarked = card.marked[rowIndex][colIndex] || isCenter;
              const label = isCenter ? 'FREE' : value ?? '';
              const hasDrawnEffect = isDrawn(value);
              
              // Verificar si esta celda forma parte del patrón de la letra seleccionada
              const isPatternCell = pattern && pattern[rowIndex][colIndex];
              
              // Aplicar resaltado sutil solo si:
              // - Es parte del patrón
              // - No está marcada
              // (Mantener el resaltado incluso si el número fue dibujado)
              const hasPatternHighlight = isPatternCell && !isMarked;

              const handleClick = () => {
                if (disabled || !onToggleCell || isCenter) return;
                onToggleCell(rowIndex, colIndex);
              };

              // Contenedor externo: si el número fue sacado, muestra el anillo animado
              const outerClasses = hasDrawnEffect
                ? 'relative w-12 h-12 sm:w-16 sm:h-16 rounded-md p-[2px] sm:p-[3px] bg-transparent animate-rotating-border'
                : 'relative w-12 h-12 sm:w-16 sm:h-16 rounded-md p-[2px] sm:p-[3px] bg-transparent';

              return (
                <div key={`${rowIndex}-${colIndex}`} className={outerClasses}>
                  {hasDrawnEffect && (
                    <div className="absolute inset-0 rounded-md animate-rotating-gradient opacity-70 pointer-events-none" />
                  )}
                  <button
                    type="button"
                    onClick={handleClick}
                    className={[
                      'relative w-full h-full flex items-center justify-center text-xs sm:text-base font-semibold rounded-md border transition-colors z-10',
                      isCenter
                        ? 'bg-amber-100 text-amber-800 border-amber-400 shadow-md font-bold'
                        : isMarked
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
                        : hasPatternHighlight
                        ? 'bg-gradient-to-br from-green-100 to-emerald-200 text-slate-900 border-green-400 border-dashed'
                        : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-50 hover:border-emerald-400',
                      disabled && !isMarked ? 'opacity-70 cursor-default' : '',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                </div>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}


