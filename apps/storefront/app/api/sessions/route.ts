import { api, readJson, checkOrigin } from "../../../lib/security";
import { revokeSession } from "../../../lib/account";
export async function DELETE(request: Request) {
  return api(async () => {
    checkOrigin(request);
    return revokeSession(await readJson(request));
  });
}
