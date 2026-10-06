import { api, readBody } from "../../../../lib/security";
import { paymentWebhook } from "../../../../lib/payment";
export async function POST(request: Request) {
  return api(async () =>
    paymentWebhook(
      await readBody(request, 65536),
      request.headers.get("x-payment-signature") ?? "",
    ),
  );
}
