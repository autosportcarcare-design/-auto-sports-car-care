import { api, readJson, checkOrigin } from "../../../../lib/security";
import { forgot } from "../../../../lib/auth";
export async function POST(request: Request) {
  return api(async () => {
    checkOrigin(request);
    return forgot(await readJson(request));
  });
}
