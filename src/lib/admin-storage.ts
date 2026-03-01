import os from "os";
import path from "path";
import { promises as fs } from "fs";

const envDir = process.env.ADMIN_DATA_DIR;
const cwdDir = path.join(process.cwd(), "data");
const tmpDir = path.join(os.tmpdir(), "my-portfolio-admin-data");
const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/+$/, "");
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redisKeyPrefix = process.env.ADMIN_STORAGE_PREFIX || "portfolio:admin";

const dataDirs = [envDir, cwdDir, tmpDir].filter((dir): dir is string => Boolean(dir));
const hasRedisConfig = Boolean(redisUrl && redisToken);

type RedisResponse<T> = {
  result?: T;
  error?: string;
};

function getRedisKey(fileName: string) {
  return `${redisKeyPrefix}:${fileName}`;
}

async function readFromRedis<T>(fileName: string): Promise<T | undefined> {
  if (!hasRedisConfig) return undefined;

  const key = encodeURIComponent(getRedisKey(fileName));
  const response = await fetch(`${redisUrl}/get/${key}`, {
    headers: { Authorization: `Bearer ${redisToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Redis read failed (${response.status})`);
  }

  const payload = (await response.json()) as RedisResponse<string | null>;
  if (payload.error) {
    throw new Error(payload.error);
  }

  if (!payload.result) {
    return undefined;
  }

  return JSON.parse(payload.result) as T;
}

async function writeToRedis(fileName: string, data: unknown) {
  if (!hasRedisConfig) return false;

  const key = encodeURIComponent(getRedisKey(fileName));
  const response = await fetch(`${redisUrl}/set/${key}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${redisToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Redis write failed (${response.status})`);
  }

  const payload = (await response.json()) as RedisResponse<string>;
  if (payload.error) {
    throw new Error(payload.error);
  }

  return true;
}

export async function readAdminJson<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const fromRedis = await readFromRedis<T>(fileName);
    if (fromRedis !== undefined) {
      return fromRedis;
    }
  } catch {
    // Fallback to filesystem storage when Redis is unavailable.
  }

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

  try {
    const wroteToRedis = await writeToRedis(fileName, data);
    if (wroteToRedis) {
      return;
    }
  } catch (error) {
    lastError = error;
  }

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
