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
