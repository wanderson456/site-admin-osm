import { Users, Trophy, Medal, UserPlus } from "lucide-react";

const managers = [
  {
    name: "Manager A",
    team: "Liverpool",
    points: 21,
    titles: 3,
    championships: 8,
  },
  {
    name: "Manager B",
    team: "Barcelona",
    points: 18,
    titles: 2,
    championships: 7,
  },
  {
    name: "Manager C",
    team: "Real Madrid",
    points: 16,
    titles: 1,
    championships: 6,
  },
  {
    name: "Manager D",
    team: "Bayern",
    points: 14,
    titles: 2,
    championships: 8,
  },
  {
    name: "Manager E",
    team: "Inter",
    points: 12,
    titles: 1,
    championships: 5,
  },
];

export default function ManagersPage() {
  return (
    <div className="p-5 md:p-8">

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm text-gray-500">
            OSM BAD BOYS
          </p>

          <h1 className="text-3xl font-bold">
            Managers
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Gerencie os participantes do grupo.
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-black hover:bg-emerald-400">
          <UserPlus size={18} />
          Novo Manager
        </button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">

        <Stat
          label="Managers cadastrados"
          value="12"
          icon={<Users size={20} />}
        />

        <Stat
          label="Títulos conquistados"
          value="9"
          icon={<Trophy size={20} />}
        />

        <Stat
          label="Temporadas disputadas"
          value="8"
          icon={<Medal size={20} />}
        />

      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#171c1f]">

        <div className="border-b border-white/10 p-5">
          <h2 className="font-semibold">
            Managers cadastrados
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Histórico e desempenho
          </p>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-gray-500">
                <th className="px-5 py-4">Manager</th>
                <th className="px-5 py-4">Time atual</th>
                <th className="px-5 py-4 text-center">Pontos</th>
                <th className="px-5 py-4 text-center">Títulos</th>
                <th className="px-5 py-4 text-center">Temporadas</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">

              {managers.map((manager) => (
                <tr
                  key={manager.name}
                  className="transition hover:bg-white/[0.03]"
                >
                  <td className="px-5 py-4 font-medium">
                    {manager.name}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-400">
                    {manager.team}
                  </td>

                  <td className="px-5 py-4 text-center font-bold">
                    {manager.points}
                  </td>

                  <td className="px-5 py-4 text-center text-yellow-400">
                    {manager.titles}
                  </td>

                  <td className="px-5 py-4 text-center text-gray-400">
                    {manager.championships}
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