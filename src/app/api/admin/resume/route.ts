import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { config } from "@/data/config";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { readAdminJson, writeAdminJson } from "@/lib/admin-storage";

export const dynamic = "force-dynamic";

// Schema for resume link validation
const ResumeSchema = z.object({
  resume: z.string().trim().url("Resume link must be a valid URL"),
});

// Helper to read config from JSON or fallback to TS
async function getConfig() {
  return readAdminJson("config.json", { resume: config.resume });
}

// Helper to write config to JSON
async function saveConfig(configData: { resume: string }) {
  await writeAdminJson("config.json", configData);
}

// GET - Fetch resume link
export async function GET() {
  try {
    const configData = await getConfig();
    return NextResponse.json({ resume: configData.resume });
  } catch (error) {
    console.error("Error fetching resume link:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume link" },
      { status: 500 }
    );
  }
}

// PUT - Update resume link
async function updateResume(request: NextRequest) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = ResumeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid resume link", details: validation.error },
        { status: 400 }
      );
    }

    const configData = await getConfig();
    configData.resume = validation.data.resume;
    await saveConfig(configData);

    return NextResponse.json({ success: true, resume: configData.resume });
  } catch (error) {
    console.error("Error updating resume link:", error);
    return NextResponse.json(
      { error: "Failed to update resume link" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return updateResume(request);
}

export async function POST(request: NextRequest) {
  return updateResume(request);
}
