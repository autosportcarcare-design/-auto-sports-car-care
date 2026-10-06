import { api, readJson, checkOrigin } from "../../../../lib/security";
import { verify } from "../../../../lib/auth";
export async function POST(request: Request) {
  return api(async () => {
    checkOrigin(request);
    return verify(await readJson(request));
  });
}
