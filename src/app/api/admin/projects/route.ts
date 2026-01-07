import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import projects from "@/data/projects";
import { Project } from "@/data/projects";

const PROJECTS_FILE = path.join(process.cwd(), "data", "projects.json");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"; // Change this in production!

// Schema for project validation
const ProjectSchema = z.object({
  id: z.string(),
  category: z.string(),
  title: z.string(),
  src: z.string(),
  screenshots: z.array(z.string()),
  skills: z.object({
    frontend: z.array(z.any()),
    backend: z.array(z.any()),
  }),
  github: z.string().optional(),
  live: z.string(),
  content: z.string(), // Store as string, will be converted to ReactNode
});

// Helper to read projects from JSON or fallback to TS
async function getProjects(): Promise<Project[]> {
  try {
    const data = await fs.readFile(PROJECTS_FILE, "utf-8");
    const jsonProjects = JSON.parse(data);
    // Ensure all projects have required fields
    return jsonProjects.map((p: any) => ({
      ...p,
      src: p.src || "/assets/7.png", // Fallback to default image
      skills: p.skills || { frontend: [], backend: [] },
      screenshots: p.screenshots || [],
      content: p.content || "",
    }));
  } catch {
    // If file doesn't exist, return default projects
    return projects;
  }
}

// Helper to write projects to JSON
async function saveProjects(projectsData: Project[]) {
  await fs.mkdir(path.dirname(PROJECTS_FILE), { recursive: true });
  // Clean projects for JSON serialization (remove ReactNode objects)
  const cleanProjects = projectsData.map((p) => {
    // Skills with ReactNode objects can't be serialized, so save empty arrays
    // Skills will need to be managed separately or added manually
    return {
      id: p.id,
      category: p.category,
      title: p.title,
      src: p.src,
      screenshots: p.screenshots || [],
      skills: {
        frontend: [],
        backend: [],
      },
      github: p.github,
      live: p.live,
      content: typeof p.content === "string" ? p.content : "",
    };
  });
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(cleanProjects, null, 2));
}

// Verify admin password
function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;
  const token = authHeader.replace("Bearer ", "");
  return token === ADMIN_PASSWORD;
}

// GET - Fetch all projects
export async function GET(request: NextRequest) {
  try {
    const projectsData = await getProjects();
    return NextResponse.json({ projects: projectsData });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST - Add new project
export async function POST(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = ProjectSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid project data", details: validation.error },
        { status: 400 }
      );
    }

    const projectsData = await getProjects();
    // Ensure src path starts with /
    const normalizedSrc = validation.data.src.startsWith("/") 
      ? validation.data.src 
      : `/${validation.data.src}`;
    
    const newProject: Project = {
      ...validation.data,
      src: normalizedSrc,
      content: validation.data.content || "",
      skills: validation.data.skills || { frontend: [], backend: [] },
    };

    // Check if project with same ID exists
    if (projectsData.find((p) => p.id === newProject.id)) {
      return NextResponse.json(
        { error: "Project with this ID already exists" },
        { status: 400 }
      );
    }

    projectsData.push(newProject);
    await saveProjects(projectsData);

    return NextResponse.json({ success: true, project: newProject });
  } catch (error) {
    console.error("Error adding project:", error);
    return NextResponse.json(
      { error: "Failed to add project" },
      { status: 500 }
    );
  }
}

// PUT - Update existing project
export async function PUT(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const validation = ProjectSchema.partial().safeParse(updateData);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid project data", details: validation.error },
        { status: 400 }
      );
    }

    const projectsData = await getProjects();
    const projectIndex = projectsData.findIndex((p) => p.id === id);

    if (projectIndex === -1) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Normalize src path if provided
    if (updateData.src && !updateData.src.startsWith("/")) {
      updateData.src = `/${updateData.src}`;
    }
    
    projectsData[projectIndex] = {
      ...projectsData[projectIndex],
      ...updateData,
      skills: updateData.skills || projectsData[projectIndex].skills,
    };

    await saveProjects(projectsData);

    return NextResponse.json({
      success: true,
      project: projectsData[projectIndex],
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE - Delete project
export async function DELETE(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const projectsData = await getProjects();
    const filteredProjects = projectsData.filter((p) => p.id !== id);

    if (filteredProjects.length === projectsData.length) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    await saveProjects(filteredProjects);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}

