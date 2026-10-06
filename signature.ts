import { createHmac, timingSafeEqual } from "node:crypto";
export function verifySignature(
  body: string,
  signature: string,
  secret: string,
): boolean {
  if (!secret || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = Buffer.from(
    createHmac("sha256", secret).update(body).digest("hex"),
    "hex",
  );
  const received = Buffer.from(signature, "hex");
  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}
