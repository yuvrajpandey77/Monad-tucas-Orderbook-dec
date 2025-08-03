import { ethers, BrowserProvider, JsonRpcSigner, Contract } from 'ethers';
import { MONAD_NETWORK_CONFIG } from '@/config/network';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  chainId: string | null;
  networkName: string | null;
  error: string | null;
  isLoading: boolean;
}

export interface WalletError {
  code: string;
  message: string;
  userMessage: string;
}

export class WalletService {
  private state: WalletState = {
    isConnected: false,
    address: null,
    provider: null,
    signer: null,
    chainId: null,
    networkName: null,
    error: null,
    isLoading: false,
  };

  private listeners: Set<(state: WalletState) => void> = new Set();
  private cleanupListeners: (() => void) | null = null;

  // Singleton pattern
  private static instance: WalletService;
  
  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  constructor() {
    // Auto-reconnect on page load if wallet was previously connected
    this.autoReconnect();
  }

  /**
   * Subscribe to wallet state changes
   */
  subscribe(listener: (state: WalletState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Update state and notify listeners
   */
  private updateState(updates: Partial<WalletState>): void {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Get current wallet state
   */
  getState(): WalletState {
    return { ...this.state };
  }

  /**
   * Check if MetaMask is available
   */
  isMetaMaskAvailable(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.ethereum !== 'undefined' && 
           window.ethereum.isMetaMask === true;
  }

  /**
   * Check if any Ethereum provider is available
   */
  isEthereumAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  /**
   * Get the preferred wallet provider (MetaMask first)
   */
  private getPreferredProvider(): any {
    if (typeof window === 'undefined') return null;
    
    // Check if MetaMask is available and prioritize it
    if (window.ethereum && window.ethereum.isMetaMask) {
      console.log('Using MetaMask wallet');
      return window.ethereum;
    }
    
    // Check for other providers as fallback
    if (window.ethereum) {
      console.log('Using fallback wallet provider (not MetaMask)');
      return window.ethereum;
    }
    
    return null;
  }

  /**
   * Auto-reconnect on page load
   */
  private async autoReconnect(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Check if we have a stored connection
      const storedConnection = localStorage.getItem('wallet_connection');
      if (!storedConnection) return;

      const { address, chainId } = JSON.parse(storedConnection);
      
      // Check if MetaMask is still available
      if (!this.isMetaMaskAvailable()) {
        this.clearStoredConnection();
        return;
      }

      // Try to reconnect
      console.log('Attempting auto-reconnect...');
      this.updateState({ isLoading: true, error: null });

      // Get the preferred provider
      const preferredProvider = this.getPreferredProvider();
      if (!preferredProvider) {
        this.clearStoredConnection();
        this.updateState({ isLoading: false });
        return;
      }

      // Request account access
      const accounts = await preferredProvider.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (!accounts || accounts.length === 0) {
        this.clearStoredConnection();
        this.updateState({ isLoading: false });
        return;
      }

      const currentAddress = accounts[0];
      
      // Check if the address matches
      if (currentAddress.toLowerCase() !== address.toLowerCase()) {
        // Address changed, update stored connection
        this.storeConnection(currentAddress, chainId);
      }

      // Create provider and signer
      const provider = new BrowserProvider(preferredProvider);
      const signer = await provider.getSigner();

      // Get network information
      const network = await provider.getNetwork();
      const currentChainId = network.chainId.toString();
      const networkName = this.getNetworkName(currentChainId);

      this.updateState({
        isConnected: true,
        address: currentAddress,
        provider,
        signer,
        chainId: currentChainId,
        networkName,
        isLoading: false,
        error: null,
      });

      // Set up event listeners
      this.setupEventListeners();

      console.log('Auto-reconnect successful');

    } catch (error) {
      console.log('Auto-reconnect failed:', error);
      this.clearStoredConnection();
      this.updateState({ isLoading: false });
    }
  }

  /**
   * Store connection information
   */
  private storeConnection(address: string, chainId: string): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('wallet_connection', JSON.stringify({
      address,
      chainId,
      timestamp: Date.now()
    }));
  }

  /**
   * Clear stored connection
   */
  private clearStoredConnection(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('wallet_connection');
  }

  /**
   * Initialize the wallet connection
   */
  async initialize(): Promise<void> {
    try {
      this.updateState({ isLoading: true, error: null });

      // Check specifically for MetaMask
      if (!this.isMetaMaskAvailable()) {
        throw new Error('MetaMask is not available. Please install MetaMask wallet.');
      }

      // Get the preferred provider (MetaMask first)
      const preferredProvider = this.getPreferredProvider();
      if (!preferredProvider) {
        throw new Error('No wallet provider found. Please install MetaMask.');
      }

      // Request account access from the preferred provider
      const accounts = await preferredProvider.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your MetaMask wallet.');
      }

      const address = accounts[0];
      
      // Create provider and signer from the preferred provider
      const provider = new BrowserProvider(preferredProvider);
      const signer = await provider.getSigner();

      // Get network information
      const network = await provider.getNetwork();
      const chainId = network.chainId.toString();
      const networkName = this.getNetworkName(chainId);

      this.updateState({
        isConnected: true,
        address,
        provider,
        signer,
        chainId,
        networkName,
        isLoading: false,
        error: null,
      });

      // Store connection
      this.storeConnection(address, chainId);

      // Set up event listeners
      this.setupEventListeners();

    } catch (error) {
      const walletError = this.handleError(error);
      this.updateState({
        isConnected: false,
        address: null,
        provider: null,
        signer: null,
        chainId: null,
        networkName: null,
        isLoading: false,
        error: walletError.userMessage,
      });
      throw walletError;
    }
  }

  /**
   * Switch to Monad network
   */
  async switchToMonadNetwork(): Promise<void> {
    if (!this.isMetaMaskAvailable()) {
      throw new Error('MetaMask is not available. Please install MetaMask wallet.');
    }

    try {
      const preferredProvider = this.getPreferredProvider();
      if (!preferredProvider) {
        throw new Error('No wallet provider found.');
      }

      // Try to switch to Monad network
      await preferredProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_NETWORK_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          const preferredProvider = this.getPreferredProvider();
          if (!preferredProvider) {
            throw new Error('No wallet provider found.');
          }
          
          await preferredProvider.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_NETWORK_CONFIG],
          });
        } catch (addError) {
          throw new Error('Failed to add Monad network to your wallet. Please add it manually.');
        }
      } else {
        throw new Error('Failed to switch to Monad network. Please switch manually.');
      }
    }
  }

  /**
   * Connect wallet with network switching
   */
  async connect(): Promise<string> {
    try {
      await this.initialize();
      
      // Try to switch to Monad network
      await this.switchToMonadNetwork();
      
      // Verify connection
      if (!this.state.address) {
        throw new Error('Failed to get wallet address.');
      }

      return this.state.address;
    } catch (error) {
      const walletError = this.handleError(error);
      this.updateState({
        isConnected: false,
        address: null,
        provider: null,
        signer: null,
        chainId: null,
        networkName: null,
        isLoading: false,
        error: walletError.userMessage,
      });
      throw walletError;
    }
  }

  /**
   * Disconnect wallet
   */
  disconnect(): void {
    // Clear stored connection
    this.clearStoredConnection();
    
    // Clean up event listeners
    if (this.cleanupListeners) {
      this.cleanupListeners();
      this.cleanupListeners = null;
    }

    this.updateState({
      isConnected: false,
      address: null,
      provider: null,
      signer: null,
      chainId: null,
      networkName: null,
      error: null,
      isLoading: false,
    });
  }

  /**
   * Check if wallet is connected
   */
  async isConnected(): Promise<boolean> {
    if (!this.state.isConnected || !this.state.provider || !this.state.signer) {
      return false;
    }

    try {
      await this.state.signer.getAddress();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current address
   */
  async getAddress(): Promise<string | null> {
    if (!this.state.isConnected || !this.state.signer) {
      return null;
    }

    try {
      return await this.state.signer.getAddress();
    } catch {
      return null;
    }
  }

  /**
   * Get provider
   */
  getProvider(): BrowserProvider | null {
    return this.state.provider;
  }

  /**
   * Get signer
   */
  getSigner(): JsonRpcSigner | null {
    return this.state.signer;
  }

  /**
   * Setup event listeners for wallet changes
   */
  private setupEventListeners(): void {
    if (!window.ethereum) return;

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        // User disconnected
        this.disconnect();
      } else if (accounts[0] !== this.state.address) {
        // Account changed
        const newAddress = accounts[0];
        this.updateState({ address: newAddress });
        this.storeConnection(newAddress, this.state.chainId || '');
      }
    };

    const handleChainChanged = (...args: unknown[]) => {
      const chainId = args[0] as string;
      this.updateState({ 
        chainId,
        networkName: this.getNetworkName(chainId),
      });
      // Update stored connection with new chain ID
      if (this.state.address) {
        this.storeConnection(this.state.address, chainId);
      }
    };

    const handleDisconnect = () => {
      this.disconnect();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    // Store cleanup function
    this.cleanupListeners = () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }

  /**
   * Get network name from chain ID
   */
  private getNetworkName(chainId: string): string {
    const networkMap: { [key: string]: string } = {
      '1': 'Ethereum Mainnet',
      '3': 'Ropsten',
      '4': 'Rinkeby',
      '5': 'Goerli',
      '42': 'Kovan',
      '56': 'BSC',
      '97': 'BSC Testnet',
      '137': 'Polygon',
      '80001': 'Mumbai',
      '43114': 'Avalanche',
      '250': 'Fantom',
      '42161': 'Arbitrum',
      '10': 'Optimism',
      '10143': 'Monad Testnet',
      '0x279f': 'Monad Testnet',
    };

    return networkMap[chainId] || 'Unknown Network';
  }

  /**
   * Handle and categorize errors
   */
  private handleError(error: unknown): WalletError {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    if (message.includes('User rejected') || message.includes('user rejected')) {
      return {
        code: 'USER_REJECTED',
        message,
        userMessage: 'Connection was rejected. Please try again and approve the connection.',
      };
    }
    
    if (message.includes('already pending')) {
      return {
        code: 'ALREADY_PENDING',
        message,
        userMessage: 'A connection request is already pending. Please check your wallet.',
      };
    }
    
    if (message.includes('not installed') || message.includes('No Ethereum provider')) {
      return {
        code: 'NO_PROVIDER',
        message,
        userMessage: 'No wallet found. Please install MetaMask or another wallet.',
      };
    }
    
    if (message.includes('locked') || message.includes('unlock')) {
      return {
        code: 'WALLET_LOCKED',
        message,
        userMessage: 'Wallet is locked. Please unlock your wallet and try again.',
      };
    }
    
    if (message.includes('No accounts found')) {
      return {
        code: 'NO_ACCOUNTS',
        message,
        userMessage: 'No accounts found. Please create or import an account in your wallet.',
      };
    }
    
    return {
      code: 'UNKNOWN_ERROR',
      message,
      userMessage: 'Failed to connect wallet. Please try again.',
    };
  }
}

// Export singleton instance
export const walletService = WalletService.getInstance(); 