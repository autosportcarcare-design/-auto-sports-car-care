import { db } from "../../packages/database/src/client";
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
if (!email)
  throw new Error("Set ADMIN_EMAIL to the existing verified owner account.");
try {
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.active || !user.emailVerifiedAt)
    throw new Error("An active, verified account is required.");
  await db.$transaction(async (tx) => {
    await tx.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
    await tx.auditLog.create({
      data: {
        actorId: user.id,
        action: "ADMIN_BOOTSTRAP",
        entityType: "User",
        entityId: user.id,
        beforeData: { role: user.role },
        afterData: { role: "ADMIN" },
      },
    });
  });
  console.log("Configured verified account now has administrator access.");
} finally {
  await db.$disconnect();
}
