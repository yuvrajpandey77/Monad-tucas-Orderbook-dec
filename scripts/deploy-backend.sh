#!/bin/bash

# Monad DEX Backend Deployment Script
# This script automates the deployment process for the Rust backend

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v cargo &> /dev/null; then
        print_error "Rust is not installed. Please install Rust first: https://rustup.rs/"
        exit 1
    fi
    
    if ! command -v forge &> /dev/null; then
        print_error "Foundry is not installed. Please install Foundry first: https://getfoundry.sh/"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    # Check if .env exists
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            print_warning "Created .env from template. Please edit it with your settings."
        else
            print_error ".env.example not found. Please create a .env file manually."
            exit 1
        fi
    fi
    
    # Load environment variables
    if [ -f .env ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi
    
    print_success "Environment setup complete"
}

# Build the project
build_project() {
    print_status "Building project..."
    
    # Clean previous builds
    cargo clean
    
    # Build Rust binaries
    cargo build --release
    
    # Build Foundry contracts
    forge build
    
    print_success "Build complete"
}

# Deploy contracts
deploy_contracts() {
    print_status "Deploying contracts..."
    
    # Check if private key is set
    if [ -z "$PRIVATE_KEY" ]; then
        print_error "PRIVATE_KEY not set in .env file"
        exit 1
    fi
    
    # Check if RPC URL is set
    if [ -z "$RPC_URL" ]; then
        RPC_URL="https://rpc.testnet.monad.xyz"
        print_warning "RPC_URL not set, using default: $RPC_URL"
    fi
    
    # Deploy token contract
    print_status "Deploying MonadToken contract..."
    TOKEN_ADDRESS=$(forge create \
        --rpc-url "$RPC_URL" \
        --private-key "$PRIVATE_KEY" \
        --gas-price 20000000000 \
        contracts/MonadToken.sol:MonadToken \
        --json | jq -r '.deployedTo')
    
    if [ "$TOKEN_ADDRESS" = "null" ] || [ -z "$TOKEN_ADDRESS" ]; then
        print_error "Failed to deploy token contract"
        exit 1
    fi
    
    print_success "Token contract deployed to: $TOKEN_ADDRESS"
    
    # Save contract addresses
    echo "TOKEN_CONTRACT_ADDRESS=$TOKEN_ADDRESS" >> .env
    echo "DEX_CONTRACT_ADDRESS=$DEX_ADDRESS" >> .env
    
    print_success "Contract deployment complete"
}

# Test deployment
test_deployment() {
    print_status "Testing deployment..."
    
    # Load contract addresses
    source .env
    
    if [ -z "$TOKEN_CONTRACT_ADDRESS" ]; then
        print_error "Token contract address not found"
        exit 1
    fi
    
    # Test token contract
    print_status "Testing token contract..."
    cargo run --bin monad-interact info \
        --address "$TOKEN_CONTRACT_ADDRESS" \
        --rpc-url "$RPC_URL"
    
    print_success "Deployment test complete"
}

# Setup systemd service (optional)
setup_service() {
    if [ "$1" = "--service" ]; then
        print_status "Setting up systemd service..."
        
        # Create service file
        sudo tee /etc/systemd/system/monad-dex.service > /dev/null <<EOF
[Unit]
Description=Monad DEX Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
Environment=RUST_LOG=info
Environment=RPC_URL=$RPC_URL
Environment=PRIVATE_KEY=$PRIVATE_KEY
ExecStart=$(pwd)/target/release/monad-dex
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
        
        # Enable and start service
        sudo systemctl daemon-reload
        sudo systemctl enable monad-dex
        sudo systemctl start monad-dex
        
        print_success "Systemd service setup complete"
    fi
}

# Main deployment function
main() {
    print_status "Starting Monad DEX Backend deployment..."
    
    # Check dependencies
    check_dependencies
    
    # Setup environment
    setup_environment
    
    # Build project
    build_project
    
    # Deploy contracts
    deploy_contracts
    
    # Test deployment
    test_deployment
    
    # Setup service if requested
    if [ "$1" = "--service" ]; then
        setup_service --service
    fi
    
    print_success "Deployment completed successfully!"
    print_status "Next steps:"
    print_status "1. Update your frontend with the contract addresses"
    print_status "2. Test the DEX functionality"
    print_status "3. Monitor the application logs"
}

# Show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --service    Setup systemd service after deployment"
    echo "  --help       Show this help message"
    echo ""
    echo "Example:"
    echo "  $0 --service"
}

# Parse command line arguments
case "$1" in
    --help)
        usage
        exit 0
        ;;
    --service)
        main --service
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        usage
        exit 1
        ;;
esac 