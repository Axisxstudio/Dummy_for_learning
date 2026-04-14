import twilio from "twilio";

type OrderLine = {
  product_name: string;
  quantity: number;
  subtotal: number;
};

type NotifyAdminParams = {
  orderRef: string;
  customerEmail: string;
  totalAmount: number;
  items: OrderLine[];
};

function formatOrderMessage(params: NotifyAdminParams) {
  const itemLines = params.items
    .slice(0, 5)
    .map(
      (item, index) =>
        `${index + 1}. ${item.product_name} x${item.quantity} - LKR ${item.subtotal.toLocaleString()}`
    )
    .join("\n");

  const extraCount = Math.max(0, params.items.length - 5);
  const extraSuffix = extraCount ? `\n+${extraCount} more item(s)` : "";

  return [
    "New order received",
    `Order: ${params.orderRef}`,
    `Customer: ${params.customerEmail}`,
    `Total: LKR ${params.totalAmount.toLocaleString()}`,
    "",
    "Items:",
    itemLines || "No items",
    extraSuffix
  ]
    .filter(Boolean)
    .join("\n");
}

export async function notifyAdminOnWhatsApp(params: NotifyAdminParams) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const to = process.env.ADMIN_WHATSAPP_TO;

  if (!accountSid || !authToken || !from || !to) {
    return { sent: false as const, reason: "missing-config" as const };
  }

  const client = twilio(accountSid, authToken);
  const body = formatOrderMessage(params);

  const message = await client.messages.create({
    from,
    to,
    body
  });

  return { sent: true as const, sid: message.sid };
}
