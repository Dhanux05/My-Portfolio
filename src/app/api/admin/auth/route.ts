import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"; // Change this in production!

// POST - Verify admin password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({ success: true, token: ADMIN_PASSWORD });
    } else {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error verifying password:", error);
    return NextResponse.json(
      { error: "Failed to verify password" },
      { status: 500 }
    );
  }
}

