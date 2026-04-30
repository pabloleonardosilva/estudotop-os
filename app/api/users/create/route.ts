/**
 * ARQUIVO: API para criar usuários
 * OBJETIVO: admin cria usuário no Supabase Auth e perfil em profiles.
 * ONDE MEXER: validações, papéis e mensagens de erro.
 * CUIDADO: usa service role; nunca mova para frontend.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

// Endpoint chamado pelo frontend para executar uma ação segura no servidor.
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Token não informado." },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Variáveis públicas do Supabase não configuradas." },
        { status: 500 }
      );
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const {
  data: { user: loggedUser },
  error: userError,
} = await supabaseAuth.auth.getUser(token);

    if (userError || !loggedUser) {
  return NextResponse.json(
    {
      error: `Usuário não autenticado. Detalhe: ${
        userError?.message || "token inválido ou sessão expirada"
      }`,
    },
    { status: 401 }
  );
}

    const { data: loggedProfile, error: profileLookupError } =
  await supabaseAuth
    .from("profiles")
    .select("role")
    .eq("id", loggedUser.id)
    .single();

    if (profileLookupError || !loggedProfile) {
  return NextResponse.json(
    {
      error: `Perfil do usuário logado não encontrado. ID autenticado: ${loggedUser.id}`,
    },
    { status: 403 }
  );
}

    if (loggedProfile.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem cadastrar usuários." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "").trim();
    const role = String(body.role || "").trim();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Preencha todos os campos." },
        { status: 400 }
      );
    }

    if (!["admin", "operator"].includes(role)) {
      return NextResponse.json(
        { error: "Função inválida." },
        { status: 400 }
      );
    }

    const { data: createdUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          role,
        },
      });

    if (createError || !createdUser.user) {
      return NextResponse.json(
        { error: createError?.message || "Erro ao criar usuário." },
        { status: 400 }
      );
    }

    const { error: profileError } = await supabaseAdmin.from("profiles").insert([
      {
        id: createdUser.user.id,
        name,
        role,
      },
    ]);

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Usuário criado com sucesso.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro interno." },
      { status: 500 }
    );
  }
}