import { promises as fs } from "fs";
import path from "path";
import { config as defaultConfig } from "./config";

const CONFIG_FILE = path.join(process.cwd(), "data", "config.json");

export async function getConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, "utf-8");
    const jsonConfig = JSON.parse(data);
    // Merge with default config to ensure all fields exist
    return {
      ...defaultConfig,
      ...jsonConfig,
    };
  } catch {
    // If file doesn't exist, return default config
    return defaultConfig;
  }
}

