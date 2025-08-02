import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDEXStore } from '@/store/dex-store'
import { Settings, Plus, AlertCircle } from 'lucide-react'
import { dexService } from '@/services/dex-service'
import { useToast } from '@/hooks/use-toast'
import { ethers } from 'ethers'

interface TradingPair {
  baseToken: string
  quoteToken: string
  baseTokenSymbol: string
  quoteTokenSymbol: string
  minOrderSize: string
  pricePrecision: string
}

export function TradingPairManager() {
  const { account, signer, isLoading, setLoading } = useDEXStore()
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    baseToken: '',
    quoteToken: '',
    baseTokenSymbol: '',
    quoteTokenSymbol: '',
    minOrderSize: '1000000000000000000', // 1 token default
    pricePrecision: '1000000000000000000', // 18 decimals default
  })
  const { toast } = useToast()

  const handleAddTradingPair = async () => {
    if (!signer || !formData.baseToken || !formData.quoteToken) return

    try {
      setIsAdding(true)
      await dexService.initialize(signer)
      
      // Note: This would require adding addTradingPair to the DEX service
      // For now, this is just a UI component
      toast({
        title: "Admin Function",
        description: "Trading pair management requires contract owner access",
        variant: "destructive",
      })
    } catch (error) {
      console.error('Failed to add trading pair:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to add trading pair'
      toast({
        title: "Add Trading Pair Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Trading Pair Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Connect wallet to manage trading pairs</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Trading Pair Manager
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Admin Only</span>
            </div>
            <p className="text-sm text-yellow-700">
              Only the contract owner can add trading pairs. Use the Rust CLI script for production.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="base-token">Base Token Address</Label>
              <Input
                id="base-token"
                value={formData.baseToken}
                onChange={(e) => handleInputChange('baseToken', e.target.value)}
                placeholder="0x..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="quote-token">Quote Token Address</Label>
              <Input
                id="quote-token"
                value={formData.quoteToken}
                onChange={(e) => handleInputChange('quoteToken', e.target.value)}
                placeholder="0x..."
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="base-symbol">Base Token Symbol</Label>
              <Input
                id="base-symbol"
                value={formData.baseTokenSymbol}
                onChange={(e) => handleInputChange('baseTokenSymbol', e.target.value)}
                placeholder="MONAD"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="quote-symbol">Quote Token Symbol</Label>
              <Input
                id="quote-symbol"
                value={formData.quoteTokenSymbol}
                onChange={(e) => handleInputChange('quoteTokenSymbol', e.target.value)}
                placeholder="ETH"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min-order-size">Min Order Size (wei)</Label>
              <Input
                id="min-order-size"
                value={formData.minOrderSize}
                onChange={(e) => handleInputChange('minOrderSize', e.target.value)}
                placeholder="1000000000000000000"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="price-precision">Price Precision (wei)</Label>
              <Input
                id="price-precision"
                value={formData.pricePrecision}
                onChange={(e) => handleInputChange('pricePrecision', e.target.value)}
                placeholder="1000000000000000000"
                className="mt-1"
              />
            </div>
          </div>

          <Button
            onClick={handleAddTradingPair}
            disabled={isAdding || !formData.baseToken || !formData.quoteToken}
            className="w-full"
          >
            {isAdding ? (
              <>
                <Plus className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Trading Pair
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 