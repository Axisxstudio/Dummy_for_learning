import { createHash } from "crypto";

function md5(value: string) {
  return createHash("md5").update(value).digest("hex");
}

export function buildPayHereHash(params: {
  merchantId: string;
  orderId: string;
  amount: string;
  currency: string;
  merchantSecret: string;
}) {
  const secretHash = md5(params.merchantSecret).toUpperCase();
  return md5(
    `${params.merchantId}${params.orderId}${params.amount}${params.currency}${secretHash}`
  ).toUpperCase();
}

export function verifyPayHereMd5Sig(params: {
  merchantId: string;
  orderId: string;
  payhereAmount: string;
  payhereCurrency: string;
  statusCode: string;
  md5sig: string;
  merchantSecret: string;
}) {
  const secretHash = md5(params.merchantSecret).toUpperCase();
  const local = md5(
    `${params.merchantId}${params.orderId}${params.payhereAmount}${params.payhereCurrency}${params.statusCode}${secretHash}`
  ).toUpperCase();
  return local === params.md5sig.toUpperCase();
}
