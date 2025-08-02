import { create } from 'zustand'
import { ethers } from 'ethers'
import { dexService } from '@/services/dex-service'
import { NETWORK_CONFIG } from '@/config/network'

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    }
  }
}

export interface Order {
  id: string
  trader: string
  baseToken: string
  quoteToken: string
  amount: string
  price: string
  isBuy: boolean
  isActive: boolean
  timestamp: number
}

export interface TradingPair {
  baseToken: string
  quoteToken: string
  baseTokenSymbol: string
  quoteTokenSymbol: string
  isActive: boolean
  minOrderSize: string
  pricePrecision: string
}

export interface OrderBook {
  buyOrders: Order[]
  sellOrders: Order[]
}

export interface UserBalance {
  [tokenAddress: string]: string
}

interface DEXStore {
  // State
  isConnected: boolean
  account: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  dexContract: ethers.Contract | null
  
  // Trading data
  tradingPairs: TradingPair[]
  selectedPair: TradingPair | null
  orderBook: OrderBook
  userOrders: Order[]
  userBalances: UserBalance
  
  // UI state
  isLoading: boolean
  error: string | null
  
  // Actions
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  setSelectedPair: (pair: TradingPair) => void
  setOrderBook: (orderBook: OrderBook) => void
  setUserOrders: (orders: Order[]) => void
  setUserBalances: (balances: UserBalance) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useDEXStore = create<DEXStore>((set) => ({
  // Initial state
  isConnected: false,
  account: null,
  provider: null,
  signer: null,
  dexContract: null,
  
  tradingPairs: [],
  selectedPair: null,
  orderBook: { buyOrders: [], sellOrders: [] },
  userOrders: [],
  userBalances: {},
  
  isLoading: false,
  error: null,
  
  // Actions
  connectWallet: async () => {
    try {
      set({ isLoading: true, error: null })
      
      if (!window.ethereum) {
        throw new Error('MetaMask not found')
      }
      
      // Request to switch to local network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: NETWORK_CONFIG.chainId }],
        })
      } catch (switchError: unknown) {
        // This error code indicates that the chain has not been added to MetaMask
        if ((switchError as { code?: number }).code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [NETWORK_CONFIG],
            })
          } catch (addError) {
            throw new Error('Failed to add local network to MetaMask')
          }
        } else {
          throw switchError
        }
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      const account = accounts[0]
      
      if (!account) {
        throw new Error('No account found')
      }
      
      const signer = await provider.getSigner()
      
      // Initialize DEX service
      await dexService.initialize(signer)
      
      set({
        isConnected: true,
        account,
        provider,
        signer,
        isLoading: false
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
        isLoading: false
      })
    }
  },
  
  disconnectWallet: () => {
    set({
      isConnected: false,
      account: null,
      provider: null,
      signer: null,
      dexContract: null,
      userOrders: [],
      userBalances: {}
    })
  },
  
  setSelectedPair: (pair) => {
    set({ selectedPair: pair })
  },
  
  setOrderBook: (orderBook) => {
    set({ orderBook })
  },
  
  setUserOrders: (orders) => {
    set({ userOrders: orders })
  },
  
  setUserBalances: (balances) => {
    set({ userBalances: balances })
  },
  
  setLoading: (loading) => {
    set({ isLoading: loading })
  },
  
  setError: (error) => {
    set({ error })
  },
  
  clearError: () => {
    set({ error: null })
  }
})) 