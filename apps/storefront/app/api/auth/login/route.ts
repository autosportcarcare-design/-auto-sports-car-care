import { api, readJson, checkOrigin } from "../../../../lib/security";
import { login } from "../../../../lib/auth";
export async function POST(request: Request) {
  return api(async () => {
    checkOrigin(request);
    return login(await readJson(request));
  });
}
