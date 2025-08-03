export const NETWORK_CONFIG = {
  chainId: '0x279f', // 10143 in hex (Monad testnet chain ID)
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MONAD',
    decimals: 18
  },
  rpcUrls: ['https://monad-testnet.g.alchemy.com/v2/hl5Gau0XVV37m-RDdhcRzqCh7ISwmOAe'],
  blockExplorerUrls: ['https://explorer.testnet.monad.xyz']
}

// Alternative network config for better MetaMask compatibility
export const MONAD_NETWORK_CONFIG = {
  chainId: '0x279f', // 10143 in hex
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MONAD',
    decimals: 18
  },
  rpcUrls: ['https://monad-testnet.g.alchemy.com/v2/hl5Gau0XVV37m-RDdhcRzqCh7ISwmOAe'],
  blockExplorerUrls: ['https://explorer.testnet.monad.xyz']
}

export const CONTRACT_ADDRESSES = {
  ORDERBOOK_DEX: '0xa6b0D09e1c6CbBDE669eBBD0854515F002a7732e'
} 