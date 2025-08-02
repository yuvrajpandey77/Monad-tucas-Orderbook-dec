# Quick Backend Deployment Guide

This is a quick guide to deploy the Monad DEX backend.

## 🚀 Quick Start

### Prerequisites
- Rust and Foundry installed
- Monad testnet tokens
- Private key for deployment

### Option 1: Local Deployment (Recommended for Development)

1. **Setup Environment**:
```bash
cd rust-project
cp .env.example .env
# Edit .env with your private key and settings
```

2. **Run Deployment Script**:
```bash
chmod +x scripts/deploy-backend.sh
./scripts/deploy-backend.sh
```

### Option 2: Docker Deployment

1. **Build and Run with Docker**:
```bash
# Set your private key
export PRIVATE_KEY=your_private_key_here

# Build and run
docker-compose up --build
```

2. **Or build manually**:
```bash
docker build -t monad-dex-backend .
docker run -e PRIVATE_KEY=$PRIVATE_KEY monad-dex-backend
```

### Option 3: Cloud Deployment

#### AWS EC2 (Quick Setup)
```bash
# Launch Ubuntu 22.04 instance
# SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Install dependencies
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
foundryup

# Clone and deploy
git clone https://github.com/yuvrajpandey77/Monad-tucas-Orderbook-dec.git
cd Monad-tucas-Orderbook-dec
./scripts/deploy-backend.sh --service
```

## 🔧 Configuration

### Environment Variables
```bash
# Required
PRIVATE_KEY=your_private_key_here
RPC_URL=https://rpc.testnet.monad.xyz

# Optional
CHAIN_ID=1337
GAS_PRICE=20000000000
RUST_LOG=info
```

### Contract Addresses
After deployment, update your frontend with:
- `TOKEN_CONTRACT_ADDRESS`: Deployed token contract
- `DEX_CONTRACT_ADDRESS`: Deployed DEX contract

## 🧪 Testing

### Test Contract Deployment
```bash
cargo run --bin monad-interact info \
    --address CONTRACT_ADDRESS \
    --rpc-url https://rpc.testnet.monad.xyz
```

### Test DEX Functions
```bash
# Add trading pair
cargo run --bin monad-dex add-trading-pair \
    --address DEX_ADDRESS \
    --base-token TOKEN_ADDRESS \
    --quote-token USDC_ADDRESS \
    --private-key YOUR_PRIVATE_KEY

# Place order
cargo run --bin monad-dex place-limit-order \
    --address DEX_ADDRESS \
    --base-token TOKEN_ADDRESS \
    --quote-token USDC_ADDRESS \
    --amount 1000000000000000000 \
    --price 1000000000000000000 \
    --is-buy true \
    --private-key YOUR_PRIVATE_KEY
```

## 📊 Monitoring

### Check Service Status
```bash
# If using systemd service
sudo systemctl status monad-dex

# Check logs
journalctl -u monad-dex -f
```

### Health Check
```bash
# Test RPC connection
curl -X POST https://rpc.testnet.monad.xyz \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**:
```bash
cargo clean && cargo build
```

2. **Network Issues**:
```bash
# Test RPC connection
curl https://rpc.testnet.monad.xyz
```

3. **Gas Issues**:
```bash
# Increase gas limit
forge create --gas-limit 5000000 ...
```

## 📞 Support

- Check logs: `journalctl -u monad-dex -f`
- Test network: `curl https://rpc.testnet.monad.xyz`
- Verify contracts on explorer: https://explorer.monad.xyz

---

**Deployment completed! 🚀** 