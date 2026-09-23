import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail e palavra-passe são obrigatórios." },
        { status: 400 }
      );
    }

    // Procura o treinador na tabela manager
    const users = await sql`
      SELECT "id", "name", "email", "password" 
      FROM "manager" 
      WHERE LOWER("email") = LOWER(${email})
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: "E-mail ou palavra-passe incorretos." },
        { status: 401 }
      );
    }

    const user = users[0];

    // Valida a palavra-passe encriptada
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "E-mail ou palavra-passe incorretos." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Login efetuado com sucesso!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno ao efetuar login." },
      { status: 500 }
    );
  }
}