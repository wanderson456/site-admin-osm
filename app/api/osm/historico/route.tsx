import { NextResponse } from "next/server";
import { Pool } from "pg";

const globalForPg = globalThis as unknown as { pgPool: Pool };

const pool =
  globalForPg.pgPool ||
  new Pool({
    connectionString: process.env["DATABASE_URL"],
    ssl: { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") globalForPg.pgPool = pool;

export async function GET() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM "drawRecord" ORDER BY "id" DESC`
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error("Erro ao buscar histórico:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno ao buscar dados." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}