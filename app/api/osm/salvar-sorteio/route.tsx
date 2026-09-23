import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { results, leagueName } = body;

    if (!results || !Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: "Nenhum resultado válido enviado para salvar." },
        { status: 400 }
      );
    }

    const currentLeagueName = leagueName || "Liga Sem Nome";

    // Insere todos os registros do sorteio gerando um ID UUID único para cada um
    for (const item of results) {
      const managerName = item.manager || item.managerName || "";
      const teamName = item.team || item.teamName || "";
      const hasBonus = Boolean(item.bonus || item.hasBonus);
      const newId = crypto.randomUUID(); // Gerador de ID para resolver o NOT NULL

      await sql`
        INSERT INTO "drawRecord" ("id", "leagueName", "managerName", "teamName", "hasBonus")
        VALUES (${newId}, ${currentLeagueName}, ${managerName}, ${teamName}, ${hasBonus})
      `;
    }

    return NextResponse.json({
      success: true,
      message: "Sorteio salvo com sucesso no banco de dados!",
    });
  } catch (error: any) {
    console.error("Erro ao salvar sorteio:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno ao salvar os dados no banco." },
      { status: 500 }
    );
  }
}