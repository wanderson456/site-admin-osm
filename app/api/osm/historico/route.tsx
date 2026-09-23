import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Cria a instância de consulta HTTP do Neon
const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const rows = await sql`
      SELECT 
        "id",
        "leagueName",
        "managerName",
        "teamName",
        "hasBonus"
      FROM "drawRecord" 
      ORDER BY "id" DESC
    `;

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error: any) {
    console.error("Erro ao buscar histórico:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno ao buscar dados." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const leagueName = searchParams.get("leagueName");

    if (id) {
      await sql`DELETE FROM "drawRecord" WHERE "id" = ${id}`;
      return NextResponse.json({
        success: true,
        message: "Registro excluído com sucesso.",
      });
    }

    if (leagueName) {
      await sql`DELETE FROM "drawRecord" WHERE "leagueName" = ${leagueName}`;
      return NextResponse.json({
        success: true,
        message: "Sorteios da liga excluídos com sucesso.",
      });
    }

    return NextResponse.json(
      { error: "ID ou Nome da Liga não fornecido." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Erro ao excluir histórico:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno ao excluir registro." },
      { status: 500 }
    );
  }
}