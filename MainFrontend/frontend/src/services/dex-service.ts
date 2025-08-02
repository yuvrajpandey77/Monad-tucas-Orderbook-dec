import { ethers } from 'ethers'
import { CONTRACTS } from '@/config/contracts'

// Use the ABI from config
const DEX_ABI = CONTRACTS.ORDERBOOK_DEX.abi

export class DEXService {
  private contract: ethers.Contract | null = null
  public readonly contractAddress: string

  constructor(contractAddress: string) {
    this.contractAddress = contractAddress
  }

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
      buyOrders: buyPrices.map((price: ethers.BigNumberish, index: number) => ({
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
      sellOrders: sellPrices.map((price: ethers.BigNumberish, index: number) => ({
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
    return orderIds.map((id: ethers.BigNumberish) => ({
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
export const dexService = new DEXService(CONTRACTS.ORDERBOOK_DEX.address) // OrderBookDEX contract address from config 