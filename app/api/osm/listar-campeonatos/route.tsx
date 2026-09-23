import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(
      "https://osmhelper.com/api/fetch_leagues.php",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error(
        `OSM Helper retornou status ${res.status} ${res.statusText}`
      );

      return NextResponse.json(
        {
          error: "Erro ao buscar as ligas na API externa.",
          status: res.status,
        },
        { status: 502 }
      );
    }

    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar ligas no OSM Helper:", error);

    return NextResponse.json(
      {
        error: "Falha na conexão com a API do OSM Helper.",
      },
      { status: 500 }
    );
  }
}