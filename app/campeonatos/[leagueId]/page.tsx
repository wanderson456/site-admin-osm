import Link from "next/link";

interface OSMTeam {
  id?: number;
  team_id?: number;
  name?: string;
  team_name?: string;
  goal?: number;
  objective?: number;
  player_count?: number;
  squad_value?: string | number;
  [key: string]: any;
}

async function getTeams(leagueId: string): Promise<OSMTeam[]> {
  if (!leagueId || leagueId === "undefined") return [];

  try {
    const res = await fetch(
      `https://osmhelper.com/api/fetch_teams.php?league_id=${leagueId}&sort=squad_value&order=desc`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Erro ao carregar times:", err);
    return [];
  }
}

export default async function TabelaTimesPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const resolvedParams = await params;
  const leagueId = resolvedParams?.leagueId;

  const teams = leagueId ? await getTeams(leagueId) : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      <Link
        href="/campeonatos"
        className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors"
      >
        ← Voltar para campeonatos
      </Link>

      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Times do Campeonato
          </h1>
          <p className="text-xs text-gray-500 mt-1">Liga ID: {leagueId}</p>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
          Total: {teams.length}
        </span>
      </div>

      {teams.length === 0 ? (
        <div className="p-12 text-center border border-white/10 rounded-xl bg-[#171b1e] text-gray-400">
          Nenhum time encontrado para esta liga.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {teams.map((team, index) => {
            const teamName = team.name || team.team_name || `Time ${index + 1}`;
            // ATENÇÃO: dá prioridade absoluta ao team_id
            const teamId = team.team_id ?? team.id ?? index;
            const goal = team.goal ?? team.objective;

            return (
              <Link
                key={teamId}
                href={`/campeonatos/${leagueId}/${teamId}`}
                className="block group focus:outline-none"
              >
                <div className="p-5 border border-white/10 rounded-xl bg-[#171b1e] group-hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4 h-full cursor-pointer">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-bold text-base text-white leading-tight group-hover:text-emerald-400 transition-colors">
                        {teamName}
                      </h2>
                      {goal !== undefined && (
                        <span className="shrink-0 text-xs font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                          Objetivo: #{goal}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 space-y-2 text-xs text-gray-400">
                    <div className="flex justify-between items-center">
                      <span>Elenco:</span>
                      <span className="font-medium text-white">
                        {team.player_count ?? "N/A"} jogadores
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Valor do Time:</span>
                      <span className="font-bold text-emerald-400">
                        {team.squad_value
                          ? typeof team.squad_value === "number"
                            ? `€ ${team.squad_value.toLocaleString()}`
                            : `€ ${team.squad_value}`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}