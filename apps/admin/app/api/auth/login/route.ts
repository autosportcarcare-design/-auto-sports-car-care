import {
  api,
  checkOrigin,
  readJson,
} from "../../../../../storefront/lib/security";
import { login } from "../../../../../storefront/lib/auth";
export async function POST(request: Request) {
  return api(async () => {
    checkOrigin(request);
    return login(await readJson(request));
  });
}
