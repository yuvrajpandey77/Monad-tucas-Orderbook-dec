import React, { useEffect } from 'react'
import { useDEXStore } from '@/store/dex-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrderForm } from '@/components/trading/order-form'
import { OrderBook } from '@/components/trading/order-book'
import { UserBalance } from '@/components/trading/user-balance'
import { UserOrders } from '@/components/trading/user-orders'
import { WithdrawForm } from '@/components/trading/withdraw-form'
import { Wallet, BarChart3, TrendingUp, TrendingDown } from 'lucide-react'
import { formatAddress } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

function TradingInterface() {
  const {
    isConnected,
    account,
    connectWallet,
    disconnectWallet,
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
      quoteToken: '0x0000000000000000000000000000000000000000', // ETH (native)
      baseTokenSymbol: 'MONAD',
      quoteTokenSymbol: 'ETH',
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

  const handleConnectWallet = async () => {
    try {
      console.log('Trading page: Starting wallet connection...')
      await connectWallet()
      console.log('Trading page: Wallet connection successful')
      toast({
        title: "Wallet Connected! 🎉",
        description: `Successfully connected to ${formatAddress(account || '')}`,
      })
    } catch (error) {
      console.error('Trading page: Wallet connection failed:', error)
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : 'Failed to connect wallet',
        variant: "destructive",
      })
    }
  }

  const handleDisconnectWallet = () => {
    disconnectWallet()
    toast({
      title: "Wallet Disconnected",
      description: "You have been disconnected from your wallet.",
    })
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-primary mr-3" />
              <h1 className="text-xl font-bold text-foreground">Monad DEX</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {isConnected ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {formatAddress(account || '')}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnectWallet}
                    className="border-border/20"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button onClick={handleConnectWallet} className="bg-primary hover:bg-primary/90">
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
  )
}

export default TradingInterface 