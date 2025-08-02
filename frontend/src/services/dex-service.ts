import { ethers } from 'ethers'

// DEX Contract ABI (simplified for demo)
const DEX_ABI = [
  'function placeLimitOrder(address baseToken, address quoteToken, uint256 amount, uint256 price, bool isBuy) external returns (uint256)',
  'function placeMarketOrder(address baseToken, address quoteToken, uint256 amount, bool isBuy) external',
  'function getOrderBook(address baseToken, address quoteToken) external view returns (uint256[], uint256[], uint256[], uint256[])',
  'function getUserOrders(address user) external view returns (uint256[])',
  'function getUserBalance(address user, address token) external view returns (uint256)',
  'function cancelOrder(uint256 orderId) external',
  'function withdraw(address token, uint256 amount) external',
]

export class DEXService {
  private contract: ethers.Contract | null = null

  constructor(
    private contractAddress: string
  ) {}

  async initialize(signer: ethers.JsonRpcSigner) {
    this.contract = new ethers.Contract(this.contractAddress, DEX_ABI, signer)
  }

  // Place a limit order
  async placeLimitOrder(
    baseToken: string,
    quoteToken: string,
    amount: string,
    price: string,
    isBuy: boolean
  ): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized')

    const tx = await this.contract.placeLimitOrder(
      baseToken,
      quoteToken,
      amount,
      price,
      isBuy
    )
    
    const receipt = await tx.wait()
    return receipt.transactionHash
  }

  // Place a market order
  async placeMarketOrder(
    baseToken: string,
    quoteToken: string,
    amount: string,
    isBuy: boolean
  ): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized')

    const tx = await this.contract.placeMarketOrder(
      baseToken,
      quoteToken,
      amount,
      isBuy
    )
    
    const receipt = await tx.wait()
    return receipt.transactionHash
  }

  // Get order book for a trading pair
  async getOrderBook(baseToken: string, quoteToken: string) {
    if (!this.contract) throw new Error('Contract not initialized')

    const [buyPrices, buyAmounts, sellPrices, sellAmounts] = await this.contract.getOrderBook(
      baseToken,
      quoteToken
    )

    return {
      buyOrders: buyPrices.map((price: any, index: number) => ({
        id: index.toString(),
        price: price.toString(),
        amount: buyAmounts[index].toString(),
        isBuy: true,
        isActive: true,
        timestamp: Date.now(),
        trader: '',
        baseToken,
        quoteToken,
      })),
      sellOrders: sellPrices.map((price: any, index: number) => ({
        id: (index + buyPrices.length).toString(),
        price: price.toString(),
        amount: sellAmounts[index].toString(),
        isBuy: false,
        isActive: true,
        timestamp: Date.now(),
        trader: '',
        baseToken,
        quoteToken,
      })),
    }
  }

  // Get user's active orders
  async getUserOrders(userAddress: string) {
    if (!this.contract) throw new Error('Contract not initialized')

    const orderIds = await this.contract.getUserOrders(userAddress)
    
    // In a real implementation, you would fetch order details for each ID
    return orderIds.map((id: any) => ({
      id: id.toString(),
      trader: userAddress,
      baseToken: '',
      quoteToken: '',
      amount: '0',
      price: '0',
      isBuy: false,
      isActive: true,
      timestamp: Date.now(),
    }))
  }

  // Get user balance for a token
  async getUserBalance(userAddress: string, tokenAddress: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized')

    const balance = await this.contract.getUserBalance(userAddress, tokenAddress)
    return balance.toString()
  }

  // Cancel an order
  async cancelOrder(orderId: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized')

    const tx = await this.contract.cancelOrder(orderId)
    const receipt = await tx.wait()
    return receipt.transactionHash
  }

  // Withdraw tokens
  async withdraw(tokenAddress: string, amount: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized')

    const tx = await this.contract.withdraw(tokenAddress, amount)
    const receipt = await tx.wait()
    return receipt.transactionHash
  }
}

// Create a singleton instance
export const dexService = new DEXService('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512') // OrderBookDEX contract address 