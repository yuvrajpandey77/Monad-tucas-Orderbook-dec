import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDEXStore } from '@/store/dex-store'
import { formatTokenAmount, formatNumber } from '@/lib/utils'
import { ArrowUp, ArrowDown } from 'lucide-react'

export function OrderBook() {
  const { orderBook, selectedPair } = useDEXStore()

  if (!selectedPair) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Book</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select a trading pair to view order book</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Book</CardTitle>
        <p className="text-sm text-muted-foreground">
          {selectedPair.baseTokenSymbol}/{selectedPair.quoteTokenSymbol}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Buy Orders */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowUp className="w-4 h-4 text-green-600" />
              <h4 className="font-medium text-green-600">Buy Orders</h4>
            </div>
            <div className="space-y-1">
              {orderBook.buyOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No buy orders</p>
              ) : (
                orderBook.buyOrders.slice(0, 10).map((order) => (
                  <div key={order.id} className="flex justify-between text-sm">
                    <span className="text-green-600">
                      {formatNumber(parseFloat(order.price))}
                    </span>
                    <span className="text-muted-foreground">
                      {formatTokenAmount(order.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sell Orders */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowDown className="w-4 h-4 text-red-600" />
              <h4 className="font-medium text-red-600">Sell Orders</h4>
            </div>
            <div className="space-y-1">
              {orderBook.sellOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sell orders</p>
              ) : (
                orderBook.sellOrders.slice(0, 10).map((order) => (
                  <div key={order.id} className="flex justify-between text-sm">
                    <span className="text-red-600">
                      {formatNumber(parseFloat(order.price))}
                    </span>
                    <span className="text-muted-foreground">
                      {formatTokenAmount(order.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 