#!/bin/bash

# Monad DEX Deployment Script
# This script deploys the OrderBookDEX contract to Monad testnet

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RPC_URL="https://rpc.testnet.monad.xyz"
CHAIN_ID="1337"
GAS_PRICE="20000000000" # 20 gwei

echo -e "${BLUE}🚀 Monad DEX Deployment Script${NC}"
echo "=================================="

# Check if Foundry is installed
if ! command -v forge &> /dev/null; then
    echo -e "${RED}❌ Foundry is not installed. Please install it first:${NC}"
    echo "curl -L https://foundry.paradigm.xyz | bash"
    echo "foundryup"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating template...${NC}"
    cat > .env << EOF
# Monad Testnet Configuration
PRIVATE_KEY=your_private_key_here
RPC_URL=$RPC_URL
CHAIN_ID=$CHAIN_ID
GAS_PRICE=$GAS_PRICE

# DEX Configuration
DEX_CONTRACT_NAME=OrderBookDEX
TRADING_FEE=30
LIQUIDITY_FEE=25

# Token Configuration
TOKEN_A_ADDRESS=your_token_a_address_here
TOKEN_B_ADDRESS=your_token_b_address_here
MIN_ORDER_SIZE=1000000000000000000
PRICE_PRECISION=1000000000000000000
EOF
    echo -e "${GREEN}✅ .env template created. Please update with your private key and token addresses.${NC}"
    exit 1
fi

# Load environment variables
source .env

# Check if private key is set
if [ "$PRIVATE_KEY" = "your_private_key_here" ]; then
    echo -e "${RED}❌ Please update your private key in .env file${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment loaded${NC}"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
forge install OpenZeppelin/openzeppelin-contracts --no-commit

# Compile contracts
echo -e "${BLUE}🔨 Compiling contracts...${NC}"
forge build

# Check if compilation was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Contract compilation failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Contracts compiled successfully${NC}"

# Deploy DEX contract
echo -e "${BLUE}🚀 Deploying OrderBookDEX to testnet...${NC}"
DEX_ADDRESS=$(forge create \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --gas-price $GAS_PRICE \
    contracts/OrderBookDEX.sol:OrderBookDEX \
    --json | jq -r '.deployedTo')

if [ "$DEX_ADDRESS" = "null" ] || [ -z "$DEX_ADDRESS" ]; then
    echo -e "${RED}❌ DEX deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ DEX deployed successfully at: $DEX_ADDRESS${NC}"

# Deploy test tokens if not provided
if [ "$TOKEN_A_ADDRESS" = "your_token_a_address_here" ]; then
    echo -e "${BLUE}🪙 Deploying test token A...${NC}"
    TOKEN_A_ADDRESS=$(forge create \
        --rpc-url $RPC_URL \
        --private-key $PRIVATE_KEY \
        --gas-price $GAS_PRICE \
        contracts/MonadToken.sol:MonadToken \
        --json | jq -r '.deployedTo')
    echo -e "${GREEN}✅ Token A deployed at: $TOKEN_A_ADDRESS${NC}"
fi

if [ "$TOKEN_B_ADDRESS" = "your_token_b_address_here" ]; then
    echo -e "${BLUE}🪙 Deploying test token B...${NC}"
    TOKEN_B_ADDRESS=$(forge create \
        --rpc-url $RPC_URL \
        --private-key $PRIVATE_KEY \
        --gas-price $GAS_PRICE \
        contracts/MonadToken.sol:MonadToken \
        --json | jq -r '.deployedTo')
    echo -e "${GREEN}✅ Token B deployed at: $TOKEN_B_ADDRESS${NC}"
fi

# Add trading pair to DEX
echo -e "${BLUE}📊 Adding trading pair to DEX...${NC}"
cast send $DEX_ADDRESS \
    "addTradingPair(address,address,uint256,uint256)" \
    $TOKEN_A_ADDRESS \
    $TOKEN_B_ADDRESS \
    $MIN_ORDER_SIZE \
    $PRICE_PRECISION \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --gas-price $GAS_PRICE

echo -e "${GREEN}✅ Trading pair added successfully${NC}"

# Save deployment info
echo -e "${BLUE}💾 Saving deployment information...${NC}"
mkdir -p config

# Create deployment info file
cat > config/dex-deployment.json << EOF
{
    "network": "monad_testnet",
    "rpc_url": "$RPC_URL",
    "chain_id": $CHAIN_ID,
    "deployment_time": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "dex_contract": {
        "name": "OrderBookDEX",
        "address": "$DEX_ADDRESS",
        "trading_fee": $TRADING_FEE,
        "liquidity_fee": $LIQUIDITY_FEE
    },
    "tokens": {
        "token_a": {
            "name": "TestTokenA",
            "address": "$TOKEN_A_ADDRESS"
        },
        "token_b": {
            "name": "TestTokenB", 
            "address": "$TOKEN_B_ADDRESS"
        }
    },
    "trading_pair": {
        "base_token": "$TOKEN_A_ADDRESS",
        "quote_token": "$TOKEN_B_ADDRESS",
        "min_order_size": $MIN_ORDER_SIZE,
        "price_precision": $PRICE_PRECISION
    }
}
EOF

echo -e "${GREEN}✅ DEX deployment completed!${NC}"
echo ""
echo -e "${YELLOW}📝 Deployment Summary:${NC}"
echo "DEX Contract: $DEX_ADDRESS"
echo "Token A: $TOKEN_A_ADDRESS"
echo "Token B: $TOKEN_B_ADDRESS"
echo ""
echo -e "${YELLOW}🔧 Next Steps:${NC}"
echo "1. Verify contracts on Monad block explorer"
echo "2. Test trading functionality using the DEX CLI tool"
echo "3. Add liquidity to the trading pair"
echo "4. Start trading!"
echo ""
echo -e "${BLUE}💡 Example DEX Commands:${NC}"
echo "# Get order book"
echo "cargo run --bin monad-dex get-order-book --address $DEX_ADDRESS --base-token $TOKEN_A_ADDRESS --quote-token $TOKEN_B_ADDRESS"
echo ""
echo "# Place limit buy order"
echo "cargo run --bin monad-dex place-limit-order --address $DEX_ADDRESS --base-token $TOKEN_A_ADDRESS --quote-token $TOKEN_B_ADDRESS --amount 1000000000000000000 --price 1000000000000000000 --is-buy true --private-key YOUR_PRIVATE_KEY"
echo ""
echo "# Place market sell order"
echo "cargo run --bin monad-dex place-market-order --address $DEX_ADDRESS --base-token $TOKEN_A_ADDRESS --quote-token $TOKEN_B_ADDRESS --amount 1000000000000000000 --is-buy false --private-key YOUR_PRIVATE_KEY" 