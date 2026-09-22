"use client";

import {
  Trophy,
  Users,
  Shuffle,
  ArrowLeftRight,
  BarChart3,
  ChevronRight,
  Crown,
} from "lucide-react";

const ranking = [
  {
    pos: 1,
    manager: "Manager A",
    team: "Liverpool",
    pts: 21,
  },
  {
    pos: 2,
    manager: "Manager B",
    team: "Barcelona",
    pts: 18,
  },
  {
    pos: 3,
    manager: "Manager C",
    team: "Real Madrid",
    pts: 16,
  },
  {
    pos: 4,
    manager: "Manager D",
    team: "Bayern",
    pts: 14,
  },
  {
    pos: 5,
    manager: "Manager E",
    team: "Inter",
    pts: 12,
  },
];

const transfers = [
  {
    player: "Vinícius Júnior",
    from: "Real Madrid",
    to: "Liverpool",
    manager: "Manager A",
  },
  {
    player: "Rodri",
    from: "Manchester City",
    to: "Barcelona",
    manager: "Manager B",
  },
  {
    player: "Salah",
    from: "Liverpool",
    to: "Bayern",
    manager: "Manager D",
  },
];

export default function Home() {
  return (
    <div className="p-5 md:p-8">
      {/* TÍTULO */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm text-gray-500">Temporada 2026/3</p>
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>

        <button className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400">
          <Shuffle size={18} />
          Sortear Times
        </button>
      </div>

      {/* CAMPEONATO */}
      <div className="mb-6 rounded-xl border border-white/10 bg-[#171c1f] p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Campeonato
            </p>
            <h2 className="mt-1 text-xl font-bold">Campeonato Brasileiro</h2>
          </div>

          <div className="hidden items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Em andamento
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat
            label="Managers"
            value="12"
            icon={<Users size={19} />}
          />
          <Stat
            label="Rodada"
            value="8"
            icon={<Trophy size={19} />}
          />
          <Stat
            label="Jogos"
            value="84"
            icon={<BarChart3 size={19} />}
          />
          <Stat
            label="Transferências"
            value="37"
            icon={<ArrowLeftRight size={19} />}
          />
        </div>
      </div>

      {/* DUAS COLUNAS */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* CLASSIFICAÇÃO */}
        <div className="rounded-xl border border-white/10 bg-[#171c1f]">
          <div className="flex items-center justify-between border-b border-white/10 p-5">
            <div>
              <h2 className="font-semibold">Classificação</h2>
              <p className="text-xs text-gray-500">Campeonato atual</p>
            </div>

            <button className="flex items-center gap-1 text-xs text-emerald-400">
              Ver completa
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="divide-y divide-white/5">
            {ranking.map((item) => (
              <div
                key={item.pos}
                className="flex items-center gap-4 px-5 py-4"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    item.pos === 1
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-white/5 text-gray-400"
                  }`}
                >
                  {item.pos === 1 ? <Crown size={16} /> : item.pos}
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium">{item.manager}</p>
                  <p className="text-xs text-gray-500">{item.team}</p>
                </div>

                <div className="text-right">
                  <p className="font-bold">{item.pts}</p>
                  <p className="text-[10px] uppercase text-gray-600">pontos</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TRANSFERÊNCIAS */}
        <div className="rounded-xl border border-white/10 bg-[#171c1f]">
          <div className="flex items-center justify-between border-b border-white/10 p-5">
            <div>
              <h2 className="font-semibold">Últimas transferências</h2>
              <p className="text-xs text-gray-500">Movimentações recentes</p>
            </div>

            <button className="flex items-center gap-1 text-xs text-emerald-400">
              Ver todas
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="divide-y divide-white/5">
            {transfers.map((transfer) => (
              <div key={transfer.player} className="px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{transfer.player}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {transfer.from}
                      <span className="mx-2 text-emerald-400">→</span>
                      {transfer.to}
                    </p>
                  </div>

                  <ArrowLeftRight
                    size={17}
                    className="text-gray-600"
                  />
                </div>

                <p className="mt-2 text-[11px] text-gray-600">
                  Contratado por {transfer.manager}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-[#101416] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-emerald-400">{icon}</span>
      </div>

      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}