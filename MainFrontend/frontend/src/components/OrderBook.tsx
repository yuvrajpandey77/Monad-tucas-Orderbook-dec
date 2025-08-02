import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const OrderBook = () => {
  // Mock data for order book
  const sellOrders = [
    { price: 3125.45, amount: 0.234, total: 731.35 },
    { price: 3124.32, amount: 0.567, total: 1771.49 },
    { price: 3123.18, amount: 0.891, total: 2782.71 },
    { price: 3122.05, amount: 1.234, total: 3852.62 },
    { price: 3120.91, amount: 0.456, total: 1423.13 },
  ];

  const buyOrders = [
    { price: 3119.78, amount: 0.678, total: 2115.21 },
    { price: 3118.65, amount: 1.123, total: 3500.64 },
    { price: 3117.52, amount: 0.789, total: 2459.72 },
    { price: 3116.39, amount: 0.345, total: 1075.15 },
    { price: 3115.26, amount: 0.912, total: 2841.12 },
  ];

  return (
    <Card className="w-full card-glass border-border/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">Order Book</CardTitle>
        <div className="text-sm text-muted-foreground">ETH/USDC</div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Header */}
        <div className="grid grid-cols-3 gap-4 px-6 py-2 text-xs text-muted-foreground border-b border-border/20">
          <div>Price (USDC)</div>
          <div className="text-right">Amount (ETH)</div>
          <div className="text-right">Total (USDC)</div>
        </div>

        {/* Sell Orders */}
        <div className="px-6 py-2">
          <div className="text-xs text-red-400 mb-2 font-medium">SELL ORDERS</div>
          {sellOrders.map((order, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 py-1 text-sm hover:bg-red-500/10 transition-colors">
              <div className="text-red-400 font-mono">{order.price.toFixed(2)}</div>
              <div className="text-right text-foreground font-mono">{order.amount.toFixed(3)}</div>
              <div className="text-right text-muted-foreground font-mono">{order.total.toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Current Price */}
        <div className="px-6 py-4 border-y border-border/20 bg-accent/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 font-mono">3119.78</div>
            <div className="text-xs text-muted-foreground">Last Price</div>
          </div>
        </div>

        {/* Buy Orders */}
        <div className="px-6 py-2">
          <div className="text-xs text-green-400 mb-2 font-medium">BUY ORDERS</div>
          {buyOrders.map((order, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 py-1 text-sm hover:bg-green-500/10 transition-colors">
              <div className="text-green-400 font-mono">{order.price.toFixed(2)}</div>
              <div className="text-right text-foreground font-mono">{order.amount.toFixed(3)}</div>
              <div className="text-right text-muted-foreground font-mono">{order.total.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderBook;