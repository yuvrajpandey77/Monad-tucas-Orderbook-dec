export const NETWORK_CONFIG = {
  chainId: '0x7a69', // 31337 in hex (Anvil's default chain ID)
  chainName: 'Local Development',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: ['http://127.0.0.1:8545'],
  blockExplorerUrls: []
}

export const CONTRACT_ADDRESSES = {
  MONAD_TOKEN: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  ORDERBOOK_DEX: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
} 