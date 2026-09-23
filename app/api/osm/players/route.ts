import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const teamId = searchParams.get("team_id");
  const leagueId = searchParams.get("league_id");

  if (!teamId || !leagueId) {
    return NextResponse.json(
      {
        error: "team_id e league_id são obrigatórios.",
      },
      { status: 400 }
    );
  }

  try {
    const url =
      `https://osmhelper.com/api/fetch_players.php` +
      `?team_id=${encodeURIComponent(teamId)}` +
      `&league_id=${encodeURIComponent(leagueId)}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
      cache: "no-store",
    });

    const text = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Erro HTTP ${response.status}`,
          details: text.substring(0, 500),
        },
        { status: response.status }
      );
    }

    try {
      const data = JSON.parse(text);

      return NextResponse.json(data);
    } catch {
      return NextResponse.json(
        {
          error: "A API externa não retornou JSON válido.",
          response: text.substring(0, 1000),
        },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Erro ao buscar jogadores:", error);

    return NextResponse.json(
      {
        error: "Falha na conexão com a API externa.",
      },
      { status: 500 }
    );
  }
}