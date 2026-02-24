import crypto from "crypto";
import { NextRequest } from "next/server";

const DEFAULT_ADMIN_PASSWORD_HASH =
  "581837f0466067924f7e702edfae38844fc40c85e3c1bae9cb82cdca6e86e2fa";
const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH || DEFAULT_ADMIN_PASSWORD_HASH;
const TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || ADMIN_PASSWORD_HASH;
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

type AdminTokenPayload = {
  exp: number;
};

function signPayload(payload: string) {
  return crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("base64url");
}

export function verifyAdminPassword(password: string) {
  if (!password) {
    return false;
  }

  const receivedHash = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  const receivedBuffer = Buffer.from(receivedHash, "utf-8");
  const expectedBuffer = Buffer.from(ADMIN_PASSWORD_HASH, "utf-8");

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

export function createAdminToken() {
  const payload: AdminTokenPayload = { exp: Date.now() + TOKEN_TTL_MS };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyAdminToken(token: string) {
  if (!token) {
    return false;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = signPayload(encodedPayload);

  try {
    const signatureBuffer = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedSignatureBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
    ) {
      return false;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf-8")) as AdminTokenPayload;
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function getBearerToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return "";
  }

  return authHeader.slice("Bearer ".length).trim();
}

export function verifyAdminRequest(request: NextRequest) {
  const token = getBearerToken(request);
  return verifyAdminToken(token);
}
