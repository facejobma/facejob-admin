import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // todo nothing for now
}

export const config = { matcher: ["/dashboard/:path*"] };
