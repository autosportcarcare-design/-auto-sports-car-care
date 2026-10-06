import { api, checkOrigin } from "../../../../lib/security";
import { logout } from "../../../../lib/auth";
export async function POST(request: Request) {
  return api(async () => {
    checkOrigin(request);
    return logout();
  });
}
