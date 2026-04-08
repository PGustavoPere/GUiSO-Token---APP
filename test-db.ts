import { paymentRepo } from './src/system/database';

try {
  const id = 'TEST-' + Date.now();
  paymentRepo.create({
    id,
    merchantId: 'm1',
    merchantName: 'Test Merchant',
    fiatAmount: 10,
    tokenAmount: 1000,
    status: 'awaiting_payment',
    description: 'Test payment',
    createdAt: Date.now(),
    expiresAt: Date.now() + 3600000,
    walletAddress: '0x123'
  });
  
  const p = paymentRepo.getById(id);
  if (p && p.id === id) {
    console.log('SQLite Test Passed');
  } else {
    console.error('SQLite Test Failed: Payment not found');
  }
} catch (err) {
  console.error('SQLite Test Error:', err);
}
