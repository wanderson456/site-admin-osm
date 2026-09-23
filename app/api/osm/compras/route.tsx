import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET: Buscar histórico de contratações na tabela "transfer"
export async function GET() {
  try {
    const transfers = await sql`
      SELECT 
        t."id",
        t."poll_id" AS "pollId",
        t."manager_id" AS "managerId",
        m."name" AS "managerName",
        t."player_name" AS "playerName",
        t."player_overall" AS "playerOverall",
        t."turn",
        t."created_at" AS "createdAt"
      FROM "transfer" t
      JOIN "manager" m ON t."manager_id" = m."id"
      ORDER BY t."created_at" DESC
    `;

    return NextResponse.json({ success: true, transfers });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro ao carregar compras.";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

// POST: Inserir compra garantindo regras de limite e overall
export async function POST(request: Request) {
  try {
    const {
      pollId,
      managerId,
      playerName,
      playerOverall,
      turn,
      maxPurchases,
      maxOverall,
    } = await request.json();

    if (!managerId || !playerName || !playerOverall || !turn) {
      return NextResponse.json({ error: "Dados da compra incompletos." }, { status: 400 });
    }

    // 1. Valida se o overall do jogador ultrapassa o limite do turno
    if (maxOverall && playerOverall > maxOverall) {
      return NextResponse.json(
        { error: `O overall do jogador (${playerOverall}) é superior ao limite do Turno ${turn} (${maxOverall}).` },
        { status: 400 }
      );
    }

    // 2. Valida se o treinador excedeu o limite de compras no turno
    if (maxPurchases) {
      const existingPurchases = await sql`
        SELECT COUNT(*) as total 
        FROM "transfer" 
        WHERE "manager_id" = ${managerId} AND "turn" = ${turn}
      `;

      if (Number(existingPurchases[0].total) >= maxPurchases) {
        return NextResponse.json(
          { error: `Atingiu o limite de ${maxPurchases} compras permitidas no Turno ${turn}.` },
          { status: 400 }
        );
      }
    }

    // 3. Insere a transferência na tabela "transfer"
    const [newTransfer] = await sql`
      INSERT INTO "transfer" (
        "poll_id", 
        "manager_id", 
        "player_name", 
        "player_overall", 
        "turn"
      )
      VALUES (
        ${pollId || null}, 
        ${managerId}, 
        ${playerName.trim()}, 
        ${playerOverall}, 
        ${turn}
      )
      RETURNING "id"
    `;

    return NextResponse.json({
      success: true,
      message: "Jogador registado com sucesso!",
      transferId: newTransfer.id,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro ao registar compra.";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

// DELETE: Remover uma compra por ID
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID da contratação é obrigatório." }, { status: 400 });
    }

    await sql`DELETE FROM "transfer" WHERE "id" = ${id}`;

    return NextResponse.json({ success: true, message: "Contratação removida." });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro ao remover compra.";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}