"use client";

import { useState } from "react";
import { Shuffle, Users, RotateCcw } from "lucide-react";

const managers = [
  "Manager A",
  "Manager B",
  "Manager C",
  "Manager D",
  "Manager E",
  "Manager F",
];

const teams = [
  "Liverpool",
  "Barcelona",
  "Real Madrid",
  "Bayern",
  "Inter",
  "Manchester City",
];

export default function SorteioPage() {
  const [result, setResult] = useState<
    { manager: string; team: string }[]
  >([]);

  function realizarSorteio() {
    const shuffledTeams = [...teams].sort(
      () => Math.random() - 0.5
    );

    setResult(
      managers.map((manager, index) => ({
        manager,
        team: shuffledTeams[index],
      }))
    );
  }

  function limpar() {
    setResult([]);
  }

  return (
    <div className="p-5 md:p-8">

      <div className="mb-8">
        <p className="mb-1 text-sm text-gray-500">
          OSM BAD BOYS
        </p>

        <h1 className="text-3xl font-bold">
          Sorteio de Times
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Distribua aleatoriamente os times entre os managers.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        <div className="rounded-xl border border-white/10 bg-[#171c1f] p-5">

          <div className="mb-5 flex items-center gap-3">
            <Users className="text-emerald-400" />

            <div>
              <h2 className="font-semibold">
                Managers
              </h2>

              <p className="text-xs text-gray-500">
                {managers.length} participantes
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {managers.map((manager) => (
              <div
                key={manager}
                className="rounded-lg bg-[#101416] px-4 py-3 text-sm"
              >
                {manager}
              </div>
            ))}
          </div>

        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-[#171c1f] p-8">

          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
            <Shuffle
              size={36}
              className="text-emerald-400"
            />
          </div>

          <h2 className="mb-2 text-xl font-bold">
            Sortear Times
          </h2>

          <p className="mb-6 text-center text-sm text-gray-500">
            Cada manager receberá um time aleatoriamente.
          </p>

          <button
            onClick={realizarSorteio}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-black hover:bg-emerald-400"
          >
            <Shuffle size={18} />
            Realizar Sorteio
          </button>

          {result.length > 0 && (
            <button
              onClick={limpar}
              className="mt-3 flex items-center gap-2 text-xs text-gray-500 hover:text-white"
            >
              <RotateCcw size={14} />
              Limpar sorteio
            </button>
          )}

        </div>

        <div className="rounded-xl border border-white/10 bg-[#171c1f] p-5">

          <h2 className="mb-5 font-semibold">
            Times disponíveis
          </h2>

          <div className="space-y-2">
            {teams.map((team) => (
              <div
                key={team}
                className="rounded-lg bg-[#101416] px-4 py-3 text-sm"
              >
                {team}
              </div>
            ))}
          </div>

        </div>

      </div>

      {result.length > 0 && (
        <div className="mt-6 rounded-xl border border-emerald-500/20 bg-[#171c1f]">

          <div className="border-b border-white/10 p-5">
            <h2 className="font-semibold">
              Resultado do sorteio
            </h2>
          </div>

          <div className="grid gap-3 p-5 md:grid-cols-2 lg:grid-cols-3">

            {result.map((item) => (
              <div
                key={item.manager}
                className="rounded-lg bg-[#101416] p-4"
              >
                <p className="text-sm text-gray-400">
                  {item.manager}
                </p>

                <p className="mt-1 font-bold text-emerald-400">
                  {item.team}
                </p>
              </div>
            ))}

          </div>

        </div>
      )}

    </div>
  );
}