import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDEXStore } from './store/dex-store'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { OrderForm } from './components/trading/order-form'
import { OrderBook } from './components/trading/order-book'
import { Wallet, BarChart3 } from 'lucide-react'
import { formatAddress } from './lib/utils'

const queryClient = new QueryClient()

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

  // Mock trading pairs for demo
  const mockTradingPairs = [
    {
      baseToken: '0x1234567890123456789012345678901234567890',
      quoteToken: '0x0987654321098765432109876543210987654321',
      baseTokenSymbol: 'MONAD',
      quoteTokenSymbol: 'USDC',
      isActive: true,
      minOrderSize: '1000000000000000000',
      pricePrecision: '1000000000000000000'
    }
  ]

  useEffect(() => {
    if (mockTradingPairs.length > 0 && !selectedPair) {
      setSelectedPair(mockTradingPairs[0])
    }
  }, [selectedPair, setSelectedPair])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Monad DEX</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {isConnected ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {formatAddress(account || '')}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectWallet}
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button onClick={connectWallet}>
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
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="mt-2"
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

          {/* Order Book */}
          <div>
            <OrderBook />
          </div>
        </div>

        {/* Trading Pair Info */}
        {selectedPair && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Selected Trading Pair</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Base Token</p>
                  <p className="font-medium">{selectedPair.baseTokenSymbol}</p>
                  <p className="text-xs text-gray-500">{formatAddress(selectedPair.baseToken)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quote Token</p>
                  <p className="font-medium">{selectedPair.quoteTokenSymbol}</p>
                  <p className="text-xs text-gray-500">{formatAddress(selectedPair.quoteToken)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TradingInterface />
    </QueryClientProvider>
  )
}

export default App
