import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDEXStore } from '@/store/dex-store'
import { TrendingUp, TrendingDown } from 'lucide-react'

const orderSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  price: z.string().min(1, 'Price is required'),
})

type OrderFormData = z.infer<typeof orderSchema>

interface OrderFormProps {
  orderType: 'limit' | 'market'
  side: 'buy' | 'sell'
}

export function OrderForm({ orderType, side }: OrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { selectedPair, signer, setError, clearError } = useDEXStore()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
  })

  const onSubmit = async (data: OrderFormData) => {
    if (!selectedPair || !signer) {
      setError('Please connect wallet and select a trading pair')
      return
    }

    try {
      setIsSubmitting(true)
      clearError()

      // Here you would call your Rust backend or directly interact with the contract
      // For now, we'll simulate the transaction
      await new Promise(resolve => setTimeout(resolve, 2000))

      console.log('Order placed:', {
        type: orderType,
        side,
        amount: data.amount,
        price: data.price,
        pair: selectedPair,
      })

      reset()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to place order')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isBuy = side === 'buy'
  const buttonColor = isBuy ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
  const icon = isBuy ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {orderType.charAt(0).toUpperCase() + orderType.slice(1)} {side.charAt(0).toUpperCase() + side.slice(1)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Amount ({selectedPair?.baseTokenSymbol || 'TOKEN'})
            </label>
            <Input
              {...register('amount')}
              type="number"
              step="0.000001"
              placeholder="0.0"
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
            )}
          </div>

          {orderType === 'limit' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Price ({selectedPair?.quoteTokenSymbol || 'QUOTE'})
              </label>
              <Input
                {...register('price')}
                type="number"
                step="0.000001"
                placeholder="0.0"
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
              )}
            </div>
          )}

          <Button
            type="submit"
            className={`w-full ${buttonColor}`}
            disabled={isSubmitting || !selectedPair}
          >
            {isSubmitting ? 'Placing Order...' : `${orderType.charAt(0).toUpperCase() + orderType.slice(1)} ${side.charAt(0).toUpperCase() + side.slice(1)}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 