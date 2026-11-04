/**
 * Adresy powrotu od operatora płatności. Aplikacja mobilna otwiera płatność w przeglądarce
 * systemowej, gdzie nie ma sesji eksperta, więc wraca na publiczną stronę zamiast do panelu.
 */
export function paymentReturnUrls(baseUrl: string, orderId: string, mobile?: boolean) {
  if (mobile) {
    return {
      success: `${baseUrl}/platnosc-mobilna?status=ok`,
      failure: `${baseUrl}/platnosc-mobilna?status=blad`,
    }
  }
  return {
    success: `${baseUrl}/panel-eksperta/checkout/success?orderId=${orderId}`,
    failure: `${baseUrl}/panel-eksperta/checkout/failure?orderId=${orderId}`,
  }
}
