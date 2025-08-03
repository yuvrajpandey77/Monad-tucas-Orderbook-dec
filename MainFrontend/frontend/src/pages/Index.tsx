import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import SwapCard from '@/components/SwapCard';
import FloatingOrbs from '@/components/FloatingOrbs';
import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating Background Orbs */}
      <FloatingOrbs />
      
      {/* Navigation */}
      <Navbar />
      
      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
          
          {/* Hero Section */}
          <div className="text-center mb-12 max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Swap anytime,
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                anywhere.
              </span>
            </h1>
          </div>

          {/* Swap Interface */}
          <div className="w-full max-w-md">
            <SwapCard />
          </div>

          {/* Description */}
          <div className="text-center mt-12 max-w-2xl">
            <p className="text-lg text-muted-foreground mb-8">
              The largest onchain marketplace. Buy and sell crypto on Monad and 12+ other chains.
            </p>
            
            {/* Trading Interface Link */}
            <Link to="/trading">
              <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg">
                <BarChart3 className="w-5 h-5 mr-2" />
                Advanced Trading
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
