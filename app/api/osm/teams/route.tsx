import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  // Aceita o parâmetro league_id (ou leagueId)
  const leagueId = searchParams.get("league_id") || searchParams.get("leagueId");
  const sort = searchParams.get("sort") || "squad_value";
  const order = searchParams.get("order") || "desc";

  // Validação: se não passar o ID da liga, retorna erro 400
  if (!leagueId) {
    return NextResponse.json(
      { error: "O parâmetro 'league_id' é obrigatório." },
      { status: 400 }
    );
  }

  try {
    const externalUrl = `https://osmhelper.com/api/fetch_teams.php?league_id=${leagueId}&sort=${sort}&order=${order}`;

    const res = await fetch(externalUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      next: { revalidate: 3600 }, // Cache de 1 hora no Next.js
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Erro ao buscar os times na API externa do OSM Helper." },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Falha interna no servidor ao carregar os times." },
      { status: 500 }
    );
  }
}