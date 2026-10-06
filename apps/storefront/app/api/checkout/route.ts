import { api, readJson, checkOrigin } from "../../../lib/security";
import { checkout } from "../../../lib/checkout";
export async function POST(request: Request) {
  return api(async () => {
    checkOrigin(request);
    return checkout(await readJson(request));
  });
}
