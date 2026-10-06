import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
export function hashPassword(password: string): string {
  if (password.length < 12 || password.length > 128)
    throw new Error("INVALID_PASSWORD");
  const salt = randomBytes(16).toString("hex");
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
export function verifyPassword(password: string, encoded: string): boolean {
  const [algorithm, salt, hash] = encoded.split(":");
  if (algorithm !== "scrypt" || !salt || !hash || password.length > 128)
    return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(actual, expected);
}
export function opaqueToken(): string {
  return randomBytes(32).toString("hex");
}
export function digest(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
