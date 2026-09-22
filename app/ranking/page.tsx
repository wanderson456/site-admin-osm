import { BarChart3, Crown, Medal } from "lucide-react";

const ranking = [
  {
    position: 1,
    manager: "Manager A",
    team: "Liverpool",
    points: 21,
    titles: 3,
  },
  {
    position: 2,
    manager: "Manager B",
    team: "Barcelona",
    points: 18,
    titles: 2,
  },
  {
    position: 3,
    manager: "Manager C",
    team: "Real Madrid",
    points: 16,
    titles: 1,
  },
  {
    position: 4,
    manager: "Manager D",
    team: "Bayern",
    points: 14,
    titles: 2,
  },
  {
    position: 5,
    manager: "Manager E",
    team: "Inter",
    points: 12,
    titles: 1,
  },
];

export default function RankingPage() {
  return (
    <div className="p-5 md:p-8">

      {/* CABEÇALHO */}
      <div className="mb-8">
        <p className="mb-1 text-sm text-gray-500">
          OSM BAD BOYS
        </p>

        <h1 className="text-3xl font-bold">
          Ranking
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Classificação geral dos managers do grupo.
        </p>
      </div>

      {/* CARDS */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">

        <div className="rounded-xl border border-white/10 bg-[#171c1f] p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Managers
            </p>

            <BarChart3
              size={20}
              className="text-emerald-400"
            />
          </div>

          <p className="text-3xl font-bold">
            12
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#171c1f] p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Campeonatos
            </p>

            <Crown
              size={20}
              className="text-yellow-400"
            />
          </div>

          <p className="text-3xl font-bold">
            8
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#171c1f] p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Temporada
            </p>

            <Medal
              size={20}
              className="text-blue-400"
            />
          </div>

          <p className="text-3xl font-bold">
            2026/3
          </p>
        </div>

      </div>

      {/* TABELA */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#171c1f]">

        <div className="border-b border-white/10 p-5">
          <h2 className="font-semibold">
            Classificação geral
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Desempenho dos managers
          </p>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-gray-500">
                <th className="px-5 py-4">
                  #
                </th>

                <th className="px-5 py-4">
                  Manager
                </th>

                <th className="px-5 py-4">
                  Time
                </th>

                <th className="px-5 py-4 text-center">
                  Pontos
                </th>

                <th className="px-5 py-4 text-center">
                  Títulos
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">

              {ranking.map((item) => (
                <tr
                  key={item.manager}
                  className="transition hover:bg-white/[0.03]"
                >

                  <td className="px-5 py-4">

                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        item.position === 1
                          ? "bg-yellow-500/20 text-yellow-400"
                          : item.position === 2
                          ? "bg-gray-400/20 text-gray-300"
                          : item.position === 3
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-white/5 text-gray-500"
                      }`}
                    >
                      {item.position}
                    </div>

                  </td>

                  <td className="px-5 py-4">
                    <p className="font-medium">
                      {item.manager}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-400">
                    {item.team}
                  </td>

                  <td className="px-5 py-4 text-center font-bold">
                    {item.points}
                  </td>

                  <td className="px-5 py-4 text-center text-gray-400">
                    {item.titles}
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}