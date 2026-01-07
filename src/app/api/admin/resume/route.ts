import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { config } from "@/data/config";

const CONFIG_FILE = path.join(process.cwd(), "data", "config.json");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"; // Change this in production!

// Schema for resume link validation
const ResumeSchema = z.object({
  resume: z.string().url("Resume link must be a valid URL"),
});

// Helper to read config from JSON or fallback to TS
async function getConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    // If file doesn't exist, return default config
    return { resume: config.resume };
  }
}

// Helper to write config to JSON
async function saveConfig(configData: { resume: string }) {
  await fs.mkdir(path.dirname(CONFIG_FILE), { recursive: true });
  await fs.writeFile(CONFIG_FILE, JSON.stringify(configData, null, 2));
}

// Verify admin password
function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;
  const token = authHeader.replace("Bearer ", "");
  return token === ADMIN_PASSWORD;
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
export async function PUT(request: NextRequest) {
  if (!verifyAuth(request)) {
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

