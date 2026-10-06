import { api, readJson, checkOrigin } from "../../../lib/security";
import { addresses, addAddress } from "../../../lib/account";
export async function GET(request: Request) {
  return api(async () => {
    return addresses();
  });
}
export async function POST(request: Request) {
  return api(async () => {
    checkOrigin(request);
    return addAddress(await readJson(request));
  });
}
