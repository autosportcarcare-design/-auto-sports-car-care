import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import { verifySignature } from "./signature";
describe("webhook authentication", () => {
  it("authenticates exact raw bytes only", () => {
    const raw = '{"eventId":"test-1"}';
    const signature = createHmac("sha256", "test-secret")
      .update(raw)
      .digest("hex");
    expect(verifySignature(raw, signature, "test-secret")).toBe(true);
    expect(verifySignature(raw + " ", signature, "test-secret")).toBe(false);
    expect(verifySignature(raw, signature, "other")).toBe(false);
  });
  it("rejects missing, malformed and truncated signatures", () => {
    for (const signature of ["", "abc", "0".repeat(63), "g".repeat(64)])
      expect(verifySignature("{}", signature, "test-secret")).toBe(false);
    expect(verifySignature("{}", "0".repeat(64), "")).toBe(false);
  });
});
