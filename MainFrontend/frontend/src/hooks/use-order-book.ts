import { useState, useCallback, useEffect, useRef } from 'react';
import { useDEXStore } from '@/store/dex-store';
import { dexService } from '@/services/dex-service';
import { ethers } from 'ethers';

interface OrderBookOrder {
  id: string;
  price: string;
  amount: string;
  total: string;
  isBuy: boolean;
  isActive: boolean;
  timestamp: number;
  trader: string;
  baseToken: string;
  quoteToken: string;
}

interface OrderBookData {
  buyOrders: OrderBookOrder[];
  sellOrders: OrderBookOrder[];
}

// Mock data for testing when contract is not available
const getMockOrderBook = (baseToken: string, quoteToken: string): OrderBookData => {
  const basePrice = 1.5; // Base price for MONAD/USDC
  const spread = 0.1; // 10% spread
  
  const buyOrders: OrderBookOrder[] = [];
  const sellOrders: OrderBookOrder[] = [];
  
  // Generate mock buy orders (below market price)
  for (let i = 0; i < 5; i++) {
    const price = basePrice - (spread * (i + 1) * 0.1);
    const amount = 0.1 + (Math.random() * 0.9);
    const total = price * amount;
    
    buyOrders.push({
      id: `buy-${i}`,
      price: price.toFixed(4),
      amount: amount.toFixed(4),
      total: total.toFixed(2),
      isBuy: true,
      isActive: true,
      timestamp: Date.now() - (i * 60000), // Different timestamps
      trader: `0x${Math.random().toString(16).slice(2, 42)}`,
      baseToken,
      quoteToken,
    });
  }
  
  // Generate mock sell orders (above market price)
  for (let i = 0; i < 5; i++) {
    const price = basePrice + (spread * (i + 1) * 0.1);
    const amount = 0.1 + (Math.random() * 0.9);
    const total = price * amount;
    
    sellOrders.push({
      id: `sell-${i}`,
      price: price.toFixed(4),
      amount: amount.toFixed(4),
      total: total.toFixed(2),
      isBuy: false,
      isActive: true,
      timestamp: Date.now() - (i * 60000), // Different timestamps
      trader: `0x${Math.random().toString(16).slice(2, 42)}`,
      baseToken,
      quoteToken,
    });
  }
  
  return {
    buyOrders: buyOrders.sort((a, b) => parseFloat(b.price) - parseFloat(a.price)),
    sellOrders: sellOrders.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)),
  };
};

export const useOrderBook = () => {
  const { selectedPair, isConnected, signer } = useDEXStore();
  const [orderBookData, setOrderBookData] = useState<OrderBookData>({
    buyOrders: [],
    sellOrders: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPrice, setLastPrice] = useState<string>('0');
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchOrderBook = useCallback(async () => {
    if (!selectedPair) {
      setError('Please select a trading pair');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let orderBook: OrderBookData;

      // Try to fetch from smart contract if connected
      if (isConnected && signer) {
        try {
          console.log('Fetching order book from smart contract...');
          await dexService.initialize(signer);
          
          // Check if contract is deployed
          const isDeployed = await dexService.isContractDeployed();
          if (!isDeployed) {
            throw new Error('DEX contract is not deployed');
          }
          
          const contractOrderBook = await dexService.getOrderBook(
            selectedPair.baseToken,
            selectedPair.quoteToken
          );

          console.log('Raw order book data:', contractOrderBook);

          // Process and format the orders with proper error handling
          const processedBuyOrders = contractOrderBook.buyOrders
            .filter((order: OrderBookOrder) => {
              try {
                return order.isActive && 
                       parseFloat(order.amount) > 0 && 
                       parseFloat(order.price) > 0;
              } catch {
                return false;
              }
            })
            .map((order: OrderBookOrder) => {
              try {
                const price = ethers.formatEther(order.price);
                const amount = ethers.formatEther(order.amount);
                const total = (parseFloat(price) * parseFloat(amount)).toFixed(2);
                
                return {
                  ...order,
                  price,
                  amount,
                  total
                };
              } catch (error) {
                console.error('Error processing buy order:', error);
                return null;
              }
            })
            .filter(Boolean)
            .sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
            .slice(0, 10);

          const processedSellOrders = contractOrderBook.sellOrders
            .filter((order: OrderBookOrder) => {
              try {
                return order.isActive && 
                       parseFloat(order.amount) > 0 && 
                       parseFloat(order.price) > 0;
              } catch {
                return false;
              }
            })
            .map((order: OrderBookOrder) => {
              try {
                const price = ethers.formatEther(order.price);
                const amount = ethers.formatEther(order.amount);
                const total = (parseFloat(price) * parseFloat(amount)).toFixed(2);
                
                return {
                  ...order,
                  price,
                  amount,
                  total
                };
              } catch (error) {
                console.error('Error processing sell order:', error);
                return null;
              }
            })
            .filter(Boolean)
            .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
            .slice(0, 10);

          orderBook = {
            buyOrders: processedBuyOrders,
            sellOrders: processedSellOrders
          };

          setIsUsingMockData(false);
          console.log('Processed order book data:', orderBook);

        } catch (contractError) {
          console.error('Contract fetch failed, using mock data:', contractError);
          
          // Check if it's a circuit breaker error
          const errorMessage = contractError instanceof Error ? contractError.message.toLowerCase() : '';
          const isCircuitBreakerError = errorMessage.includes('circuit breaker') || 
                                      errorMessage.includes('execution prevented');
          
          orderBook = getMockOrderBook(selectedPair.baseToken, selectedPair.quoteToken);
          setIsUsingMockData(true);
          
          if (isCircuitBreakerError) {
            setError('MetaMask circuit breaker active - using demo data. Please wait before refreshing.');
          } else if (errorMessage.includes('not deployed')) {
            setError('DEX contract not deployed - using demo data');
          } else {
            setError('Using demo data - contract not available');
          }
        }
      } else {
        // Use mock data when not connected
        orderBook = getMockOrderBook(selectedPair.baseToken, selectedPair.quoteToken);
        setIsUsingMockData(true);
        setError('Using demo data - connect wallet for real data');
      }

      setOrderBookData(orderBook);

      // Calculate last price (midpoint between best buy and sell)
      if (orderBook.buyOrders.length > 0 && orderBook.sellOrders.length > 0) {
        const bestBuyPrice = parseFloat(orderBook.buyOrders[0].price);
        const bestSellPrice = parseFloat(orderBook.sellOrders[0].price);
        const midPrice = ((bestBuyPrice + bestSellPrice) / 2).toFixed(4);
        setLastPrice(midPrice);
      } else if (orderBook.buyOrders.length > 0) {
        setLastPrice(orderBook.buyOrders[0].price);
      } else if (orderBook.sellOrders.length > 0) {
        setLastPrice(orderBook.sellOrders[0].price);
      } else {
        setLastPrice('0.0000');
      }

      setLastUpdate(Date.now());

    } catch (err) {
      console.error('Error fetching order book:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch order book');
      // Fallback to mock data
      const mockData = getMockOrderBook(selectedPair.baseToken, selectedPair.quoteToken);
      setOrderBookData(mockData);
      setIsUsingMockData(true);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPair, isConnected, signer]);

  // Fetch order book on component mount and when selected pair changes
  useEffect(() => {
    fetchOrderBook();
  }, [fetchOrderBook]);

  // Set up polling to refresh order book every 10 seconds
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    if (selectedPair) {
      intervalRef.current = setInterval(() => {
        fetchOrderBook();
      }, 10000); // 10 seconds
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedPair, fetchOrderBook]);

  return {
    orderBookData,
    isLoading,
    error,
    lastPrice,
    lastUpdate,
    fetchOrderBook,
    isUsingMockData,
  };
}; 