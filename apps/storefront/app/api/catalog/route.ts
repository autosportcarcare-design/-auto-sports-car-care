import { api } from "../../../lib/security";
import { searchCatalog } from "../../../lib/catalog";
export async function GET(request: Request) {
  return api(() =>
    searchCatalog(Object.fromEntries(new URL(request.url).searchParams)),
  );
}
