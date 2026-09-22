import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  
  // Captura ambos os parâmetros (aceitando snake_case ou camelCase)
  const teamId = searchParams.get("team_id") || searchParams.get("teamId");
  const leagueId = searchParams.get("league_id") || searchParams.get("leagueId");

  // Valida se ambos foram fornecidos
  if (!teamId || !leagueId) {
    return NextResponse.json(
      { error: "Os parâmetros 'team_id' e 'league_id' são obrigatórios." },
      { status: 400 }
    );
  }

  try {
    // Monta a URL externa contendo team_id E league_id
    const externalUrl = `https://osmhelper.com/api/fetch_players.php?team_id=${teamId}&league_id=${leagueId}`;

    const res = await fetch(externalUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Erro ao buscar os jogadores no OSM Helper." },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Falha interna no servidor ao carregar os jogadores." },
      { status: 500 }
    );
  }
}