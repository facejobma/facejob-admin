import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const authorization = request.headers.get("authorization");

  if (!backendUrl) {
    return NextResponse.json(
      { message: "URL de l'API non configuree" },
      { status: 500 },
    );
  }

  if (!authorization) {
    return NextResponse.json(
      { message: "Token d'authentification manquant" },
      { status: 401 },
    );
  }

  const response = await fetch(
    `${backendUrl}/api/v1/admin/candidates/active/export`,
    {
      method: "GET",
      headers: {
        Authorization: authorization,
        Accept: "text/csv",
      },
      cache: "no-store",
    },
  );

  const body = await response.arrayBuffer();

  return new NextResponse(body, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("content-type") || "text/csv; charset=UTF-8",
      "Content-Disposition":
        response.headers.get("content-disposition") ||
        'attachment; filename="candidats_actifs.csv"',
    },
  });
}
