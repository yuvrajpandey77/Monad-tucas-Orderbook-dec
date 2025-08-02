import { ethers } from 'ethers'

// ERC20 Token ABI (simplified for approvals)
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
  'function name() external view returns (string)',
]

export class TokenService {
  private contract: ethers.Contract | null = null

  constructor(private tokenAddress: string) {}

  async initialize(signer: ethers.JsonRpcSigner) {
    this.contract = new ethers.Contract(this.tokenAddress, ERC20_ABI, signer)
  }

  // Check current allowance
  async getAllowance(ownerAddress: string, spenderAddress: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized')

    const allowance = await this.contract.allowance(ownerAddress, spenderAddress)
    return allowance.toString()
  }

  // Approve tokens for spending
  async approve(spenderAddress: string, amount: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized')

    const tx = await this.contract.approve(spenderAddress, amount)
    const receipt = await tx.wait()
    return receipt.transactionHash
  }

  // Get token balance
  async getBalance(accountAddress: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized')

    const balance = await this.contract.balanceOf(accountAddress)
    return balance.toString()
  }

  // Get token symbol
  async getSymbol(): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized')

    const symbol = await this.contract.symbol()
    return symbol
  }

  // Get token decimals
  async getDecimals(): Promise<number> {
    if (!this.contract) throw new Error('Contract not initialized')

    const decimals = await this.contract.decimals()
    return decimals
  }
}

// Create singleton instances for common tokens
export const createTokenService = (tokenAddress: string) => new TokenService(tokenAddress) 