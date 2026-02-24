import { NextRequest, NextResponse } from "next/server";
import { createAdminToken, verifyAdminPassword } from "@/lib/admin-auth";

// POST - Verify admin password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (verifyAdminPassword(password)) {
      return NextResponse.json({ success: true, token: createAdminToken() });
    }

    return NextResponse.json(
      { error: "Invalid password" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Error verifying password:", error);
    return NextResponse.json(
      { error: "Failed to verify password" },
      { status: 500 }
    );
  }
}
