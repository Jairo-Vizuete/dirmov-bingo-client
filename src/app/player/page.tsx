'use client';

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { useBingoStore } from "../../store/bingoStore";
import { BingoCardGrid } from "../../components/BingoCardGrid";
import { BingoBall } from "../../components/BingoBall";

export default function PlayerPage() {
  const [localName, setLocalName] = useState("");
  const {
    connectAsPlayer,
    roomState,
    role,
    hasJoined,
    lastNumber,
    claimBingo,
    bingoResult,
    myCard,
    markCell,
    playerName,
  } = useBingoStore();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!localName.trim()) return;
    connectAsPlayer(localName.trim());
  };

  const isJoined = role === "player" && hasJoined;

  const headerTitle =
    isJoined && (roomState?.state === "playing" || roomState?.state === "finished")
      ? `Hola ${playerName || "Jugador"}`
      : "Unirse como Jugador";

  useEffect(() => {
    if (!bingoResult?.valid) return;
    // Confeti solo si el cliente fue marcado como ganador en el store
    // (el store pone isWinner=true cuando winnerId coincide con playerId)
    // Para no acoplar más props, consultamos el store directamente:
    const state = useBingoStore.getState();
    if (!state.isWinner) return;

    confetti({
      particleCount: 200,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, [bingoResult]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 p-4 pb-16">
      <div className="w-full max-w-xl space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            {headerTitle}
          </h1>
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-900 hover:underline">
            Volver
          </Link>
        </header>

        {!isJoined && (
          <section className="space-y-4">
            {/* Información de la sala disponible antes de unirse */}
            {roomState?.hostName && (
              <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-md flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Sala disponible
                  </p>
                  <p className="text-sm text-slate-700">
                    Anfitrión:{" "}
                    <span className="font-semibold text-slate-900">
                      {roomState.hostName}
                    </span>
                  </p>
                </div>
                <span
                  className={[
                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold",
                    roomState.state === "waiting" &&
                      "bg-amber-100 text-amber-800 border border-amber-200",
                    roomState.state === "playing" &&
                      "bg-emerald-100 text-emerald-800 border border-emerald-200",
                    roomState.state === "finished" &&
                      "bg-emerald-600 text-white border border-emerald-700 shadow-md",
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
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-4 p-4 rounded-lg bg-white border border-slate-200 shadow-md"
            >
              <label className="block text-sm font-medium text-slate-700">
                Tu nombre
              </label>
              <input
                className="w-full px-3 py-2 rounded-md bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                placeholder="Escribe tu nombre"
              />
              <button
                type="submit"
                disabled={!localName.trim() || !roomState?.hostName}
                className="w-full py-2 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed disabled:hover:bg-slate-300 shadow-md hover:shadow-lg disabled:shadow-none"
              >
                Unirse al juego
              </button>
            </form>
          </section>
        )}

        {isJoined && (
          <div className="space-y-4">
            {/* Solo información esencial: host, estado y tu nombre */}
            <section className="p-4 rounded-lg bg-white border border-slate-200 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Anfitrión:{" "}
                  <span className="font-semibold text-slate-900">
                    {roomState?.hostName ?? "Desconocido"}
                  </span>
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
                        "bg-emerald-600 text-white border border-emerald-700 shadow-md",
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
              {(roomState?.state === "playing" || roomState?.state === "finished") &&
                roomState?.selectedLetter && (
                  <div className="p-2 rounded-md bg-emerald-50 border border-emerald-200">
                    <p className="text-sm text-slate-600">
                      Patrón:{" "}
                      <span className="font-bold text-emerald-700 text-lg">
                        {roomState.selectedLetter}
                      </span>
                    </p>
                  </div>
                )}
              <p className="text-sm text-slate-600">
                Tú:{" "}
                <span className="font-semibold text-slate-900">
                  {playerName || "Jugador"}
                </span>
              </p>
            </section>

            <section className="p-4 rounded-lg bg-white border border-slate-200 shadow-md space-y-3">
              {roomState?.state === "waiting" && (
                <p className="text-sm text-slate-600">
                  Esperando a que el anfitrión inicie el juego...
                </p>
              )}

              {roomState?.state === "playing" && (
                <>
                  {lastNumber && (
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-xs text-slate-600 mb-2">Último número</p>
                      <BingoBall
                        letter={lastNumber.letter}
                        value={lastNumber.value}
                        key={`${lastNumber.letter}-${lastNumber.value}-${lastNumber.drawnAt}`}
                      />
                    </div>
                  )}
                  <button
                    onClick={() => claimBingo()}
                    className="w-full py-2 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors shadow-md hover:shadow-lg"
                  >
                    ¡Bingo!
                  </button>
                </>
              )}

              {myCard && roomState?.state === "playing" && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-semibold text-slate-900">Tu cartilla</p>
                  <BingoCardGrid
                    card={myCard}
                    onToggleCell={markCell}
                    disabled={roomState?.state !== "playing"}
                    drawnNumbers={roomState?.drawnNumbers || []}
                    selectedLetter={roomState?.selectedLetter || null}
                  />
                </div>
              )}

              {roomState?.state === "playing" && roomState?.drawnNumbers?.length ? (
                <div className="mt-4 space-y-1">
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

              {roomState?.state === "finished" && (
                <div className="mt-4 p-3 rounded-lg border border-emerald-300 bg-emerald-50 text-center">
                  <p className="text-sm font-semibold text-emerald-700">
                    Juego finalizado.
                  </p>
                  <p className="text-lg font-bold text-emerald-800 mt-1">
                    Ganador:{" "}
                    {roomState.winnerId
                      ? roomState.players.find(
                          (p) => p.id === roomState.winnerId,
                        )?.name ?? "Desconocido"
                      : "Desconocido"}
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

