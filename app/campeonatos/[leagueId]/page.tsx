// app/campeonatos/[leagueId]/page.tsx
import Link from "next/link";

interface Team {
  id: number;
  name: string;
  objective?: number;
}

async function getTeams(leagueId: string): Promise<Team[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  // Passa tanto leagueId quanto league_id para garantir compatibilidade
  const res = await fetch(
    `${baseUrl}/api/osm/teams?leagueId=${leagueId}&league_id=${leagueId}`,
    {
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Erro retornado da API interna:", res.status, errorText);
    throw new Error(`Falha ao carregar os times (${res.status})`);
  }

  return res.json();
}

export default async function TabelaTimesPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const resolvedParams = await params;
  
  let teams: Team[] = [];
  let errorMsg = "";

  try {
    teams = await getTeams(resolvedParams.leagueId);
  } catch (err: any) {
    errorMsg = err.message || "Erro desconhecido";
  }

  return (
    <div className="space-y-6">
      <Link
        href="/campeonatos"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        ← Voltar para campeonatos
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Times da Liga</h1>
        <span className="text-sm font-medium px-3 py-1 bg-primary/10 rounded-full">
          Total: {teams.length}
        </span>
      </div>

      {errorMsg ? (
        <div className="p-4 border rounded-lg border-destructive/50 bg-destructive/10 text-destructive">
          <p className="font-medium">Ocorreu um erro ao buscar os dados:</p>
          <p className="text-sm mt-1">{errorMsg}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className="p-4 border rounded-lg bg-card shadow-sm flex flex-col justify-between"
            >
              <h2 className="font-semibold text-base">{team.name}</h2>
              {team.objective && (
                <p className="text-xs text-muted-foreground mt-1">
                  Meta/Objetivo: #{team.objective}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}