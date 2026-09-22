import {
  History,
  Trophy,
  Crown,
  CalendarDays,
} from "lucide-react";

const seasons = [
  {
    season: "2026/3",
    championship: "Campeonato Brasileiro",
    champion: "Manager A",
    team: "Liverpool",
    managers: 12,
  },
  {
    season: "2026/2",
    championship: "Premier League",
    champion: "Manager D",
    team: "Manchester City",
    managers: 12,
  },
  {
    season: "2026/1",
    championship: "La Liga",
    champion: "Manager B",
    team: "Barcelona",
    managers: 10,
  },
  {
    season: "2025/4",
    championship: "Champions League",
    champion: "Manager A",
    team: "Real Madrid",
    managers: 12,
  },
];

export default function HistoricoPage() {
  return (
    <div className="p-5 md:p-8">

      <div className="mb-8">

        <p className="mb-1 text-sm text-gray-500">
          OSM BAD BOYS
        </p>

        <h1 className="text-3xl font-bold">
          Histórico
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Temporadas, campeonatos e campeões anteriores.
        </p>

      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">

        <Stat
          label="Temporadas"
          value="8"
          icon={<History size={20} />}
        />

        <Stat
          label="Campeonatos"
          value="8"
          icon={<Trophy size={20} />}
        />

        <Stat
          label="Campeões"
          value="5"
          icon={<Crown size={20} />}
        />

      </div>

      <div className="space-y-4">

        {seasons.map((season) => (
          <div
            key={season.season}
            className="rounded-xl border border-white/10 bg-[#171c1f] p-5 transition hover:border-white/20"
          >

            <div className="flex flex-col gap-5 md:flex-row md:items-center">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                <CalendarDays
                  className="text-emerald-400"
                  size={25}
                />
              </div>

              <div className="flex-1">

                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Temporada {season.season}
                </p>

                <h2 className="mt-1 font-bold">
                  {season.championship}
                </h2>

              </div>

              <div>
                <p className="text-xs text-gray-500">
                  CAMPEÃO
                </p>

                <p className="mt-1 font-semibold text-yellow-400">
                  {season.champion}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  TIME
                </p>

                <p className="mt-1 text-sm text-gray-300">
                  {season.team}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  MANAGERS
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {season.managers}
                </p>
              </div>

            </div>

          </div>
        ))}

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
    <div className="rounded-xl border border-white/10 bg-[#171c1f] p-5">

      <div className="mb-3 flex items-center justify-between">

        <p className="text-sm text-gray-500">
          {label}
        </p>

        <span className="text-emerald-400">
          {icon}
        </span>

      </div>

      <p className="text-3xl font-bold">
        {value}
      </p>

    </div>
  );
}