import React from 'react';
import Navbar from '@/components/Navbar';
import LimitOrderCard from '@/components/LimitOrderCard';
import OrderBook from '@/components/OrderBook';
import FloatingOrbs from '@/components/FloatingOrbs';

const Limit = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating Background Orbs */}
      <FloatingOrbs />
      
      {/* Navigation */}
      <Navbar />
      
      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row justify-center items-center gap-8 max-w-6xl mx-auto">
          
          {/* Limit Order Interface */}
          <div className="flex max-w-md mx-auto lg:mx-0">
            <LimitOrderCard />
          </div>

          {/* Order Book */}
          <div className="flex max-w-md mx-auto lg:mx-0">
            <OrderBook />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Limit;