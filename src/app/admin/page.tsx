"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Project } from "@/data/projects";
import { Trash2, Edit, Plus, Save, X, Lock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [resumeLink, setResumeLink] = useState("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const clearSession = () => {
    setAuthToken(null);
    setIsAuthenticated(false);
    setProjects([]);
    setResumeLink("");
  };

  useEffect(() => {
    clearSession();
  }, []);

  const fetchData = async (token: string) => {
    try {
      setLoading(true);
      const [projectsRes, resumeRes] = await Promise.all([
        fetch("/api/admin/projects", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/admin/resume"),
      ]);

      if (projectsRes.status === 401) {
        clearSession();
        toast({
          title: "Session expired",
          description: "Please log in again.",
        });
        return;
      }

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData.projects || []);
      }

      if (resumeRes.ok) {
        const resumeData = await resumeRes.json();
        const nextResume = resumeData.resume || "";
        setResumeLink(nextResume);
        if (nextResume) {
          localStorage.setItem("resumeLink", nextResume);
        }
      } else {
        const cachedResume = localStorage.getItem("resumeLink");
        if (cachedResume) {
          setResumeLink(cachedResume);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.token);
        setIsAuthenticated(true);
        fetchData(data.token);
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Invalid password",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Failed to login",
      });
    }
  };

  const handleLogout = () => {
    clearSession();
  };

  const handleSaveResume = async () => {
    if (!authToken) return;

    try {
      const response = await fetch("/api/admin/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ resume: resumeLink }),
      });

      if (response.ok) {
        localStorage.setItem("resumeLink", resumeLink);
        toast({
          title: "Success",
          description: "Resume link updated successfully",
        });
      } else {
        const error = await response.json().catch(() => ({}));
        toast({
          title: "Error",
          description: error.error || "Failed to update resume link",
        });
      }
    } catch (error) {
      console.error("Error updating resume:", error);
      toast({
        title: "Error",
        description: "Failed to update resume link",
      });
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!authToken || !confirm("Are you sure you want to delete this project?"))
      return;

    try {
      const response = await fetch(`/api/admin/projects?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        setProjects(projects.filter((p) => p.id !== id));
        toast({
          title: "Success",
          description: "Project deleted successfully",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to delete project",
        });
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project",
      });
    }
  };

  const handleSaveProject = async (projectData: Partial<Project>) => {
    if (!authToken) return;

    try {
      const url = "/api/admin/projects";
      const method = editingProject ? "PUT" : "POST";
      const body = editingProject
        ? {
            id: editingProject.id,
            ...projectData,
            skills: projectData.skills || editingProject.skills,
          }
        : {
            ...projectData,
            skills: projectData.skills || { frontend: [], backend: [] },
          };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        if (editingProject) {
          setProjects(
            projects.map((p) => (p.id === editingProject.id ? data.project : p))
          );
        } else {
          setProjects([...projects, data.project]);
        }
        setEditingProject(null);
        setIsAddingProject(false);
        toast({
          title: "Success",
          description: `Project ${editingProject ? "updated" : "added"} successfully`,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to save project",
        });
      }
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        title: "Error",
        description: "Failed to save project",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-zinc-100 p-4">
        <div className="w-full max-w-md p-8 border border-zinc-700 rounded-lg bg-zinc-800">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Admin Login</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="mt-2 bg-zinc-900 border-zinc-600"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
          <p className="mt-4 text-xs text-zinc-500 text-center">
            Configure `ADMIN_PASSWORD` in your `.env.local` file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="space-y-8">
            {/* Resume Link Section */}
            <section className="p-6 border border-zinc-700 rounded-lg bg-zinc-800">
              <h2 className="text-2xl font-semibold mb-4">Resume Link</h2>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="resume">Resume URL</Label>
                  <Input
                    id="resume"
                    type="url"
                    value={resumeLink}
                    onChange={(e) => setResumeLink(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="mt-2 bg-zinc-900 border-zinc-600"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSaveResume}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </section>

            {/* Projects Section */}
            <section className="p-6 border border-zinc-700 rounded-lg bg-zinc-800">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Projects</h2>
                <Button
                  onClick={() => {
                    setIsAddingProject(true);
                    setEditingProject(null);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </Button>
              </div>

              {/* Project Form */}
              {(isAddingProject || editingProject) && (
                <ProjectForm
                  project={editingProject}
                  onSave={handleSaveProject}
                  onCancel={() => {
                    setIsAddingProject(false);
                    setEditingProject(null);
                  }}
                />
              )}

              {/* Projects List */}
              <div className="mt-6 space-y-4">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={() => {
                      setEditingProject(project);
                      setIsAddingProject(false);
                    }}
                    onDelete={handleDeleteProject}
                  />
                ))}
                {projects.length === 0 && (
                  <p className="text-zinc-500 text-center py-8">
                    No projects found. Add your first project!
                  </p>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}

function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="p-4 border border-zinc-600 rounded-lg bg-zinc-900">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-xl font-semibold">{project.title}</h3>
          <p className="text-sm text-zinc-400 mt-1">{project.category}</p>
          <p className="text-sm text-zinc-500 mt-2">
            ID: {project.id} | Live: {project.live}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onEdit} variant="outline" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => onDelete(project.id)}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProjectForm({
  project,
  onSave,
  onCancel,
}: {
  project: Project | null;
  onSave: (data: Partial<Project>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    id: project?.id || "",
    category: project?.category || "",
    title: project?.title || "",
    src: project?.src || "",
    screenshots: project?.screenshots?.join(", ") || "",
    github: project?.github || "",
    live: project?.live || "",
    content: typeof project?.content === "string" ? project.content : "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedSrc = formData.src.startsWith("/")
      ? formData.src
      : `/${formData.src}`;

    onSave({
      ...formData,
      src: normalizedSrc,
      screenshots: formData.screenshots
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      skills: project?.skills || { frontend: [], backend: [] },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border border-zinc-600 rounded-lg bg-zinc-900 mb-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="id">Project ID</Label>
          <Input
            id="id"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            className="mt-2 bg-zinc-800 border-zinc-600"
            required
            disabled={!!project}
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="mt-2 bg-zinc-800 border-zinc-600"
            required
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="mt-2 bg-zinc-800 border-zinc-600"
            required
          />
        </div>
        <div>
          <Label htmlFor="src">Image Source</Label>
          <Input
            id="src"
            value={formData.src}
            onChange={(e) => setFormData({ ...formData, src: e.target.value })}
            className="mt-2 bg-zinc-800 border-zinc-600"
            placeholder="/assets/projects-screenshots/project/1.png"
            required
          />
          <p className="text-xs text-zinc-500 mt-1">
            Path must start with / and be relative to public folder
          </p>
          {formData.src && (
            <div className="mt-2">
              <p className="text-xs text-zinc-400 mb-1">Preview:</p>
              <div className="relative w-full h-32 border border-zinc-600 rounded overflow-hidden bg-zinc-800">
                <img
                  src={formData.src}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.parentElement!.innerHTML = `
                      <div class="flex items-center justify-center h-full text-zinc-500 text-xs">
                        Image not found. Make sure the path is correct.
                      </div>
                    `;
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="screenshots">Screenshots (comma-separated)</Label>
          <Input
            id="screenshots"
            value={formData.screenshots}
            onChange={(e) =>
              setFormData({ ...formData, screenshots: e.target.value })
            }
            className="mt-2 bg-zinc-800 border-zinc-600"
            placeholder="1.png, 2.png, 3.png"
          />
        </div>
        <div>
          <Label htmlFor="github">GitHub URL (optional)</Label>
          <Input
            id="github"
            type="url"
            value={formData.github}
            onChange={(e) =>
              setFormData({ ...formData, github: e.target.value })
            }
            className="mt-2 bg-zinc-800 border-zinc-600"
            placeholder="https://github.com/..."
          />
        </div>
        <div>
          <Label htmlFor="live">Live URL</Label>
          <Input
            id="live"
            type="url"
            value={formData.live}
            onChange={(e) => setFormData({ ...formData, live: e.target.value })}
            className="mt-2 bg-zinc-800 border-zinc-600"
            placeholder="https://example.com"
            required
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="content">Content Description</Label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            className="mt-2 w-full min-h-[100px] p-3 rounded-md border border-zinc-600 bg-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            placeholder="Project description..."
          />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </form>
  );
}
