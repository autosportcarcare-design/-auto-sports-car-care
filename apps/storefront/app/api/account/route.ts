import { api, checkOrigin } from "../../../lib/security";
import { account } from "../../../lib/account";
export async function GET(request: Request) {
  return api(async () => {
    return account();
  });
}
