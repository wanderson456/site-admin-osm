import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Instância limpa para enviar apenas os parâmetros válidos
  const cleanedParams = new URLSearchParams();

  // Tratamento dos filtros
  const name = searchParams.get("name")?.trim();
  const position = searchParams.get("position")?.trim();
  const nationality = searchParams.get("nationality")?.trim() || searchParams.get("nationality_name")?.trim();
  const ageMin = searchParams.get("ageMin")?.trim();
  const ageMax = searchParams.get("ageMax")?.trim();
  const ratingMin = searchParams.get("ratingMin")?.trim();
  const ratingMax = searchParams.get("ratingMax")?.trim();
  const offset = searchParams.get("offset") || "0";
  const sortColumn = searchParams.get("sortColumn") || "stat_ovr";
  const sortOrder = searchParams.get("sortOrder") || "DESC";

  // Adiciona apenas se houver valor
  if (name) cleanedParams.append("name", name);
  if (position) cleanedParams.append("position", position);
  
  // A API do fetch_players.php aceita 'nationality_name'
  if (nationality) {
    cleanedParams.append("nationality_name", nationality);
  }

  if (ageMin) cleanedParams.append("ageMin", ageMin);
  if (ageMax) cleanedParams.append("ageMax", ageMax);
  if (ratingMin) cleanedParams.append("ratingMin", ratingMin);
  if (ratingMax) cleanedParams.append("ratingMax", ratingMax);

  cleanedParams.append("show_special", "0");
  cleanedParams.append("offset", offset);
  cleanedParams.append("sortColumn", sortColumn);
  cleanedParams.append("sortOrder", sortOrder);
  cleanedParams.append("in_form", "0");

  try {
    const targetUrl = `https://osmhelper.com/scout/fetch_players.php?${cleanedParams.toString()}`;

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      next: { revalidate: 3600 },
    });

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