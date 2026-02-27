import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import projects from "@/data/projects";
import { Project } from "@/data/projects";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { readAdminJson, writeAdminJson } from "@/lib/admin-storage";

export const dynamic = "force-dynamic";

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
  content: z.string(),
});

function normalizeProject(p: any): Project {
  return {
    ...p,
    src: p.src || "/assets/7.png",
    skills: p.skills || { frontend: [], backend: [] },
    screenshots: Array.isArray(p.screenshots) ? p.screenshots : [],
    content: typeof p.content === "string" ? p.content : "",
  };
}

function getDefaultProjects(): Project[] {
  return projects.map((project) =>
    normalizeProject({
      ...project,
      skills: { frontend: [], backend: [] },
      content: typeof project.content === "string" ? project.content : "",
    })
  );
}

// Helper to read projects from JSON or fallback to TS
async function getProjects(): Promise<Project[]> {
  const storedProjects = await readAdminJson<any[]>("projects.json", getDefaultProjects());
  return storedProjects.map(normalizeProject);
}

// Helper to write projects to JSON
async function saveProjects(projectsData: Project[]) {
  const cleanProjects = projectsData.map((p) => ({
    id: p.id,
    category: p.category,
    title: p.title,
    src: p.src,
    screenshots: p.screenshots || [],
    skills: p.skills || { frontend: [], backend: [] },
    github: p.github,
    live: p.live,
    content: typeof p.content === "string" ? p.content : "",
  }));

  await writeAdminJson("projects.json", cleanProjects);
}

// GET - Fetch all projects
export async function GET() {
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
  if (!verifyAdminRequest(request)) {
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
    const normalizedSrc = validation.data.src.startsWith("/")
      ? validation.data.src
      : `/${validation.data.src}`;

    const newProject: Project = {
      ...validation.data,
      src: normalizedSrc,
      content: validation.data.content || "",
      skills: validation.data.skills || { frontend: [], backend: [] },
    };

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
  if (!verifyAdminRequest(request)) {
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

    if (updateData.src && !updateData.src.startsWith("/")) {
      updateData.src = `/${updateData.src}`;
    }

    projectsData[projectIndex] = normalizeProject({
      ...projectsData[projectIndex],
      ...updateData,
      skills: updateData.skills || projectsData[projectIndex].skills,
    });

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
  if (!verifyAdminRequest(request)) {
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
