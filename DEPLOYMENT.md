# Backend Deployment Guide

This guide covers deploying the Rust backend for the Monad DEX application.

## 🏗️ Architecture Overview

The backend consists of:
- **Smart Contracts**: Solidity contracts for DEX functionality
- **Rust CLI Tools**: Command-line tools for deployment and interaction
- **Foundry Integration**: For contract compilation and deployment

## 📋 Prerequisites

### Required Software
- [Rust](https://rustup.rs/) (latest stable)
- [Foundry](https://getfoundry.sh/) (for smart contract compilation)
- [Git](https://git-scm.com/)
- [Docker](https://docs.docker.com/) (optional, for containerized deployment)

### Monad Testnet Setup
1. Get testnet tokens from [Monad Faucet](https://faucet.monad.xyz)
2. Set up your wallet (MetaMask recommended)
3. Add Monad testnet to your wallet:
   - **Network Name**: Monad Testnet
   - **RPC URL**: `https://rpc.testnet.monad.xyz`
   - **Chain ID**: `1337`
   - **Currency Symbol**: `MONAD`

## 🚀 Deployment Options

### Option 1: Local Development Deployment

#### Step 1: Environment Setup
```bash
cd rust-project

# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

Update `.env` with your settings:
```env
# Monad Testnet Configuration
PRIVATE_KEY=your_private_key_here
RPC_URL=https://rpc.testnet.monad.xyz
CHAIN_ID=1337
GAS_PRICE=20000000000

# Contract Configuration
CONTRACT_NAME=MonadToken
CONTRACT_SYMBOL=MONAD
INITIAL_SUPPLY=1000000000000000000000000
```

#### Step 2: Build Dependencies
```bash
# Install Rust dependencies
cargo build

# Install Foundry dependencies
forge install OpenZeppelin/openzeppelin-contracts --no-commit
```

#### Step 3: Compile Contracts
```bash
# Compile all contracts
forge build
```

#### Step 4: Deploy Contracts
```bash
# Deploy using Foundry
forge create \
    --rpc-url https://rpc.testnet.monad.xyz \
    --private-key YOUR_PRIVATE_KEY \
    --gas-price 20000000000 \
    contracts/MonadToken.sol:MonadToken

# Or use the Rust deployment tool
cargo run --bin monad-deploy deploy \
    --private-key YOUR_PRIVATE_KEY \
    --rpc-url https://rpc.testnet.monad.xyz \
    --gas-price 20000000000
```

### Option 2: Docker Deployment

#### Step 1: Create Dockerfile
```dockerfile
# Dockerfile
FROM rust:1.75 as builder

WORKDIR /app
COPY . .

# Install Foundry
RUN curl -L https://foundry.paradigm.xyz | bash
RUN /root/.foundry/bin/foundryup

# Build the application
RUN cargo build --release
RUN forge build

# Runtime stage
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/target/release/monad-deploy /app/
COPY --from=builder /app/target/release/monad-interact /app/
COPY --from=builder /app/target/release/monad-dex /app/
COPY --from=builder /app/out/ /app/out/

CMD ["./monad-deploy"]
```

#### Step 2: Build and Run Docker Container
```bash
# Build the Docker image
docker build -t monad-dex-backend .

# Run the container
docker run -it --rm \
    -e PRIVATE_KEY=your_private_key \
    -e RPC_URL=https://rpc.testnet.monad.xyz \
    monad-dex-backend
```

### Option 3: Cloud Deployment

#### AWS EC2 Deployment

1. **Launch EC2 Instance**:
```bash
# Use Ubuntu 22.04 LTS
# Instance type: t3.medium or larger
# Security group: Allow SSH (port 22) and your app ports
```

2. **Install Dependencies**:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
foundryup

# Install additional dependencies
sudo apt install -y build-essential git
```

3. **Deploy Application**:
```bash
# Clone your repository
git clone <your-repo-url>
cd rust-project

# Build the application
cargo build --release
forge build

# Set up environment
cp .env.example .env
# Edit .env with your production settings
```

4. **Set up Systemd Service** (optional):
```bash
# Create service file
sudo nano /etc/systemd/system/monad-dex.service
```

```ini
[Unit]
Description=Monad DEX Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/rust-project
Environment=RUST_LOG=info
ExecStart=/home/ubuntu/rust-project/target/release/monad-dex
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start the service
sudo systemctl enable monad-dex
sudo systemctl start monad-dex
```

#### Google Cloud Platform Deployment

1. **Create Compute Engine Instance**:
```bash
# Create instance with Ubuntu 22.04
gcloud compute instances create monad-dex-backend \
    --zone=us-central1-a \
    --machine-type=e2-medium \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud
```

2. **Install Dependencies** (same as AWS):
```bash
# Follow the same installation steps as AWS
```

3. **Deploy Application**:
```bash
# Same deployment steps as AWS
```

#### DigitalOcean Droplet Deployment

1. **Create Droplet**:
   - Choose Ubuntu 22.04 LTS
   - Select appropriate size (2GB RAM minimum)
   - Add SSH key for secure access

2. **Install Dependencies**:
```bash
# Same installation steps as AWS
```

3. **Deploy Application**:
```bash
# Same deployment steps as AWS
```

## 🔧 Configuration Management

### Environment Variables
```bash
# Production environment
export RUST_LOG=info
export RPC_URL=https://rpc.testnet.monad.xyz
export CHAIN_ID=1337
export GAS_PRICE=20000000000
export PRIVATE_KEY=your_private_key
```

### Configuration Files
```bash
# Create production config
mkdir -p config/production
cp config/default.toml config/production/
# Edit production configuration
```

## 🧪 Testing Deployment

### Local Testing
```bash
# Test contract deployment
cargo run --bin monad-deploy deploy \
    --private-key YOUR_PRIVATE_KEY \
    --rpc-url https://rpc.testnet.monad.xyz

# Test contract interaction
cargo run --bin monad-interact info \
    --address DEPLOYED_CONTRACT_ADDRESS \
    --rpc-url https://rpc.testnet.monad.xyz
```

### Testnet Testing
```bash
# Test DEX functionality
cargo run --bin monad-dex add-trading-pair \
    --address DEX_CONTRACT_ADDRESS \
    --base-token BASE_TOKEN_ADDRESS \
    --quote-token QUOTE_TOKEN_ADDRESS \
    --min-order-size 1000000000000000000 \
    --price-precision 1000000000000000000 \
    --private-key YOUR_PRIVATE_KEY \
    --rpc-url https://rpc.testnet.monad.xyz
```

## 🔍 Monitoring and Logging

### Logging Configuration
```bash
# Set log level
export RUST_LOG=info

# Run with logging
RUST_LOG=info cargo run --bin monad-dex
```

### Health Checks
```bash
# Check if contracts are deployed
cargo run --bin monad-interact info \
    --address CONTRACT_ADDRESS \
    --rpc-url https://rpc.testnet.monad.xyz

# Check order book
cargo run --bin monad-dex get-order-book \
    --address DEX_CONTRACT_ADDRESS \
    --base-token BASE_TOKEN_ADDRESS \
    --quote-token QUOTE_TOKEN_ADDRESS \
    --rpc-url https://rpc.testnet.monad.xyz
```

## 🔒 Security Considerations

### Private Key Management
```bash
# Use environment variables (recommended)
export PRIVATE_KEY=your_private_key

# Or use a secure key file
echo "your_private_key" > .private_key
chmod 600 .private_key
```

### Network Security
```bash
# Configure firewall
sudo ufw allow ssh
sudo ufw allow 22
sudo ufw enable

# Use VPN for additional security
```

## 📊 Performance Optimization

### Build Optimization
```bash
# Release build with optimizations
cargo build --release

# Profile the application
cargo install flamegraph
cargo flamegraph --bin monad-dex
```

### Resource Management
```bash
# Monitor resource usage
htop
iotop
nethogs
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**:
```bash
# Clean and rebuild
cargo clean
cargo build

# Update dependencies
cargo update
```

2. **Network Issues**:
```bash
# Test RPC connection
curl -X POST https://rpc.testnet.monad.xyz \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

3. **Contract Deployment Failures**:
```bash
# Check gas estimation
forge estimate --rpc-url https://rpc.testnet.monad.xyz \
    --private-key YOUR_PRIVATE_KEY \
    contracts/MonadToken.sol:MonadToken

# Increase gas limit if needed
```

### Debug Commands
```bash
# Enable debug logging
RUST_LOG=debug cargo run --bin monad-dex

# Check contract bytecode
forge inspect contracts/MonadToken.sol:MonadToken bytecode

# Verify contract on explorer
forge verify-contract CONTRACT_ADDRESS \
    contracts/MonadToken.sol:MonadToken \
    --chain-id 1337 \
    --etherscan-api-key YOUR_API_KEY
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Deploy multiple instances behind a load balancer
- Use container orchestration (Kubernetes, Docker Swarm)
- Implement database clustering for state management

### Vertical Scaling
- Increase instance resources (CPU, RAM)
- Optimize Rust code for better performance
- Use connection pooling for RPC calls

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy Backend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      
      - name: Build
        run: cargo build --release
      
      - name: Deploy to Production
        run: |
          # Add your deployment commands here
          echo "Deploying to production..."
```

## 📞 Support

For deployment issues:
1. Check the logs: `journalctl -u monad-dex -f`
2. Verify network connectivity
3. Test with smaller transactions first
4. Consult Monad documentation: https://docs.monad.xyz/

---

**Happy deploying! 🚀** 