import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, ChevronDown, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LimitOrderCard = () => {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [isProcessingBuy, setIsProcessingBuy] = useState(false);
  const [isProcessingSell, setIsProcessingSell] = useState(false);
  const { toast } = useToast();

  const handlePlaceBuyOrder = () => {
    if (!fromAmount || !toAmount || !limitPrice) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before placing your order.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingBuy(true);

    // Simulate order processing
    toast({
      title: "Processing Buy Order...",
      description: "Your order is being processed on the blockchain.",
    });

    // Simulate success after a short delay
    setTimeout(() => {
      setIsProcessingBuy(false);
      toast({
        title: "Buy Order Placed Successfully! 🎉",
        description: `Successfully placed buy order for ${toAmount} ETH at ${limitPrice} USDC per ETH. Order ID: #${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      });
    }, 1500);
  };

  const handlePlaceSellOrder = () => {
    if (!fromAmount || !toAmount || !limitPrice) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before placing your order.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingSell(true);

    // Simulate order processing
    toast({
      title: "Processing Sell Order...",
      description: "Your order is being processed on the blockchain.",
    });

    // Simulate success after a short delay
    setTimeout(() => {
      setIsProcessingSell(false);
      toast({
        title: "Sell Order Placed Successfully! 🎉",
        description: `Successfully placed sell order for ${fromAmount} ETH at ${limitPrice} USDC per ETH. Order ID: #${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      });
    }, 1500);
  };

  return (
    <Card className="w-full card-glass border-border/20">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Limit Order</h2>
          <Button variant="ghost" size="sm" className="p-2">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Buy/Sell Tabs */}
        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy" className="text-green-400 data-[state=active]:text-green-400">
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="text-red-400 data-[state=active]:text-red-400">
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-4 mt-6">
            {/* You Pay */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">You pay</Label>
              <div className="relative">
                <div className="flex items-center space-x-2 p-4 rounded-xl bg-accent/30 border border-border/20">
                  <Input
                    type="number"
                    placeholder="0"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="border-0 bg-transparent text-2xl font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0"
                  />
                  <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-background/50">
                    <div className="w-6 h-6 rounded-full bg-blue-500" />
                    <span className="font-medium">USDC</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Limit Price */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Limit price</Label>
              <div className="relative">
                <div className="flex items-center space-x-2 p-4 rounded-xl bg-accent/30 border border-border/20">
                  <Input
                    type="number"
                    placeholder="0"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    className="border-0 bg-transparent text-2xl font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0"
                  />
                  <span className="text-sm text-muted-foreground">USDC per ETH</span>
                </div>
              </div>
            </div>

            {/* You Receive */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">You receive</Label>
              <div className="relative">
                <div className="flex items-center space-x-2 p-4 rounded-xl bg-accent/30 border border-border/20">
                  <Input
                    type="number"
                    placeholder="0"
                    value={toAmount}
                    onChange={(e) => setToAmount(e.target.value)}
                    className="border-0 bg-transparent text-2xl font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0"
                  />
                  <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-background/50">
                    <div className="w-6 h-6 rounded-full bg-gray-800" />
                    <span className="font-medium">ETH</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handlePlaceBuyOrder}
              disabled={isProcessingBuy}
              className="w-full mt-6 h-12 text-base font-medium bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessingBuy ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                "Place Buy Order"
              )}
            </Button>
          </TabsContent>

          <TabsContent value="sell" className="space-y-4 mt-6">
            {/* You Pay */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">You pay</Label>
              <div className="relative">
                <div className="flex items-center space-x-2 p-4 rounded-xl bg-accent/30 border border-border/20">
                  <Input
                    type="number"
                    placeholder="0"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="border-0 bg-transparent text-2xl font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0"
                  />
                  <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-background/50">
                    <div className="w-6 h-6 rounded-full bg-gray-800" />
                    <span className="font-medium">ETH</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Limit Price */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Limit price</Label>
              <div className="relative">
                <div className="flex items-center space-x-2 p-4 rounded-xl bg-accent/30 border border-border/20">
                  <Input
                    type="number"
                    placeholder="0"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    className="border-0 bg-transparent text-2xl font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0"
                  />
                  <span className="text-sm text-muted-foreground">USDC per ETH</span>
                </div>
              </div>
            </div>

            {/* You Receive */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">You receive</Label>
              <div className="relative">
                <div className="flex items-center space-x-2 p-4 rounded-xl bg-accent/30 border border-border/20">
                  <Input
                    type="number"
                    placeholder="0"
                    value={toAmount}
                    onChange={(e) => setToAmount(e.target.value)}
                    className="border-0 bg-transparent text-2xl font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0"
                  />
                  <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-background/50">
                    <div className="w-6 h-6 rounded-full bg-blue-500" />
                    <span className="font-medium">USDC</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handlePlaceSellOrder}
              disabled={isProcessingSell}
              className="w-full mt-6 h-12 text-base font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessingSell ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                "Place Sell Order"
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LimitOrderCard;