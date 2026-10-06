import {
  api,
  readJson,
  checkOrigin,
} from "../../../../../storefront/lib/security";
import { readAdmin, mutateAdmin } from "../../../../lib/service";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ kind: string }> },
) {
  return api(async () => readAdmin((await params).kind));
}
export async function POST(
  request: Request,
  { params }: { params: Promise<{ kind: string }> },
) {
  return api(async () => {
    checkOrigin(request);
    return mutateAdmin((await params).kind, await readJson(request));
  });
}
