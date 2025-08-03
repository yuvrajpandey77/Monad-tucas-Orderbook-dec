import React, { useEffect } from 'react'
import { useDEXStore } from '@/store/dex-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrderForm } from '@/components/trading/order-form'
import OrderBook from '@/components/OrderBook'
import { UserBalance } from '@/components/trading/user-balance'
import { UserOrders } from '@/components/trading/user-orders'
import { WithdrawForm } from '@/components/trading/withdraw-form'
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react'
import { formatAddress } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import Navbar from '@/components/Navbar'
import FloatingOrbs from '@/components/FloatingOrbs'
import PageTransition from '@/components/PageTransition'

function TradingInterface() {
  const {
    isConnected,
    account,
    selectedPair,
    setSelectedPair,
    error,
    clearError
  } = useDEXStore()

  const { toast } = useToast()

  // Trading pairs using deployed contracts
  const mockTradingPairs = React.useMemo(() => [
    {
      baseToken: '0x14F49BedD983423198d5402334dbccD9c45AC767', // MonadToken (deployed)
      quoteToken: '0x0000000000000000000000000000000000000000', // MONAD (native)
      baseTokenSymbol: 'MONAD',
      quoteTokenSymbol: 'MONAD',
      isActive: true,
      minOrderSize: '1000000000000000000', // 1 token
      pricePrecision: '1000000000000000000' // 18 decimals
    }
  ], [])

  useEffect(() => {
    if (mockTradingPairs.length > 0 && !selectedPair) {
      setSelectedPair(mockTradingPairs[0])
    }
  }, [selectedPair, setSelectedPair, mockTradingPairs])

  // Debug connection state
  useEffect(() => {
    console.log('Connection state changed:', { isConnected, account, error })
  }, [isConnected, account, error])



  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        {/* Floating Background Orbs */}
        <FloatingOrbs />
        
        {/* Navigation */}
        <Navbar />
        
        {/* Main Content */}
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Advanced Trading
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Execute limit and market orders with real-time order book data and advanced trading features.
          </p>

        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-md">
            <p className="text-red-600">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="mt-2 text-red-600 hover:text-red-700"
            >
              Dismiss
            </Button>
          </div>
        )}

        {selectedPair ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trading Forms */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Buy Orders */}
                <div className="space-y-4">
                  <OrderForm orderType="limit" side="buy" />
                  <OrderForm orderType="market" side="buy" />
                </div>

                {/* Sell Orders */}
                <div className="space-y-4">
                  <OrderForm orderType="limit" side="sell" />
                  <OrderForm orderType="market" side="sell" />
                </div>
              </div>
            </div>

            {/* Order Book and User Management */}
            <div className="space-y-6">
              <OrderBook />
              <UserBalance />
              <UserOrders />
              <WithdrawForm />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">No Trading Pair Selected</h2>
              <p className="text-muted-foreground mb-6">
                Please select a trading pair to start trading. The trading pair will be automatically selected when you connect your wallet.
              </p>
              <div className="p-4 bg-accent/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Current Status: {isConnected ? 'Wallet Connected' : 'Wallet Not Connected'}
                </p>
                {selectedPair && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected Pair: {selectedPair.baseTokenSymbol}/{selectedPair.quoteTokenSymbol}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Trading Pair Info */}
        {selectedPair && (
          <Card className="mt-6 card-glass border-border/20">
            <CardHeader>
              <CardTitle className="text-foreground">Selected Trading Pair</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Base Token</p>
                  <p className="font-medium text-foreground">{selectedPair.baseTokenSymbol}</p>
                  <p className="text-xs text-muted-foreground">{formatAddress(selectedPair.baseToken)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quote Token</p>
                  <p className="font-medium text-foreground">{selectedPair.quoteTokenSymbol}</p>
                  <p className="text-xs text-muted-foreground">{formatAddress(selectedPair.quoteToken)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
    </PageTransition>
  )
}

export default TradingInterface 