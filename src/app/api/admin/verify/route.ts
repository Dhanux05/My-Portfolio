import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    if (verifyAdminRequest(request)) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } catch (error) {
    console.error("Error verifying admin token:", error);
    return NextResponse.json({ error: "Failed to verify token" }, { status: 500 });
  }
}
