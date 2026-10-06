import { api, readJson, checkOrigin } from "../../../../lib/security";
import { register } from "../../../../lib/auth";
export async function POST(request: Request) {
  return api(async () => {
    checkOrigin(request);
    return register(await readJson(request));
  });
}
