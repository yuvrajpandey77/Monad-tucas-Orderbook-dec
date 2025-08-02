#!/bin/bash

# Monad Testnet Deployment Script
# This script deploys the MonadToken contract to Monad testnet

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RPC_URL="https://rpc.testnet.monad.xyz"
CHAIN_ID="1337" # Monad testnet chain ID
GAS_PRICE="20000000000" # 20 gwei

echo -e "${BLUE}🚀 Monad Testnet Deployment Script${NC}"
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

# Contract Configuration
CONTRACT_NAME=MonadToken
CONTRACT_SYMBOL=MONAD
INITIAL_SUPPLY=1000000000000000000000000
EOF
    echo -e "${GREEN}✅ .env template created. Please update with your private key.${NC}"
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

# Deploy contract
echo -e "${BLUE}🚀 Deploying MonadToken to testnet...${NC}"
forge create \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --gas-price $GAS_PRICE \
    contracts/MonadToken.sol:MonadToken

# Save deployment info
echo -e "${BLUE}💾 Saving deployment information...${NC}"
mkdir -p config

# Create deployment info file
cat > config/deployment.json << EOF
{
    "network": "monad_testnet",
    "rpc_url": "$RPC_URL",
    "chain_id": $CHAIN_ID,
    "deployment_time": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "contract_name": "MonadToken",
    "contract_symbol": "MONAD"
}
EOF

echo -e "${GREEN}✅ Deployment script completed!${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Update the contract address in config/deployment.json"
echo "2. Verify your contract on Monad block explorer"
echo "3. Test your contract using the interaction script" 