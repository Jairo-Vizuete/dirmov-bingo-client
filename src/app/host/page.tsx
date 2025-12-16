'use client';

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useBingoStore } from "../../store/bingoStore";
import { BingoBall } from "../../components/BingoBall";

export default function HostPage() {
  const [localName, setLocalName] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const {
    connectAsHost,
    roomState,
    connectionState,
    startGame,
    drawNumber,
    lastNumber,
    bingoResult,
    restartGame,
    endGame,
  } = useBingoStore();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!localName.trim()) return;
    connectAsHost(localName.trim());
  };

  const isHostReady = !!roomState?.hostName;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 p-4 pb-16">
      <div className="w-full max-w-xl space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Sala del Anfitrión</h1>
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-900 hover:underline">
            Volver
          </Link>
        </header>

        {!isHostReady && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 p-4 rounded-lg bg-white border border-slate-200 shadow-md"
          >
            <label className="block text-sm font-medium text-slate-700">
              Nombre del anfitrión
            </label>
            <input
              className="w-full px-3 py-2 rounded-md bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder="Escribe tu nombre"
            />
            <button
              type="submit"
              disabled={!localName.trim()}
              className="w-full py-2 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed disabled:hover:bg-slate-300 shadow-md hover:shadow-lg"
            >
              Crear sala
            </button>
          </form>
        )}

        {isHostReady && (
          <div className="space-y-4">
            <section className="p-4 rounded-lg bg-white border border-slate-200 shadow-md space-y-2">
              <p className="text-sm text-slate-600">
                Sala: <span className="font-semibold text-slate-900">{roomState?.id}</span>
              </p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Anfitrión:{" "}
                  <span className="font-semibold text-slate-900">{roomState?.hostName}</span>
                </p>
                {roomState?.state && (
                  <span
                    className={[
                      "px-2 py-1 rounded-full text-xs font-semibold uppercase",
                      roomState.state === "waiting" &&
                        "bg-amber-100 text-amber-800 border border-amber-200",
                      roomState.state === "playing" &&
                        "bg-emerald-100 text-emerald-800 border border-emerald-200",
                      roomState.state === "finished" &&
                        "bg-slate-100 text-slate-700 border border-slate-200",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {roomState.state === "waiting"
                      ? "Esperando"
                      : roomState.state === "playing"
                      ? "Jugando"
                      : "Finalizado"}
                  </span>
                )}
              </div>
            </section>

            <section className="p-4 rounded-lg bg-white border border-slate-200 shadow-md space-y-3">
              <h2 className="font-semibold text-slate-900">Jugadores</h2>
              <ul className="space-y-1 text-sm text-slate-700">
                {roomState?.players.length === 0 ? (
                  <li className="text-slate-500">No hay jugadores aún</li>
                ) : (
                  roomState?.players.map((p) => (
                    <li key={p.id}>{p.name}</li>
                  ))
                )}
              </ul>
            </section>

            <section className="p-4 rounded-lg bg-white border border-slate-200 shadow-md space-y-3">
              {roomState?.state === "waiting" && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">
                    Selecciona la letra del patrón:
                  </p>
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                    {Array.from({ length: 26 }, (_, i) => {
                      const letter = String.fromCharCode(65 + i); // A-Z
                      const isSelected = selectedLetter === letter;
                      return (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => setSelectedLetter(letter)}
                          className={`
                            py-2 px-3 rounded-md text-sm font-semibold transition-colors
                            ${
                              isSelected
                                ? "bg-emerald-500 text-white shadow-md"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }
                          `}
                        >
                          {letter}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {(roomState?.state === "playing" || roomState?.state === "finished") &&
                roomState?.selectedLetter && (
                  <div className="p-2 rounded-md bg-emerald-50 border border-emerald-200">
                    <p className="text-sm text-slate-600">
                      Patrón seleccionado:{" "}
                      <span className="font-bold text-emerald-700 text-lg">
                        {roomState.selectedLetter}
                      </span>
                    </p>
                  </div>
                )}

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    if (selectedLetter) {
                      startGame(selectedLetter);
                    }
                  }}
                  disabled={roomState?.state !== "waiting" || !selectedLetter}
                  className="flex-1 min-w-[120px] py-2 rounded-md bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:text-slate-500 text-white font-semibold transition-colors shadow-md hover:shadow-lg disabled:shadow-none"
                >
                  Iniciar juego
                </button>
                <button
                  onClick={() => drawNumber()}
                  disabled={roomState?.state !== "playing"}
                  className="flex-1 min-w-[120px] py-2 rounded-md bg-slate-700 hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500 text-white font-semibold transition-colors shadow-md hover:shadow-lg disabled:shadow-none"
                >
                  Sacar número
                </button>
                <button
                  onClick={() => restartGame()}
                  disabled={roomState?.state !== "finished"}
                  className="flex-1 min-w-[120px] py-2 rounded-md bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:text-slate-500 text-white font-semibold transition-colors shadow-md hover:shadow-lg disabled:shadow-none"
                >
                  Reiniciar juego
                </button>
                <button
                  onClick={() => endGame()}
                  className="flex-1 min-w-[120px] py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors shadow-md hover:shadow-lg"
                >
                  Terminar juego
                </button>
              </div>

              {lastNumber && (
                <div className="mt-2 flex flex-col items-center justify-center">
                  <p className="text-xs text-slate-600 mb-2">Último número</p>
                  <BingoBall
                    letter={lastNumber.letter}
                    value={lastNumber.value}
                    key={`${lastNumber.letter}-${lastNumber.value}-${lastNumber.drawnAt}`}
                  />
                </div>
              )}

              {roomState?.drawnNumbers?.length ? (
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-slate-600">Números sacados</p>
                  <div className="flex flex-wrap gap-1">
                    {roomState.drawnNumbers.map((n) => (
                      <span
                        key={`${n.letter}-${n.value}-${n.drawnAt}`}
                        className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-700 text-white"
                      >
                        {n.letter}-{n.value}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {bingoResult && (
                <>
                  {bingoResult.valid ? (
                    <div className="mt-4 p-3 rounded-lg border border-emerald-300 bg-emerald-50 text-center">
                      <p className="text-sm font-semibold text-emerald-700">
                        Juego finalizado.
                      </p>
                      <p className="text-lg font-bold text-emerald-800 mt-1">
                        Ganador:{" "}
                        {bingoResult.winnerId
                          ? roomState?.players.find(
                              (p) => p.id === bingoResult.winnerId,
                            )?.name ?? 'Desconocido'
                          : 'Desconocido'}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 p-3 rounded-lg border border-rose-300 bg-rose-50 text-center">
                      <p className="text-sm font-semibold text-rose-700">
                        Bingo inválido
                      </p>
                      <p className="text-sm text-rose-700 mt-1">
                        Jugador:{" "}
                        <span className="font-semibold">
                          {bingoResult.playerName
                            ? bingoResult.playerName
                            : bingoResult.playerId
                            ? roomState?.players.find(
                                (p) => p.id === bingoResult.playerId,
                              )?.name ?? 'Desconocido'
                            : 'Desconocido'}
                        </span>
                      </p>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}


