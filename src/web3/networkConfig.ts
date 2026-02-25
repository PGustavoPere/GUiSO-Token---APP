export const networkConfig = {
  bsc_testnet: {
    chainId: '0x61', // 97
    chainName: 'BNB Smart Chain Testnet',
    nativeCurrency: {
      name: 'Test BNB',
      symbol: 'tBNB',
      decimals: 18,
    },
    rpcUrls: [(import.meta as any).env?.VITE_BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/'],
    blockExplorerUrls: ['https://testnet.bscscan.com'],
  }
};
