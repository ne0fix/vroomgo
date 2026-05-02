import { MercadoPagoConfig, Preference, Payment, PaymentRefund } from 'mercadopago';

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
if (!accessToken) {
  console.warn("MERCADO_PAGO_ACCESS_TOKEN não configurado. Pagamentos falharão.");
}

export const mpClient = new MercadoPagoConfig({
  accessToken: accessToken || 'TEST-placeholder',
});

export const mpPreference = new Preference(mpClient);
export const mpPayment = new Payment(mpClient);
export const mpRefund = new PaymentRefund(mpClient);

// Busca order pelo ID no novo endpoint /v1/orders
export async function getOrder(orderId: string) {
  const res = await fetch(`https://api.mercadopago.com/v1/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Erro ao buscar order: ${res.status}`);
  return res.json();
}

// Busca order pelo payment ID (PAY...) listando orders com filtro
export async function getOrderByPaymentId(paymentId: string) {
  const res = await fetch(
    `https://api.mercadopago.com/v1/orders/search?payment_id=${paymentId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`Erro ao buscar order por payment: ${res.status}`);
  const data = await res.json();
  return data?.elements?.[0] ?? null;
}
