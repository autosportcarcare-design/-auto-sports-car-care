import { api, readJson, checkOrigin } from "../../../../lib/security";
import { reset } from "../../../../lib/auth";
export async function POST(request: Request) {
  return api(async () => {
    checkOrigin(request);
    return reset(await readJson(request));
  });
}
