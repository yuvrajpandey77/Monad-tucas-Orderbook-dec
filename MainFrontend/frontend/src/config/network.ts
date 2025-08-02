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

export const CONTRACT_ADDRESSES = {
  MONAD_TOKEN: '0x14F49BedD983423198d5402334dbccD9c45AC767',
  ORDERBOOK_DEX: '0x6045fe7667E22CE9ff8106429128DDdC90F6F9Ae'
} 