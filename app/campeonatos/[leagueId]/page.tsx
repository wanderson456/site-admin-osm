import Link from "next/link";

interface OSMTeam {
  id?: number;
  team_id?: number;
  name?: string;
  team_name?: string;
  squad_value?: number | string;
  value?: number | string;
  [key: string]: any;
}

async function getTeams(leagueId: string) {
  try {
    const url =
      `https://osmhelper.com/api/fetch_teams.php` +
      `?league_id=${encodeURIComponent(leagueId)}` +
      `&sort=squad_value` +
      `&order=desc`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
      cache: "no-store",
    });

    const text = await response.text();

    if (!response.ok) {
      return {
        teams: [],
        error: `Erro HTTP ${response.status}: ${text.substring(0, 300)}`,
      };
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return {
        teams: [],
        error: "A API externa não retornou JSON válido.",
      };
    }

    if (Array.isArray(data)) {
      return {
        teams: data as OSMTeam[],
        error: null,
      };
    }

    if (data?.teams && Array.isArray(data.teams)) {
      return {
        teams: data.teams as OSMTeam[],
        error: null,
      };
    }

    if (data?.data && Array.isArray(data.data)) {
      return {
        teams: data.data as OSMTeam[],
        error: null,
      };
    }

    return {
      teams: [],
      error: "Formato de dados não reconhecido pela API.",
    };
  } catch (error: any) {
    console.error("Erro ao buscar times:", error);

    return {
      teams: [],
      error: error?.message || "Erro de conexão com a API.",
    };
  }
}

function formatCurrency(value: number | string | undefined): string {
  if (value === undefined || value === null || value === "") {
    return "N/A";
  }

  const number =
    typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(number)) {
    return "N/A";
  }

  if (number >= 1_000_000) {
    return `€ ${(number / 1_000_000).toFixed(1)}M`;
  }

  if (number >= 1_000) {
    return `€ ${Math.round(number / 1_000)}K`;
  }

  return `€ ${number}`;
}

export default async function ChampionshipPage({
  params,
}: {
  params: Promise<{
    leagueId: string;
  }>;
}) {
  const { leagueId } = await params;

  const { teams, error } = await getTeams(leagueId);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <Link
        href="/campeonatos"
        className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors"
      >
        ← Voltar para campeonatos
      </Link>

      <header className="border-b border-white/10 pb-5">
        <h1 className="text-2xl font-bold text-white">
          Times do Campeonato
        </h1>

        <p className="text-sm text-gray-400 mt-2">
          Campeonato ID:{" "}
          <span className="text-emerald-400 font-mono">
            {leagueId}
          </span>
        </p>
      </header>

      {error ? (
        <div className="p-8 rounded-xl border border-red-500/30 bg-red-500/10 text-center">
          <h2 className="font-bold text-red-400">
            Erro ao carregar os times
          </h2>

          <p className="text-sm text-red-300 mt-2">
            {error}
          </p>
        </div>
      ) : teams.length === 0 ? (
        <div className="p-12 rounded-xl border border-white/10 bg-[#171b1e] text-center">
          <p className="text-gray-400">
            Nenhum time encontrado neste campeonato.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              Times
            </h2>

            <span className="text-sm text-gray-400">
              {teams.length} times
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {teams.map((team, index) => {
              const teamId = team.team_id ?? team.id ?? "";

              const teamName =
                team.team_name ??
                team.name ??
                `Time ${index + 1}`;

              return (
                <Link
                  key={`${teamId}-${index}`}
                  href={`/campeonatos/${leagueId}/${teamId}`}
                  className="group p-5 rounded-xl border border-white/10 bg-[#171b1e] hover:border-emerald-500/50 hover:bg-[#1b2124] transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {teamName}
                      </h3>

                      <p className="text-xs text-gray-500 mt-2 font-mono">
                        ID: {teamId}
                      </p>
                    </div>

                    <span className="text-gray-500 group-hover:text-emerald-400 transition-colors">
                      →
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">
                        Valor do elenco
                      </span>

                      <span className="text-emerald-400 font-semibold">
                        {formatCurrency(
                          team.squad_value ?? team.value
                        )}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}