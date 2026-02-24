import os from "os";
import path from "path";
import { promises as fs } from "fs";

const envDir = process.env.ADMIN_DATA_DIR;
const cwdDir = path.join(process.cwd(), "data");
const tmpDir = path.join(os.tmpdir(), "my-portfolio-admin-data");

const dataDirs = [envDir, cwdDir, tmpDir].filter((dir): dir is string => Boolean(dir));

export async function readAdminJson<T>(fileName: string, fallback: T): Promise<T> {
  for (const dir of dataDirs) {
    const filePath = path.join(dir, fileName);
    try {
      const data = await fs.readFile(filePath, "utf-8");
      return JSON.parse(data) as T;
    } catch {
      // Keep trying other locations.
    }
  }

  return fallback;
}

export async function writeAdminJson(fileName: string, data: unknown) {
  let lastError: unknown;

  for (const dir of dataDirs) {
    const filePath = path.join(dir, fileName);
    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("No writable storage location available");
}
