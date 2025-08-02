import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronDown, Menu, X, Wallet } from 'lucide-react';
import ConnectWallet from './ConnectWallet';
import { useDEXStore } from '@/store/dex-store';
import { formatAddress } from '@/lib/utils';

const Navbar = () => {
  const [isTradeDropdownOpen, setIsTradeDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConnectWalletOpen, setIsConnectWalletOpen] = useState(false);
  const { isConnected, account, disconnectWallet } = useDEXStore();

  const tradeOptions = [
    { name: 'Swap', href: '/' },
    { name: 'Limit', href: '/limit' },
    { name: 'Advanced Trading', href: '/trading' },
    { name: 'Buy', href: '#' },
    { name: 'Sell', href: '#' },
  ];

  return (
    <nav className="relative z-50 w-full border-b border-border/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Tucas DEX
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-baseline space-x-8">
              {/* Trade Dropdown */}
              <div className="relative">
                <button
                  className="flex h-full items-center text-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg text-sm font-medium"
                  onMouseEnter={() => setIsTradeDropdownOpen(true)}
                  onMouseLeave={() => setIsTradeDropdownOpen(false)}
                >
                  Trade
                  <ChevronDown className="ml-1 h-4 w-4 " />
                </button>
                
                {isTradeDropdownOpen && (
                  <div 
                    className="nav-dropdown bg-black"
                    onMouseEnter={() => setIsTradeDropdownOpen(true)}
                    onMouseLeave={() => setIsTradeDropdownOpen(false)}
                  >
                    <div className="py-2">
                      {tradeOptions.map((option) => (
                        <Link
                          key={option.name}
                          to={option.href}
                          className="block px-4 py-2 text-sm text-foreground hover:text-primary hover:bg-accent/50 transition-colors"
                        >
                          {option.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <a href="#" className="text-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg text-sm font-medium">
                Explore
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg text-sm font-medium">
                Pool
              </a>
            </div>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* <Button variant="outlined" size="sm">
              Get the app
            </Button> */}
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {formatAddress(account || '')}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={disconnectWallet}
                  className="border-border/20"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button variant="connect" size="sm" onClick={() => setIsConnectWalletOpen(true)}>
                <Wallet className="w-4 h-4 mr-2" />
                Connect
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-foreground hover:text-primary p-2"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 backdrop-blur-md">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a href="#" className="block px-3 py-2 rounded-lg text-base font-medium text-foreground hover:text-primary hover:bg-accent/50">
              Trade
            </a>
            <a href="#" className="block px-3 py-2 rounded-lg text-base font-medium text-foreground hover:text-primary hover:bg-accent/50">
              Explore
            </a>
            <a href="#" className="block px-3 py-2 rounded-lg text-base font-medium text-foreground hover:text-primary hover:bg-accent/50">
              Pool
            </a>
            <div className="px-3 pt-3 space-y-2">
              {/* <Button variant="outlined" className="w-full" size="sm">
                Get the app
              </Button> */}
              {isConnected ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {formatAddress(account || '')}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="sm" 
                    onClick={disconnectWallet}
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button variant="connect" className="w-full" size="sm" onClick={() => setIsConnectWalletOpen(true)}>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Connect Wallet Modal */}
      <ConnectWallet 
        isOpen={isConnectWalletOpen} 
        onClose={() => setIsConnectWalletOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;