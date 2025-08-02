import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Smartphone, QrCode, Wallet, ChevronRight } from 'lucide-react';
import { useDEXStore } from '@/store/dex-store';
import { useToast } from '@/hooks/use-toast';
import { formatAddress } from '@/lib/utils';

interface ConnectWalletProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConnectWallet = ({ isOpen, onClose }: ConnectWalletProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { connectWallet, isConnected, account } = useDEXStore();
  const { toast } = useToast();

  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);
      console.log('ConnectWallet component: Starting wallet connection...');
      
      await connectWallet();
      
      console.log('ConnectWallet component: Wallet connection successful');
      toast({
        title: "Wallet Connected! 🎉",
        description: `Successfully connected to ${formatAddress(account || '')}`,
      });
      
      onClose(); // Close the modal after successful connection
    } catch (error) {
      console.error('ConnectWallet component: Wallet connection failed:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : 'Failed to connect wallet',
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            Connect a wallet
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 mt-6">
          {/* Get Uniswap Wallet */}
          {/* <button className="w-full p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-foreground">Get Uniswap Wallet</div>
                  <div className="text-sm text-muted-foreground">Available on iOS, Android, and Chrome</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </button> */}

          {/* Uniswap Mobile */}
          {/* <button className="w-full p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-foreground" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-foreground">Tucas Mobile</div>
                  <div className="text-sm text-muted-foreground">Scan QR code to connect</div>
                </div>
              </div>
              <QrCode className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </button> */}

          {/* Other wallets */}
          <button 
            onClick={handleConnectWallet}
            disabled={isConnecting}
            className="w-full p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  {/* MetaMask Logo */}
                  <img 
                    src="/MetaMask.png" 
                    alt="MetaMask" 
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div className="text-left">
                  <div className="font-medium text-foreground">
                    {isConnecting ? 'Connecting...' : 'MetaMask'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isConnecting ? 'Please approve in your wallet' : 'Connect with MetaMask'}
                  </div>
                </div>
              </div>
              {isConnecting ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </div>
          </button>
        </div>

        {/* Legal text */}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            By connecting a wallet, you agree to Tucas Labs' {' '}
            <a href="#" className="text-primary hover:underline">Terms of Service</a> and consent to its {' '}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectWallet;
