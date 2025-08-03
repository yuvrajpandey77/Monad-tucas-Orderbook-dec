import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { walletService } from '@/services/wallet-service';
import { formatAddress } from '@/lib/utils';
import { 
  Wallet, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  RefreshCw,
  Shield,
  Network,
  Settings,
  Download
} from 'lucide-react';

interface ConnectWalletProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  isAvailable: boolean;
  isInstalled: boolean;
  installUrl?: string;
}

const ConnectWallet = ({ isOpen, onClose }: ConnectWalletProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStep, setConnectionStep] = useState<'idle' | 'connecting' | 'switching-network' | 'success' | 'error'>('idle');
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [availableWallets, setAvailableWallets] = useState<WalletOption[]>([]);
  const { toast } = useToast();

  // Detect available wallets
  useEffect(() => {
    const detectWallets = () => {
      const hasEthereum = !!window.ethereum;
      const isMetaMask = !!window.ethereum?.isMetaMask;
      
      const wallets: WalletOption[] = [
        {
          id: 'metamask',
          name: 'MetaMask',
          icon: '🦊',
          description: 'Most popular Ethereum wallet',
          isAvailable: isMetaMask,
          isInstalled: isMetaMask,
          installUrl: 'https://metamask.io/download/'
        },
        {
          id: 'other',
          name: 'Other Wallet',
          icon: '🔗',
          description: 'Any Ethereum-compatible wallet',
          isAvailable: hasEthereum && !isMetaMask,
          isInstalled: hasEthereum && !isMetaMask,
        }
      ];
      
      setAvailableWallets(wallets);
    };

    detectWallets();
  }, []);

  const handleConnect = async (walletId: string) => {
    setSelectedWallet(walletId);
    setIsConnecting(true);
    setConnectionStep('connecting');
    setErrorDetails('');

    try {
      // Connect wallet
      const address = await walletService.connect();
      
      setConnectionStep('success');
      
      toast({
        title: "Wallet Connected",
        description: `Successfully connected: ${formatAddress(address)}`,
        variant: "default",
      });
      
      // Close modal after success
      setTimeout(() => {
        onClose();
        setIsConnecting(false);
        setConnectionStep('idle');
      }, 1500);
      
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setConnectionStep('error');
      setErrorDetails(error instanceof Error ? error.message : 'Unknown error occurred');
      
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : 'Failed to connect wallet',
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    setConnectionStep('idle');
    setErrorDetails('');
    setIsConnecting(false);
  };

  const handleInstallMetaMask = () => {
    window.open('https://metamask.io/download/', '_blank');
  };

  const handleAddNetwork = () => {
    // This will be handled by the wallet service
    toast({
      title: "Network Setup",
      description: "The wallet will prompt you to add the Monad network automatically.",
      variant: "default",
    });
  };

  const getStepContent = () => {
    switch (connectionStep) {
      case 'connecting':
        return (
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <div>
              <h3 className="text-lg font-semibold">Connecting Wallet</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Please approve the connection in your wallet
              </p>
            </div>
          </div>
        );

      case 'switching-network':
        return (
          <div className="text-center space-y-4">
            <Network className="h-12 w-12 text-primary mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Switching Network</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Switching to Monad Testnet...
              </p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-green-600">Connected Successfully</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Your wallet is now connected
              </p>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-4">
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-red-600">Connection Failed</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {errorDetails || 'Failed to connect wallet'}
              </p>
            </div>
            <Button onClick={handleRetry} variant="outline" className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Choose a wallet to connect to MonadDEX
              </p>
            </div>

            <div className="space-y-3">
              {availableWallets.map((wallet) => (
                <Button
                  key={wallet.id}
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => handleConnect(wallet.id)}
                  disabled={!wallet.isAvailable || isConnecting}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <span className="text-2xl">{wallet.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{wallet.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {wallet.description}
                      </div>
                    </div>
                    {wallet.isInstalled ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Download className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </Button>
              ))}

              {availableWallets.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Wallet Found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Please install MetaMask or another Ethereum wallet to continue.
                  </p>
                  <Button onClick={handleInstallMetaMask} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Install MetaMask
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Security Notice</p>
                  <p>
                    By connecting your wallet, you agree to our terms of service. 
                    We never request your private keys or seed phrases.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5" />
            <span>Connect Wallet</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {getStepContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectWallet;
