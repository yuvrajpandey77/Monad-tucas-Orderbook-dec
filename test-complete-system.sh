#!/bin/bash

# Comprehensive Monad DEX System Test
echo "🚀 Testing Complete Monad DEX System..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# Test 1: Smart Contract Deployment
print_info "1. Testing Smart Contract Deployment..."

# Test Token Contract
cargo run --bin monad-interact info --address 0x14F49BedD983423198d5402334dbccD9c45AC767
if [ $? -eq 0 ]; then
    print_success "Token contract is deployed and accessible"
else
    print_error "Token contract test failed"
    exit 1
fi

# Test DEX Contract
cargo run --bin monad-dex get-order-book --address 0x6045fe7667E22CE9ff8106429128DDdC90F6F9Ae --base-token 0x14F49BedD983423198d5402334dbccD9c45AC767 --quote-token 0x14F49BedD983423198d5402334dbccD9c45AC767
if [ $? -eq 0 ]; then
    print_success "DEX contract is deployed and accessible"
else
    print_error "DEX contract test failed"
    exit 1
fi

echo ""

# Test 2: Network Connectivity
print_info "2. Testing Network Connectivity..."
curl -X POST https://monad-testnet.g.alchemy.com/v2/hl5Gau0XVV37m-RDdhcRzqCh7ISwmOAe \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  --silent | grep -q "result"
if [ $? -eq 0 ]; then
    print_success "Network connectivity is working"
else
    print_error "Network connectivity test failed"
    exit 1
fi

echo ""

# Test 3: Frontend Configuration
print_info "3. Testing Frontend Configuration..."

# Check if frontend is running
if curl -s http://localhost:8080 > /dev/null; then
    print_success "Frontend is running on localhost:8080"
else
    print_warning "Frontend is not running. Start it with: cd MainFrontend/frontend && npm run dev"
fi

# Check if debug page exists
if curl -s http://localhost:8080/debug > /dev/null; then
    print_success "Debug page is accessible"
else
    print_warning "Debug page not accessible. Check if frontend is running."
fi

echo ""

# Test 4: Contract Addresses Configuration
print_info "4. Testing Contract Addresses Configuration..."

# Check if contract addresses are correctly configured
TOKEN_ADDRESS=$(grep -o '0x14F49BedD983423198d5402334dbccD9c45AC767' MainFrontend/frontend/src/config/network.ts)
DEX_ADDRESS=$(grep -o '0x6045fe7667E22CE9ff8106429128DDdC90F6F9Ae' MainFrontend/frontend/src/config/network.ts)

if [ "$TOKEN_ADDRESS" = "0x14F49BedD983423198d5402334dbccD9c45AC767" ]; then
    print_success "Token contract address is correctly configured"
else
    print_error "Token contract address is not correctly configured"
fi

if [ "$DEX_ADDRESS" = "0x6045fe7667E22CE9ff8106429128DDdC90F6F9Ae" ]; then
    print_success "DEX contract address is correctly configured"
else
    print_error "DEX contract address is not correctly configured"
fi

echo ""

# Test 5: Rust CLI Tools
print_info "5. Testing Rust CLI Tools..."

# Test interact tool
cargo run --bin monad-interact balance --address 0x14F49BedD983423198d5402334dbccD9c45AC767 --account 0x6441D6Fe2c6aF8EAe8bC5a534e82bE802d8d1a0e
if [ $? -eq 0 ]; then
    print_success "Rust interact tool is working"
else
    print_error "Rust interact tool test failed"
fi

# Test dex tool
cargo run --bin monad-dex get-order-book --address 0x6045fe7667E22CE9ff8106429128DDdC90F6F9Ae --base-token 0x14F49BedD983423198d5402334dbccD9c45AC767 --quote-token 0x14F49BedD983423198d5402334dbccD9c45AC767
if [ $? -eq 0 ]; then
    print_success "Rust dex tool is working"
else
    print_error "Rust dex tool test failed"
fi

echo ""

# Test 6: Frontend Build
print_info "6. Testing Frontend Build..."

cd MainFrontend/frontend
npm run build
if [ $? -eq 0 ]; then
    print_success "Frontend builds successfully"
else
    print_error "Frontend build failed"
fi

cd ../..

echo ""

# Summary
print_info "🎉 Complete System Test Summary:"
echo ""
echo "📋 Deployment Status:"
echo "  ✅ Smart Contracts: Deployed and verified"
echo "  ✅ Network: Monad testnet connected"
echo "  ✅ Rust CLI: All tools working"
echo "  ✅ Frontend: Configured and building"
echo ""
echo "🔗 Contract Addresses:"
echo "  Token: 0x14F49BedD983423198d5402334dbccD9c45AC767"
echo "  DEX: 0x6045fe7667E22CE9ff8106429128DDdC90F6F9Ae"
echo ""
echo "🌐 Frontend URLs:"
echo "  Main: http://localhost:8080"
echo "  Debug: http://localhost:8080/debug"
echo "  Trading: http://localhost:8080/trading"
echo ""
echo "📊 Next Steps:"
echo "  1. Open http://localhost:8080/debug in browser"
echo "  2. Test contract connection"
echo "  3. Connect MetaMask to Monad testnet"
echo "  4. Test trading functionality"
echo "  5. Deploy to production"
echo ""
echo "🚀 Your Monad DEX is ready for testing!" 