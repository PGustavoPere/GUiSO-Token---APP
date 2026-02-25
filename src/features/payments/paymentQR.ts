export function generatePaymentQRUrl(paymentId: string): string {
  const baseUrl = window.location.origin || 'https://app.guiso';
  return `${baseUrl}/pay/${paymentId}`;
}
