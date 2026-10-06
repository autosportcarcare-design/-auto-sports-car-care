import { cookies } from "next/headers";
import { db } from "@autosport/database";
import { randomUUID } from "node:crypto";
import { digest } from "../../../packages/auth/src/credentials";
export class ApiError extends Error {
  constructor(
    public code: string,
    public status = 400,
  ) {
    super(code);
  }
}
export async function currentUser() {
  const token = (await cookies()).get("ascc_session")?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: digest(token) },
    include: { user: { include: { customer: true } } },
  });
  return session &&
    !session.revokedAt &&
    session.expiresAt > new Date() &&
    session.user.active
    ? session.user
    : null;
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new ApiError("AUTH_REQUIRED", 401);
  return user;
}
export async function requireCustomer() {
  const user = await requireUser();
  if (!user.customer) throw new ApiError("CUSTOMER_REQUIRED", 403);
  return user.customer;
}
export async function requireAdmin() {
  const user = await requireUser();
  if (!["ADMIN", "SUPER_ADMIN"].includes(user.role))
    throw new ApiError("FORBIDDEN", 403);
  return user;
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const configured = process.env.APP_ORIGIN;
  if (!configured) throw new ApiError("SERVER_NOT_CONFIGURED", 503);
  if (origin !== configured && origin !== process.env.ADMIN_ORIGIN)
    throw new ApiError("INVALID_ORIGIN", 403);
}
export async function api(action: () => Promise<unknown>) {
  const requestId = randomUUID();
  try {
    return Response.json(await action(), {
      headers: { "Cache-Control": "no-store", "X-Request-ID": requestId },
    });
  } catch (error) {
    if (error instanceof ApiError)
      return Response.json(
        { error: error.code, requestId },
        { status: error.status },
      );
    if (error instanceof Error && error.name === "ZodError")
      return Response.json(
        { error: "INVALID_INPUT", requestId },
        { status: 400 },
      );
    console.error(
      JSON.stringify({
        event: "request_failed",
        requestId,
        errorType: error instanceof Error ? error.name : "unknown",
        code:
          typeof error === "object" && error !== null && "code" in error
            ? String(error.code)
            : undefined,
      }),
    );
    return Response.json(
      { error: "REQUEST_FAILED", requestId },
      { status: 500 },
    );
  }
}

export async function readBody(
  request: Request,
  maxBytes = 16384,
): Promise<string> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > maxBytes) {
      await reader.cancel();
      throw new ApiError("PAYLOAD_TOO_LARGE", 413);
    }
    chunks.push(value);
  }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(result);
}
export async function readJson(request: Request): Promise<unknown> {
  try {
    return JSON.parse(await readBody(request)) as unknown;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("INVALID_JSON");
  }
}
