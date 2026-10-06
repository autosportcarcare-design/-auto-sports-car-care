import { api, checkOrigin } from "../../../lib/security";
import { orders } from "../../../lib/account";
export async function GET(request: Request) {
  return api(async () => {
    return orders();
  });
}
