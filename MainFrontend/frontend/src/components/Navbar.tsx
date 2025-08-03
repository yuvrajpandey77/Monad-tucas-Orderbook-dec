import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDEXStore } from '@/store/dex-store';
import { formatAddress, formatTokenAmount } from '@/lib/utils';
import { Wallet, Menu, X, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Coins, RefreshCw, Network, Loader2, Bug } from 'lucide-react';
import ConnectWallet from './ConnectWallet';
import WalletDebugInfo from './WalletDebugInfo';
import { useWallet } from '@/hooks/useWallet';
import { walletService } from '@/services/wallet-service';

interface TokenBalance {
  address: string;
  symbol: string;
  balance: string;
  decimals: number;
  isNative: boolean;
}

interface BalanceLoadingState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  retryCount: number;
}

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConnectWalletOpen, setIsConnectWalletOpen] = useState(false);
  const [isDebugModalOpen, setIsDebugModalOpen] = useState(false);
  const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false);
  const [userBalances, setUserBalances] = useState<{ [key: string]: string }>({});
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [balanceLoadingState, setBalanceLoadingState] = useState<BalanceLoadingState>({
    isLoading: false,
    error: null,
    lastUpdated: null,
    retryCount: 0
  });
  
  const { selectedPair } = useDEXStore();
  const [networkStatus, setNetworkStatus] = useState<'checking' | 'connected' | 'wrong-network' | 'error'>('checking');
  
  // Use the new wallet hook for enhanced functionality
  const {
    isConnected,
    address: account,
    nativeBalance,
    tokenBalances: newTokenBalances,
    fetchAllBalances,
    connectWallet,
    disconnectWallet,
    error: walletError,
    clearError: clearWalletError,
    isLoading,
    isAutoReconnecting,
  } = useWallet();
  
  const location = useLocation();
  const tokenDropdownRef = useRef<HTMLDivElement>(null);

  // Check network status
  React.useEffect(() => {
    const checkNetwork = async () => {
      const provider = walletService.getProvider();
      if (!provider) {
        setNetworkStatus('error');
        return;
      }

      try {
        const network = await provider.getNetwork();
        const chainId = network.chainId.toString();
        
        // Check if we're on Monad testnet (chain ID 10143 = 0x279f)
        if (chainId === '10143' || chainId === '0x279f') {
          setNetworkStatus('connected');
        } else {
          setNetworkStatus('wrong-network');
        }
      } catch (error) {
        console.error('Network check failed:', error);
        setNetworkStatus('error');
      }
    };

    checkNetwork();
  }, [isConnected]);

  // Fetch all user balances when connected
  useEffect(() => {
    const fetchAllUserBalances = async () => {
      if (!account) return;
      
      const signer = walletService.getSigner();
      if (!signer) return;

      try {
        setBalanceLoadingState(prev => ({
          ...prev,
          isLoading: true,
          error: null
        }));
        
        console.log('Navbar: Fetching all user balances for:', account);
        
        // Use the new wallet service for fetching balances
        if (account) {
          try {
            const allBalances = await fetchAllBalances([], account);
            
            // Convert to the old format for backward compatibility
            const balances: TokenBalance[] = [];
            
            // Add native balance
            if (allBalances.native) {
              balances.push({
                address: '0x0000000000000000000000000000000000000000',
                symbol: allBalances.native.symbol,
                balance: allBalances.native.balance,
                decimals: 18,
                isNative: true
              });
            }
            
            // Add token balances
            allBalances.tokens.forEach(token => {
              balances.push({
                address: token.address || '',
                symbol: token.symbol,
                balance: token.balance,
                decimals: token.decimals,
                isNative: false
              });
            });
            
            setTokenBalances(balances);
            
            // Update the old userBalances format for backward compatibility
            const balanceMap: { [key: string]: string } = {};
            balances.forEach(token => {
              balanceMap[token.address] = token.balance;
            });
            setUserBalances(balanceMap);
            
            setBalanceLoadingState(prev => ({
              ...prev,
              isLoading: false,
              error: null,
              lastUpdated: new Date(),
              retryCount: 0
            }));
            
            console.log('All balances fetched:', balances);
          } catch (error) {
            console.error('Error fetching balances with new service:', error);
            // Fallback to old method if new service fails
            throw error;
          }
        }
      } catch (error) {
        console.error('Navbar: Failed to fetch user balances:', error);
        setBalanceLoadingState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load balances. Please try again.',
          retryCount: prev.retryCount + 1
        }));
        
        // Set some test data for debugging
        setTokenBalances([
          {
            address: '0x0000000000000000000000000000000000000000',
            symbol: 'MONAD',
            balance: '1000000000000000000000', // 1000 MONAD
            decimals: 18,
            isNative: true
          }
        ]);
      }
    };

    if (isConnected && account) {
      fetchAllUserBalances();
    }
  }, [isConnected, account, selectedPair, fetchAllBalances]);

  const getNetworkStatusIcon = () => {
    switch (networkStatus) {
      case 'connected':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'wrong-network':
        return <AlertCircle className="h-3 w-3 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>;
    }
  };

  const getNetworkStatusText = () => {
    switch (networkStatus) {
      case 'connected':
        return 'Monad Testnet';
      case 'wrong-network':
        return 'Wrong Network';
      case 'error':
        return 'Network Error';
      default:
        return 'Checking...';
    }
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tokenDropdownRef.current && !tokenDropdownRef.current.contains(event.target as Node)) {
        setIsTokenDropdownOpen(false);
      }
    };

    if (isTokenDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTokenDropdownOpen]);

  const refreshBalances = async () => {
    if (!isConnected || !account) return;
    
    const signer = walletService.getSigner();
    if (!signer) return;
    
    try {
      setBalanceLoadingState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));
      
      // Use the new wallet service to refresh balances
      if (account) {
        const allBalances = await fetchAllBalances([], account);
        
        // Convert to the old format for backward compatibility
        const balances: TokenBalance[] = [];
        
        // Add native balance
        if (allBalances.native) {
          balances.push({
            address: '0x0000000000000000000000000000000000000000',
            symbol: allBalances.native.symbol,
            balance: allBalances.native.balance,
            decimals: 18,
            isNative: true
          });
        }
        
        // Add token balances
        allBalances.tokens.forEach(token => {
          balances.push({
            address: token.address || '',
            symbol: token.symbol,
            balance: token.balance,
            decimals: token.decimals,
            isNative: false
          });
        });
        
        setTokenBalances(balances);
        
        // Update the old userBalances format for backward compatibility
        const balanceMap: { [key: string]: string } = {};
        balances.forEach(token => {
          balanceMap[token.address] = token.balance;
        });
        setUserBalances(balanceMap);
        
        setBalanceLoadingState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
          retryCount: 0
        }));
        
        console.log('All balances refreshed:', balances);
      }
    } catch (error) {
      console.error('Failed to refresh balances:', error);
      setBalanceLoadingState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to refresh balances. Please try again.',
        retryCount: prev.retryCount + 1
      }));
    }
  };

  // Get the primary balance to show in the header (native MONAD or first available)
  const getPrimaryBalance = () => {
    const nativeToken = tokenBalances.find(token => token.isNative);
    if (nativeToken && nativeToken.balance !== '0') {
      return { symbol: nativeToken.symbol, balance: nativeToken.balance };
    }
    
    const firstToken = tokenBalances.find(token => token.balance !== '0');
    if (firstToken) {
      return { symbol: firstToken.symbol, balance: firstToken.balance };
    }
    
    return { symbol: 'MONAD', balance: '0' };
  };

  const primaryBalance = getPrimaryBalance();

  // Skeleton loading component for balance display
  const BalanceSkeleton = () => (
    <div className="flex items-center space-x-2 animate-pulse">
      <div className="w-4 h-4 bg-muted rounded"></div>
      <div className="w-20 h-4 bg-muted rounded"></div>
    </div>
  );

  // Error state component
  const BalanceError = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <div className="flex items-center space-x-2 text-destructive">
      <AlertCircle className="h-4 w-4" />
      <span className="text-xs">{error}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRetry}
        className="h-4 w-4 p-0 hover:bg-destructive/10"
      >
        <RefreshCw className="h-3 w-3" />
      </Button>
    </div>
  );

  // Format last updated time
  const formatLastUpdated = (date: Date | null) => {
    if (!date) return '';
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-border/20 sticky top-0 z-50 transition-all duration-300 ease-in-out">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Desktop Left Side */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/70 rounded-lg flex items-center justify-center">
                <Coins className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                MonadDEX
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/trading"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${
                  isActiveRoute('/trading') 
                    ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                    : 'text-foreground hover:bg-accent/50'
                }`}
              >
                Advanced Trading
              </Link>
              <Link
                to="/limit"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${
                  isActiveRoute('/limit') 
                    ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                    : 'text-foreground hover:bg-accent/50'
                }`}
              >
                Limit Trading
              </Link>
              <Link
                to="/explore"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${
                  isActiveRoute('/explore') 
                    ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                    : 'text-foreground hover:bg-accent/50'
                }`}
              >
                Explore
              </Link>
              <Link
                to="/pool"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${
                  isActiveRoute('/pool') 
                    ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                    : 'text-foreground hover:bg-accent/50'
                }`}
              >
                Pool
              </Link>
            </div>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Network Status */}
            {isConnected && (
              <div className="flex items-center space-x-2 text-xs text-muted-foreground transition-all duration-300 ease-in-out">
                <div className="transition-transform duration-300">
                  {getNetworkStatusIcon()}
                </div>
                <span>{getNetworkStatusText()}</span>
              </div>
            )}
            
            {/* User Token Balance */}
            {isConnected && (
              <div className="relative" ref={tokenDropdownRef}>
                <button
                  onClick={() => setIsTokenDropdownOpen(!isTokenDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-accent/50 hover:bg-accent/70 transition-all duration-300 ease-in-out transform hover:scale-105"
                  disabled={balanceLoadingState.isLoading}
                >
                  <Coins className="h-4 w-4 text-primary transition-transform duration-300" />
                  <span className="text-sm font-medium">
                    {balanceLoadingState.isLoading ? (
                      <BalanceSkeleton />
                    ) : balanceLoadingState.error ? (
                      <BalanceError 
                        error={balanceLoadingState.error} 
                        onRetry={refreshBalances}
                      />
                    ) : primaryBalance.balance !== '0' ? (
                      `${formatTokenAmount(primaryBalance.balance)} ${primaryBalance.symbol}`
                    ) : (
                      `0.000 ${primaryBalance.symbol}`
                    )}
                  </span>
                  <div className="transition-transform duration-300">
                    {isTokenDropdownOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </div>
                </button>
                <button
                  onClick={refreshBalances}
                  className="ml-2 p-1 rounded hover:bg-accent/70 transition-colors disabled:opacity-50"
                  disabled={balanceLoadingState.isLoading}
                >
                  <Loader2 className={`h-3 w-3 ${balanceLoadingState.isLoading ? 'animate-spin' : ''}`} />
                </button>
                
                {isTokenDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-background border border-border/20 rounded-lg shadow-lg py-3 z-50 animate-in slide-in-from-top-2 duration-300">
                    <div className="px-4 py-2 border-b border-border/20">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-foreground">Your Balances</h3>
                        {balanceLoadingState.lastUpdated && (
                          <span className="text-xs text-muted-foreground">
                            {formatLastUpdated(balanceLoadingState.lastUpdated)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="px-4 py-2 space-y-2 max-h-60 overflow-y-auto">
                      {balanceLoadingState.isLoading ? (
                        // Skeleton loading for balance list
                        Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="flex justify-between items-center py-1 animate-pulse">
                            <div className="flex items-center space-x-2">
                              <div className="w-12 h-4 bg-muted rounded"></div>
                              <div className="w-8 h-3 bg-muted rounded"></div>
                            </div>
                            <div className="w-16 h-4 bg-muted rounded"></div>
                          </div>
                        ))
                      ) : balanceLoadingState.error ? (
                        <div className="text-center py-4">
                          <div className="text-sm text-destructive mb-2">
                            {balanceLoadingState.error}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={refreshBalances}
                            className="text-xs"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Retry
                          </Button>
                        </div>
                      ) : tokenBalances.length === 0 ? (
                        <div className="text-center py-4">
                          <div className="text-sm text-muted-foreground">
                            No tokens found
                          </div>
                        </div>
                      ) : (
                        tokenBalances.map((token, index) => (
                          <div key={index} className="flex justify-between items-center py-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">{token.symbol}</span>
                              {token.isNative && (
                                <Badge variant="outline" className="text-xs">Native</Badge>
                              )}
                            </div>
                            <span className="text-sm font-mono">
                              {formatTokenAmount(token.balance)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="px-4 py-2 border-t border-border/20">
                      <div className="text-xs text-muted-foreground">
                        {formatAddress(account || '')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={disconnectWallet}
                  className="border-border/20 transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  Disconnect
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsDebugModalOpen(true)}
                  className="transition-all duration-300 ease-in-out transform hover:scale-105"
                  title="Debug Wallet Connection"
                >
                  <Bug className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={async () => {
                    try {
                      await connectWallet();
                    } catch (error) {
                      console.error('Failed to connect wallet:', error);
                      // Fallback to modal if direct connection fails
                      setIsConnectWalletOpen(true);
                    }
                  }}
                  disabled={isLoading}
                  className="transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 w-4 mr-2 transition-transform duration-300" />
                      Connect
                    </>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsDebugModalOpen(true)}
                  className="transition-all duration-300 ease-in-out transform hover:scale-105"
                  title="Debug Wallet Connection"
                >
                  <Bug className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-foreground hover:text-primary p-2 transition-all duration-300 ease-in-out transform hover:scale-110"
            >
              <div className="transition-transform duration-300">
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 backdrop-blur-md transition-all duration-300 ease-in-out">
          <div className="px-2 pt-2 pb-3 space-y-2">
            <Link
              to="/trading"
              className={`block px-3 py-3 rounded-lg text-base font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${
                isActiveRoute('/trading') 
                  ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                  : 'bg-accent/50 text-foreground hover:bg-accent/70'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Advanced Trading
            </Link>
            <Link
              to="/limit"
              className={`block px-3 py-3 rounded-lg text-base font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${
                isActiveRoute('/limit') 
                  ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                  : 'bg-accent/50 text-foreground hover:bg-accent/70'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Limit Trading
            </Link>
            <Link
              to="/explore"
              className={`block px-3 py-3 rounded-lg text-base font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${
                isActiveRoute('/explore') 
                  ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                  : 'bg-accent/50 text-foreground hover:bg-accent/70'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Explore
            </Link>
            <Link
              to="/pool"
              className={`block px-3 py-3 rounded-lg text-base font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${
                isActiveRoute('/pool') 
                  ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                  : 'bg-accent/50 text-foreground hover:bg-accent/70'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pool
            </Link>
            
            <div className="px-3 pt-3 space-y-2">
              {/* Network Status for Mobile */}
              {isConnected && (
                <div className="flex items-center space-x-2 text-xs text-muted-foreground px-3 py-2">
                  {getNetworkStatusIcon()}
                  <span>{getNetworkStatusText()}</span>
                </div>
              )}
              
              {/* User Token Balance for Mobile */}
              {isConnected && (
                <div className="px-3 py-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Coins className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Your Balances</span>
                    </div>
                    {balanceLoadingState.lastUpdated && (
                      <span className="text-xs text-muted-foreground">
                        {formatLastUpdated(balanceLoadingState.lastUpdated)}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 pl-6">
                    {balanceLoadingState.isLoading ? (
                      // Skeleton loading for mobile
                      Array.from({ length: 2 }).map((_, index) => (
                        <div key={index} className="flex justify-between items-center text-xs animate-pulse">
                          <div className="flex items-center space-x-1">
                            <div className="w-8 h-3 bg-muted rounded"></div>
                            <div className="w-6 h-2 bg-muted rounded"></div>
                          </div>
                          <div className="w-12 h-3 bg-muted rounded"></div>
                        </div>
                      ))
                    ) : balanceLoadingState.error ? (
                      <div className="text-xs text-destructive">
                        {balanceLoadingState.error}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={refreshBalances}
                          className="ml-2 h-4 w-4 p-0"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : tokenBalances.length === 0 ? (
                      <div className="text-xs text-muted-foreground">
                        No tokens found
                      </div>
                    ) : (
                      tokenBalances.map((token, index) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <div className="flex items-center space-x-1">
                            <span className="text-muted-foreground">{token.symbol}</span>
                            {token.isNative && (
                              <Badge variant="outline" className="text-xs">Native</Badge>
                            )}
                          </div>
                          <span className="font-medium">
                            {formatTokenAmount(token.balance)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              
              {isConnected ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {formatAddress(account || '')}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="sm" 
                    onClick={disconnectWallet}
                  >
                    Disconnect
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full" 
                    size="sm" 
                    onClick={() => setIsDebugModalOpen(true)}
                  >
                    <Bug className="w-4 h-4 mr-2" />
                    Debug Wallet
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button 
                    variant="default" 
                    className="w-full" 
                    size="sm" 
                    onClick={async () => {
                      try {
                        await connectWallet();
                      } catch (error) {
                        console.error('Failed to connect wallet:', error);
                        // Fallback to modal if direct connection fails
                        setIsConnectWalletOpen(true);
                      }
                    }}
                    disabled={isLoading || isAutoReconnecting}
                  >
                    {isAutoReconnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Reconnecting...
                      </>
                    ) : isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full" 
                    size="sm" 
                    onClick={() => setIsDebugModalOpen(true)}
                  >
                    <Bug className="w-4 h-4 mr-2" />
                    Debug Wallet
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Connect Wallet Modal */}
      <ConnectWallet 
        isOpen={isConnectWalletOpen} 
        onClose={() => setIsConnectWalletOpen(false)} 
      />

      {/* Wallet Debug Modal */}
      <WalletDebugInfo 
        isOpen={isDebugModalOpen} 
        onClose={() => setIsDebugModalOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;