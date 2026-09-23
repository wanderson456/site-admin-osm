import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanPassword = typeof password === "string" ? password.trim() : "";

    if (!cleanName || !cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { error: "Nome, e-mail e palavra-passe são obrigatórios." },
        { status: 400 }
      );
    }

    if (cleanPassword.length < 6) {
      return NextResponse.json(
        { error: "A palavra-passe deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    // Verifica se o e-mail já existe
    const existingUsers = await sql`
      SELECT "id" FROM "manager" WHERE LOWER("email") = ${cleanEmail}
    `;

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "Já existe um treinador cadastrado com este e-mail." },
        { status: 400 }
      );
    }

    // Encripta a palavra-passe com bcrypt
    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    // Insere o treinador guardando o HASH da senha
    const [newUser] = await sql`
      INSERT INTO "manager" ("id", "name", "email", "password")
      VALUES (gen_random_uuid(), ${cleanName}, ${cleanEmail}, ${hashedPassword})
      RETURNING "id", "name", "email"
    `;

    return NextResponse.json({
      success: true,
      message: "Treinador cadastrado com sucesso!",
      user: newUser,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro interno ao cadastrar treinador.";
    console.error("Erro no cadastro:", error);

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}