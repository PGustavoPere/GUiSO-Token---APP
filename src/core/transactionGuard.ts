const processedTransactions = new Set<string>();

export function isTransactionProcessed(txHash: string): boolean {
  return processedTransactions.has(txHash);
}

export function markTransactionProcessed(txHash: string): void {
  processedTransactions.add(txHash);
}
