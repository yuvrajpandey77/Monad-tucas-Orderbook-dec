import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown, ChevronDown } from 'lucide-react';
import TokenSelectorModal from './TokenSelectorModal';

interface Token {
  symbol: string;
  name: string;
  address: string;
  logo: string;
}

const SwapCard = () => {
  const [sellAmount, setSellAmount] = useState('0');
  const [buyAmount, setBuyAmount] = useState('0');
  const [sellToken, setSellToken] = useState<Token>({
    symbol: 'MONAD',
    name: 'Monad',
    address: '0x0000000000000000000000000000000000000000',
    logo: '🔷'
  });
  const [buyToken, setBuyToken] = useState<Token | null>(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [tokenModalType, setTokenModalType] = useState<'sell' | 'buy'>('buy');

  const handleTokenSelect = (token: Token) => {
    if (tokenModalType === 'sell') {
      setSellToken(token);
    } else {
      setBuyToken(token);
    }
  };

  const openTokenModal = (type: 'sell' | 'buy') => {
    setTokenModalType(type);
    setIsTokenModalOpen(true);
  };

  const swapTokens = () => {
    if (buyToken) {
      const tempToken = sellToken;
      setSellToken(buyToken);
      setBuyToken(tempToken);
      
      const tempAmount = sellAmount;
      setSellAmount(buyAmount);
      setBuyAmount(tempAmount);
    }
  };

  return (
    <>
      <div className="swap-card w-full max-w-md mx-auto">
        <div className="space-y-4">
          {/* Sell Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Sell</span>
            </div>
            
            <div className="bg-muted rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  placeholder="0"
                  className="token-input flex-1"
                />
                <Button 
                  variant="ghost" 
                  onClick={() => openTokenModal('sell')}
                  className="flex items-center space-x-2 rounded-full px-3 py-2 bg-accent hover:bg-accent/80"
                >
                  <span className="text-lg">{sellToken.logo}</span>
                  <span className="font-semibold">{sellToken.symbol}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                ${sellAmount !== '0' ? (parseFloat(sellAmount || '0') * 3420).toLocaleString() : '0'}
              </div>
            </div>
          </div>

          {/* Swap Arrow */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={swapTokens}
              className="rounded-full bg-accent hover:bg-accent/80 border border-border p-2"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Buy Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Buy</span>
            </div>
            
            <div className="bg-muted rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  placeholder="0"
                  className="token-input flex-1"
                />
                <Button 
                  variant="ghost" 
                  onClick={() => openTokenModal('buy')}
                  className="flex items-center space-x-2 rounded-full px-3 py-2"
                  style={{
                    background: buyToken ? 'hsl(var(--accent))' : 'var(--gradient-primary)',
                    color: buyToken ? 'hsl(var(--accent-foreground))' : 'white'
                  }}
                >
                  {buyToken ? (
                    <>
                      <span className="text-lg">{buyToken.logo}</span>
                      <span className="font-semibold">{buyToken.symbol}</span>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span className="font-semibold">Select token</span>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
              {buyToken && (
                <div className="mt-2 text-sm text-muted-foreground">
                  ${buyAmount !== '0' ? (parseFloat(buyAmount || '0') * 1).toLocaleString() : '0'}
                </div>
              )}
            </div>
          </div>

          {/* Get Started Button */}
          <Button 
            variant="hero" 
            size="xl" 
            className="w-full mt-6"
            disabled={!buyToken || sellAmount === '0'}
          >
            {!buyToken ? 'Select a token' : sellAmount === '0' ? 'Enter an amount' : 'Get Started'}
          </Button>
        </div>
      </div>

      <TokenSelectorModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        onSelectToken={handleTokenSelect}
      />
    </>
  );
};

export default SwapCard;