// app/campeonatos/page.tsx
import Link from "next/link";
import { OSMLeague } from "@/types/osm";

async function getLeagues(): Promise<OSMLeague[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const res = await fetch(`${baseUrl}/api/osm/leagues`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error(`Erro na API de ligas: status ${res.status}`);
      return [];
    }

    return res.json();
  } catch (error) {
    console.error("Erro ao buscar a lista de campeonatos:", error);
    return [];
  }
}

export default async function CampeonatosPage() {
  const leagues = await getLeagues();

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-6">
      {/* Cabeçalho principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Campeonatos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Selecione uma liga para explorar a tabela, times e estatísticas
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            {leagues.length} {leagues.length === 1 ? "Liga disponível" : "Ligas disponíveis"}
          </span>
        </div>
      </div>

      {/* Grid de Cards */}
      {leagues.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-2xl bg-card/50 text-muted-foreground">
          <svg
            className="w-12 h-12 mb-3 text-muted-foreground/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
          <p className="font-medium text-base">Nenhum campeonato encontrado</p>
          <p className="text-xs text-muted-foreground mt-1">
            Verifique se a API está conectada corretamente à base de dados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {leagues.map((league) => {
            const leagueId = league.id || (league as any).league_id;

            return (
              <Link
                key={leagueId}
                href={`/campeonatos/${leagueId}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
              >
                {/* Linha decorativa de acento na borda superior no hover */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div>
                  {/* Topo do Card: Título e Código */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="space-y-1">
                      <h2 className="font-bold text-lg tracking-tight text-card-foreground group-hover:text-primary transition-colors">
                        {league.name}
                      </h2>
                    </div>

                    {league.code && (
                      <span className="shrink-0 rounded-md border bg-muted/60 px-2.5 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                        {league.code}
                      </span>
                    )}
                  </div>
                </div>

                {/* Rodapé do Card: Estatísticas + Seta interativa */}
                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <div className="flex items-center gap-4">
                    {/* Badge de quantidade de times */}
                    <span className="flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4 text-primary/70"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      {league.team_count ? `${league.team_count} Times` : "Liga Ativa"}
                    </span>

                    {/* Duração da liga */}
                    {league.weeks && (
                      <span className="flex items-center gap-1.5">
                        <svg
                          className="w-4 h-4 text-primary/70"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {league.weeks} Semanas
                      </span>
                    )}
                  </div>

                  {/* Seta animada com rotação/translação no hover */}
                  <span className="flex items-center text-primary opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}