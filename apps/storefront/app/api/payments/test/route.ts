import { api, readJson, checkOrigin } from "../../../../lib/security";
import { testPayment } from "../../../../lib/payment";
export async function POST(request: Request) {
  return api(async () => {
    checkOrigin(request);
    return testPayment(await readJson(request));
  });
}
