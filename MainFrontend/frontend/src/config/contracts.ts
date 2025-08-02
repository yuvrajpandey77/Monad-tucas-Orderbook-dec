import { CONTRACT_ADDRESSES } from './network'

// Contract ABIs
export const MONAD_TOKEN_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function mint(address to, uint256 amount)',
  'function publicMint()',
  'function burn(uint256 amount)',
  'function getTokenInfo() view returns (string, string, uint256, uint8)',
  'function getBalance(address account) view returns (uint256)',
]

export const ORDERBOOK_DEX_ABI = [
  'function addTradingPair(address baseToken, address quoteToken, uint256 minOrderSize, uint256 pricePrecision) external',
  'function placeLimitOrder(address baseToken, address quoteToken, uint256 amount, uint256 price, bool isBuy) external returns (uint256)',
  'function placeMarketOrder(address baseToken, address quoteToken, uint256 amount, bool isBuy) external',
  'function cancelOrder(uint256 orderId) external',
  'function getOrderBook(address baseToken, address quoteToken) external view returns (uint256[], uint256[], uint256[], uint256[])',
  'function getUserOrders(address user) external view returns (uint256[])',
  'function getUserBalance(address user, address token) external view returns (uint256)',
  'function withdraw(address token, uint256 amount) external',
  'function tradingPairs(address, address) external view returns (address, address, bool, uint256, uint256)',
  'function orders(uint256) external view returns (uint256, address, address, address, uint256, uint256, bool, bool, uint256)',
]

export const CONTRACTS = {
  MONAD_TOKEN: {
    address: CONTRACT_ADDRESSES.MONAD_TOKEN,
    abi: MONAD_TOKEN_ABI,
  },
  ORDERBOOK_DEX: {
    address: CONTRACT_ADDRESSES.ORDERBOOK_DEX,
    abi: ORDERBOOK_DEX_ABI,
  },
} 