import { OrdersView } from "../../../../components/account-view";
export default async function Page({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  return <OrdersView orderNumber={orderNumber} confirmation />;
}
