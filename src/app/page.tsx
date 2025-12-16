import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 p-4 pb-16">
      <div className="max-w-md w-full space-y-8 p-8 rounded-xl bg-white shadow-xl border border-slate-200">
        <div className="flex flex-col items-center space-y-4">
          <Image
            src="/dirmov-logo.png"
            alt="DIRMOV Logo"
            width={120}
            height={120}
            className="object-contain"
          />
          <h1 className="text-4xl font-bold text-center text-slate-900">
            DIRMOV BINGO
          </h1>
        </div>
        <p className="text-center text-slate-600">
          Elige cómo quieres participar en el juego.
        </p>
        <div className="flex flex-col gap-4">
          <Link
            href="/host"
            className="w-full text-center py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors shadow-md hover:shadow-lg"
          >
            Ser el Anfitrión
          </Link>
          <Link
            href="/player"
            className="w-full text-center py-3 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-semibold transition-colors shadow-md hover:shadow-lg"
          >
            Unirse como Jugador
          </Link>
        </div>
      </div>
    </main>
  );
}
