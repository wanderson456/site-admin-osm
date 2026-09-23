import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET: Buscar enquete ativa, votos e voto do manager logado
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get("managerId");

    // 1. Pega ou cria a enquete ativa na tabela "poll"
    let polls = await sql`SELECT * FROM "poll" WHERE "active" = true LIMIT 1`;
    
    if (polls.length === 0) {
      polls = await sql`
        INSERT INTO "poll" ("title", "active") 
        VALUES ('Regras do Mercado', true) 
        RETURNING *
      `;
    }

    const currentPoll = polls[0];

    // 2. Busca todos os votos dessa enquete com o nome do treinador
    const votes = await sql`
      SELECT 
        v."id",
        v."poll_id" AS "pollId",
        v."manager_id" AS "managerId",
        m."name" AS "managerName",
        v."championship_choice" AS "championshipChoice",
        v."max_overall_turn1" AS "maxOverallTurn1",
        v."max_overall_turn2" AS "maxOverallTurn2",
        v."max_purchases_per_manager" AS "maxPurchasesPerManager",
        v."created_at" AS "createdAt"
      FROM "poll_vote" v
      JOIN "manager" m ON v."manager_id" = m."id"
      WHERE v."poll_id" = ${currentPoll.id}
      ORDER BY v."created_at" DESC
    `;

    // 3. Voto específico do manager (se enviado managerId válido)
    let myVote = null;
    if (managerId) {
      const myVoteRows = votes.filter((v) => v.managerId === managerId);
      if (myVoteRows.length > 0) {
        myVote = myVoteRows[0];
      }
    }

    return NextResponse.json({
      success: true,
      poll: currentPoll,
      votes,
      myVote,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro ao carregar enquetes.";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

// POST: Registrar ou atualizar voto na tabela "poll_vote"
export async function POST(request: Request) {
  try {
    const {
      managerId,
      championshipChoice,
      maxOverallTurn1,
      maxOverallTurn2,
      maxPurchasesPerManager,
    } = await request.json();

    if (!managerId || !championshipChoice) {
      return NextResponse.json(
        { error: "Dados incompletos para votação." },
        { status: 400 }
      );
    }

    // Pega a enquete ativa
    const polls = await sql`SELECT "id" FROM "poll" WHERE "active" = true LIMIT 1`;
    if (polls.length === 0) {
      return NextResponse.json({ error: "Nenhuma enquete ativa encontrada." }, { status: 404 });
    }

    const pollId = polls[0].id;

    // Upsert usando a chave única (poll_id, manager_id)
    await sql`
      INSERT INTO "poll_vote" (
        "poll_id", 
        "manager_id", 
        "championship_choice", 
        "max_overall_turn1", 
        "max_overall_turn2", 
        "max_purchases_per_manager"
      )
      VALUES (
        ${pollId}, 
        ${managerId}, 
        ${championshipChoice}, 
        ${maxOverallTurn1}, 
        ${maxOverallTurn2}, 
        ${maxPurchasesPerManager}
      )
      ON CONFLICT ("poll_id", "manager_id") 
      DO UPDATE SET
        "championship_choice" = EXCLUDED."championship_choice",
        "max_overall_turn1" = EXCLUDED."max_overall_turn1",
        "max_overall_turn2" = EXCLUDED."max_overall_turn2",
        "max_purchases_per_manager" = EXCLUDED."max_purchases_per_manager";
    `;

    return NextResponse.json({ success: true, message: "Voto registado com sucesso!" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro ao registar voto.";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}