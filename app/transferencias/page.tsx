import {
  ArrowLeftRight,
  TrendingUp,
  Users,
  Plus,
} from "lucide-react";

const transfers = [
  {
    player: "Vinícius Júnior",
    from: "Real Madrid",
    to: "Liverpool",
    manager: "Manager A",
    value: "€ 95M",
  },
  {
    player: "Rodri",
    from: "Manchester City",
    to: "Barcelona",
    manager: "Manager B",
    value: "€ 80M",
  },
  {
    player: "Salah",
    from: "Liverpool",
    to: "Bayern",
    manager: "Manager D",
    value: "€ 65M",
  },
];

export default function TransferenciasPage() {
  return (
    <div className="p-5 md:p-8">

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

        <div>
          <p className="mb-1 text-sm text-gray-500">
            OSM BAD BOYS
          </p>

          <h1 className="text-3xl font-bold">
            Transferências
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Controle das negociações realizadas no campeonato.
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-black hover:bg-emerald-400">
          <Plus size={18} />
          Nova Transferência
        </button>

      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">

        <Stat
          label="Transferências"
          value="37"
          icon={<ArrowLeftRight size={20} />}
        />

        <Stat
          label="Jogadores"
          value="31"
          icon={<Users size={20} />}
        />

        <Stat
          label="Valor movimentado"
          value="€ 1.2B"
          icon={<TrendingUp size={20} />}
        />

      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#171c1f]">

        <div className="border-b border-white/10 p-5">
          <h2 className="font-semibold">
            Histórico de transferências
          </h2>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-gray-500">
                <th className="px-5 py-4">Jogador</th>
                <th className="px-5 py-4">Origem</th>
                <th className="px-5 py-4">Destino</th>
                <th className="px-5 py-4">Manager</th>
                <th className="px-5 py-4 text-right">Valor</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">

              {transfers.map((transfer) => (
                <tr
                  key={transfer.player}
                  className="hover:bg-white/[0.03]"
                >
                  <td className="px-5 py-4 font-medium">
                    {transfer.player}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-400">
                    {transfer.from}
                  </td>

                  <td className="px-5 py-4 text-sm text-emerald-400">
                    {transfer.to}
                  </td>

                  <td className="px-5 py-4 text-sm">
                    {transfer.manager}
                  </td>

                  <td className="px-5 py-4 text-right font-semibold">
                    {transfer.value}
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