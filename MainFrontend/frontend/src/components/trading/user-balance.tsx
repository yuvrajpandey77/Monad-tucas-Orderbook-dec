import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDEXStore } from '@/store/dex-store'
import { formatTokenAmount } from '@/lib/utils'
import { Wallet, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { dexService } from '@/services/dex-service'

export function UserBalance() {
  const { account, signer, selectedPair, isLoading, setLoading } = useDEXStore()
  const [balances, setBalances] = useState<{ [key: string]: string }>({})

  const fetchBalances = async () => {
    if (!account || !signer || !selectedPair) return

    try {
      setLoading(true)
      await dexService.initialize(signer)
      
      const baseBalance = await dexService.getUserBalance(account, selectedPair.baseToken)
      const quoteBalance = await dexService.getUserBalance(account, selectedPair.quoteToken)
      
      setBalances({
        [selectedPair.baseToken]: baseBalance,
        [selectedPair.quoteToken]: quoteBalance,
      })
    } catch (error) {
      console.error('Failed to fetch balances:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (account && signer && selectedPair) {
      fetchBalances()
    }
  }, [account, signer, selectedPair])

  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            User Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Connect wallet to view balances</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            User Balance
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchBalances}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {selectedPair ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{selectedPair.baseTokenSymbol}</span>
              <span className="font-medium">
                {balances[selectedPair.baseToken] 
                  ? formatTokenAmount(balances[selectedPair.baseToken])
                  : '0.000000'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{selectedPair.quoteTokenSymbol}</span>
              <span className="font-medium">
                {balances[selectedPair.quoteToken]
                  ? formatTokenAmount(balances[selectedPair.quoteToken])
                  : '0.000000'
                }
              </span>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Select a trading pair to view balances</p>
        )}
      </CardContent>
    </Card>
  )
} 