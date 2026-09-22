import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Busca a lista de ligas do OSM Helper
    const res = await fetch(
      "https://osmhelper.com/api/fetch_leagues.php",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
        next: { revalidate: 86400 }, // Cache de 24 horas
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Erro ao buscar as ligas na API externa." },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Falha na conexão do servidor ao buscar ligas." },
      { status: 500 }
    );
  }
}