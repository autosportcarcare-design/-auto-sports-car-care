import { api, readJson, checkOrigin } from "../../../lib/security";
import {
  cartDetail,
  setCartItem,
  removeCartItem,
  wishlistDetail,
  setWishlist,
} from "../../../lib/cart";
export async function GET(request: Request) {
  return api(async () => {
    return wishlistDetail();
  });
}
export async function POST(request: Request) {
  return api(async () => {
    checkOrigin(request);
    return setWishlist(await readJson(request));
  });
}
export async function DELETE(request: Request) {
  return api(async () => {
    checkOrigin(request);
    return setWishlist(await readJson(request), true);
  });
}
