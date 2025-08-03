export const NETWORK_CONFIG = {
  chainId: '0x279f', // 10143 in hex (Monad testnet chain ID)
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MONAD',
    decimals: 18
  },
  rpcUrls: ['https://monad-testnet.g.alchemy.com/v2/hl5Gau0XVV37m-RDdhcRzqCh7ISwmOAe'],
  blockExplorerUrls: ['https://explorer.monad.xyz']
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
  blockExplorerUrls: ['https://explorer.monad.xyz']
}

export const CONTRACT_ADDRESSES = {
  ORDERBOOK_DEX: '0x39DC69400B5A2eC3DC2b13fDd1D8c7f78b3D573e'
} 