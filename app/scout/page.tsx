"use client";

import { useState } from "react";
import {
  Search,
  Star,
  Shield,
  Zap,
} from "lucide-react";

const players = [
  {
    name: "Vinícius Júnior",
    position: "PE",
    age: 25,
    rating: 92,
    value: "€ 95M",
    team: "Real Madrid",
  },
  {
    name: "Rodri",
    position: "MC",
    age: 30,
    rating: 91,
    value: "€ 80M",
    team: "Manchester City",
  },
  {
    name: "Mohamed Salah",
    position: "PD",
    age: 34,
    rating: 89,
    value: "€ 65M",
    team: "Liverpool",
  },
  {
    name: "Jude Bellingham",
    position: "MC",
    age: 23,
    rating: 90,
    value: "€ 88M",
    team: "Real Madrid",
  },
];

export default function ScoutPage() {
  const [search, setSearch] = useState("");

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-5 md:p-8">

      <div className="mb-8">

        <p className="mb-1 text-sm text-gray-500">
          OSM BAD BOYS
        </p>

        <h1 className="text-3xl font-bold">
          Scout
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Pesquise jogadores disponíveis.
        </p>

      </div>

      <div className="mb-6 rounded-xl border border-white/10 bg-[#171c1f] p-5">

        <div className="relative">

          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar jogador..."
            className="w-full rounded-lg border border-white/10 bg-[#101416] py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-emerald-500"
          />

        </div>

      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        {filteredPlayers.map((player) => (
          <div
            key={player.name}
            className="rounded-xl border border-white/10 bg-[#171c1f] p-5 transition hover:border-emerald-500/30"
          >

            <div className="mb-5 flex items-start justify-between">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <Shield className="text-emerald-400" />
              </div>

              <span className="flex items-center gap-1 text-yellow-400">
                <Star size={15} fill="currentColor" />
                {player.rating}
              </span>

            </div>

            <h2 className="font-bold">
              {player.name}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {player.team}
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2">

              <div className="rounded-lg bg-[#101416] p-3 text-center">
                <p className="text-xs text-gray-500">
                  POS
                </p>
                <p className="mt-1 font-bold">
                  {player.position}
                </p>
              </div>

              <div className="rounded-lg bg-[#101416] p-3 text-center">
                <p className="text-xs text-gray-500">
                  IDADE
                </p>
                <p className="mt-1 font-bold">
                  {player.age}
                </p>
              </div>

              <div className="rounded-lg bg-[#101416] p-3 text-center">
                <p className="text-xs text-gray-500">
                  VALOR
                </p>
                <p className="mt-1 text-xs font-bold">
                  {player.value}
                </p>
              </div>

            </div>

          </div>
        ))}

      </div>

      {filteredPlayers.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-[#171c1f] p-10 text-center">
          <Zap className="mx-auto mb-3 text-gray-600" />

          <p className="text-gray-400">
            Nenhum jogador encontrado.
          </p>
        </div>
      )}

    </div>
  );
}