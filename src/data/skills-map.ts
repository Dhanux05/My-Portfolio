// Map skill keys to skill objects for JSON deserialization
import { Skill } from "./projects";
import { PROJECT_SKILLS } from "./projects";

// Create a map of skill keys to skill objects
export const SKILLS_MAP: Record<string, Skill> = {
  next: PROJECT_SKILLS.next,
  chakra: PROJECT_SKILLS.chakra,
  node: PROJECT_SKILLS.node,
  python: PROJECT_SKILLS.python,
  prisma: PROJECT_SKILLS.prisma,
  postgres: PROJECT_SKILLS.postgres,
  mongo: PROJECT_SKILLS.mongo,
  express: PROJECT_SKILLS.express,
  reactQuery: PROJECT_SKILLS.reactQuery,
  shadcn: PROJECT_SKILLS.shadcn,
  aceternity: PROJECT_SKILLS.aceternity,
  tailwind: PROJECT_SKILLS.tailwind,
  docker: PROJECT_SKILLS.docker,
  yjs: PROJECT_SKILLS.yjs,
  firebase: PROJECT_SKILLS.firebase,
  sockerio: PROJECT_SKILLS.sockerio,
  js: PROJECT_SKILLS.js,
  ts: PROJECT_SKILLS.ts,
  vue: PROJECT_SKILLS.vue,
  react: PROJECT_SKILLS.react,
  sanity: PROJECT_SKILLS.sanity,
  spline: PROJECT_SKILLS.spline,
  gsap: PROJECT_SKILLS.gsap,
  framerMotion: PROJECT_SKILLS.framerMotion,
  supabase: PROJECT_SKILLS.supabase,
  vite: PROJECT_SKILLS.vite,
  openai: PROJECT_SKILLS.openai,
  netlify: PROJECT_SKILLS.netlify,
  html: PROJECT_SKILLS.html,
  css: PROJECT_SKILLS.css,
  bootstrap: PROJECT_SKILLS.bootstrap,
  maven: PROJECT_SKILLS.maven,
  java: PROJECT_SKILLS.java,
  cplusplus: PROJECT_SKILLS.cplusplus,
  arduino: PROJECT_SKILLS.arduino,
};

// Helper to convert skill keys to skill objects
export function reconstructSkills(skillKeys: string[]): Skill[] {
  return skillKeys
    .map((key) => SKILLS_MAP[key])
    .filter((skill) => skill !== undefined);
}

