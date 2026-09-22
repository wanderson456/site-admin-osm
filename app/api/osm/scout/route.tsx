import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const response = await fetch(
      `https://osmhelper.com/scout/fetch_players.php?${searchParams.toString()}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        // Revalida a cada 1 hora para evitar chamadas excessivas na API externa
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Erro ao buscar dados do servidor remoto" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro no Proxy do Scout:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor de Proxy" },
      { status: 500 }
    );
  }
}