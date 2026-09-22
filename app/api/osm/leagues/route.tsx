import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  // Pega o ID da liga que veio na URL (ex: /api/osm/teams?league_id=12)
  const leagueId = searchParams.get("league_id") || searchParams.get("leagueId");

  if (!leagueId) {
    return NextResponse.json(
      { error: "O código da liga (league_id) é obrigatório." },
      { status: 400 }
    );
  }

  try {
    // Busca os times no OSM Helper usando o ID recebido
    const res = await fetch(
      `https://osmhelper.com/api/fetch_teams.php?league_id=${leagueId}&sort=squad_value&order=desc`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
        next: { revalidate: 3600 }, // Cache de 1 hora
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Erro ao buscar os times na API externa." },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Falha na conexão do servidor." },
      { status: 500 }
    );
  }
}