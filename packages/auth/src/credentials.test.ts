import { test } from "node:test";
import assert from "node:assert/strict";
import {
  hashPassword,
  verifyPassword,
  opaqueToken,
  digest,
} from "./credentials.ts";
test("password hashing is salted and rejects incorrect input", () => {
  const a = hashPassword("correct-password-123");
  const b = hashPassword("correct-password-123");
  assert.notEqual(a, b);
  assert.ok(verifyPassword("correct-password-123", a));
  assert.equal(verifyPassword("incorrect-password", a), false);
  assert.equal(verifyPassword("correct-password-123", "broken"), false);
  assert.throws(() => hashPassword("short"));
});
test("session bearer token and stored digest differ", () => {
  const token = opaqueToken();
  assert.equal(token.length, 64);
  assert.notEqual(token, digest(token));
});
