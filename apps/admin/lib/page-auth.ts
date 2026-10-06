import { currentUser } from "../../storefront/lib/security";
import { redirect } from "next/navigation";
export async function requirePageAdmin() {
  let user;
  try {
    user = await currentUser();
  } catch {
    redirect("/");
  }
  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) redirect("/");
  return user;
}
