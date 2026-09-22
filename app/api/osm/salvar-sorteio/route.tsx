import { NextResponse } from "next/server";
import { Pool } from "pg";

// Reutiliza o pool de conexões em ambientes Serverless/Prod
const globalForPg = globalThis as unknown as { pgPool: Pool };

const pool =
  globalForPg.pgPool ||
  new Pool({
    connectionString: process.env["DATABASE_URL"],
    ssl: { rejectUnauthorized: false }, // Necessário para o SSL do Neon
    max: 10, // Limite de conexões do pool
  });

if (process.env.NODE_ENV !== "production") globalForPg.pgPool = pool;

export async function POST(request: Request) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { results, leagueName } = body;

    if (!results || !Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: "Nenhum resultado fornecido." },
        { status: 400 }
      );
    }

    const nameOfLeague = leagueName || "Liga Principal";

    await client.query("BEGIN");

    for (const item of results) {
      const id = crypto.randomUUID();
      const mName = item.manager || item.managerName || "";
      const tName = item.team || item.teamName || "";
      const bonus = !!item.hasBonus;

      // 1. Salva/Atualiza o técnico na tabela manager
      if (mName) {
        await client.query(
          `INSERT INTO "manager" ("id", "name", "hasBonus")
           VALUES ($1, $2, $3)
           ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "hasBonus" = EXCLUDED."hasBonus"`,
          [crypto.randomUUID(), mName, bonus]
        );
      }

      // 2. Salva o registro no histórico drawRecord
      await client.query(
        `INSERT INTO "drawRecord" ("id", "leagueName", "managerName", "teamName", "hasBonus")
         VALUES ($1, $2, $3, $4, $5)`,
        [id, nameOfLeague, mName, tName, bonus]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Sorteio salvo com sucesso!",
    });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Erro ao salvar sorteio:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno ao salvar no banco." },
      { status: 500 }
    );
  } finally {
    client.release();
  }

  
}