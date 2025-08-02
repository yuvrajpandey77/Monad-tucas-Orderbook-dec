# Monad Token Application

A complete Monad-based ERC-20 token application with deployment and interaction scripts for Monad testnet.

## 🚀 Features

- **ERC-20 Token Contract**: Full-featured token with mint, burn, and transfer capabilities
- **Monad Testnet Deployment**: Ready-to-deploy scripts for Monad testnet
- **Rust Integration**: Type-safe contract interactions using Rust and ethers-rs
- **CLI Tools**: Command-line tools for deployment and contract interaction
- **Foundry Integration**: Full Foundry support for compilation and deployment

## 📋 Prerequisites

### Required Software
- [Rust](https://rustup.rs/) (latest stable)
- [Foundry](https://getfoundry.sh/) (for smart contract compilation)
- [Git](https://git-scm.com/)

### Monad Testnet Setup
1. Get testnet tokens from [Monad Faucet](https://faucet.monad.xyz)
2. Set up your wallet (MetaMask recommended)
3. Add Monad testnet to your wallet:
   - **Network Name**: Monad Testnet
   - **RPC URL**: `https://rpc.testnet.monad.xyz`
   - **Chain ID**: `1337`
   - **Currency Symbol**: `MONAD`

## 🛠️ Installation

1. **Clone and setup the project**:
```bash
git clone <your-repo-url>
cd rust-project
```

2. **Install Foundry** (if not already installed):
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

3. **Install Rust dependencies**:
```bash
cargo build
```

4. **Install Foundry dependencies**:
```bash
forge install OpenZeppelin/openzeppelin-contracts --no-commit
```

## ⚙️ Configuration

1. **Create environment file**:
```bash
cp .env.example .env
```

2. **Update `.env` with your settings**:
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

⚠️ **Security Note**: Never commit your private key to version control!

## 🚀 Deployment

### Option 1: Using Foundry (Recommended)

```bash
# Compile contracts
forge build

# Deploy to testnet
forge create \
    --rpc-url https://rpc.testnet.monad.xyz \
    --private-key YOUR_PRIVATE_KEY \
    --gas-price 20000000000 \
    contracts/MonadToken.sol:MonadToken
```

### Option 2: Using the deployment script

```bash
# Make script executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh
```

### Option 3: Using Rust deployment tool

```bash
# Build the deployment tool
cargo build --bin monad-deploy

# Deploy using Rust tool
cargo run --bin monad-deploy deploy \
    --private-key YOUR_PRIVATE_KEY \
    --rpc-url https://rpc.testnet.monad.xyz \
    --gas-price 20000000000
```

## 🔧 Contract Interaction

### Using Rust CLI Tool

```bash
# Get token information
cargo run --bin monad-interact info \
    --address CONTRACT_ADDRESS \
    --rpc-url https://rpc.testnet.monad.xyz

# Get account balance
cargo run --bin monad-interact balance \
    --address CONTRACT_ADDRESS \
    --account ACCOUNT_ADDRESS \
    --rpc-url https://rpc.testnet.monad.xyz

# Mint tokens (owner only)
cargo run --bin monad-interact mint \
    --address CONTRACT_ADDRESS \
    --to RECIPIENT_ADDRESS \
    --amount 1000 \
    --private-key YOUR_PRIVATE_KEY \
    --rpc-url https://rpc.testnet.monad.xyz

# Public mint
cargo run --bin monad-interact public-mint \
    --address CONTRACT_ADDRESS \
    --private-key YOUR_PRIVATE_KEY \
    --rpc-url https://rpc.testnet.monad.xyz

# Burn tokens
cargo run --bin monad-interact burn \
    --address CONTRACT_ADDRESS \
    --amount 100 \
    --private-key YOUR_PRIVATE_KEY \
    --rpc-url https://rpc.testnet.monad.xyz

# Transfer tokens
cargo run --bin monad-interact transfer \
    --address CONTRACT_ADDRESS \
    --to RECIPIENT_ADDRESS \
    --amount 500 \
    --private-key YOUR_PRIVATE_KEY \
    --rpc-url https://rpc.testnet.monad.xyz
```

### Using Foundry

```bash
# Cast commands for contract interaction
cast call CONTRACT_ADDRESS "getTokenInfo()" --rpc-url https://rpc.testnet.monad.xyz
cast call CONTRACT_ADDRESS "getBalance(address)" ACCOUNT_ADDRESS --rpc-url https://rpc.testnet.monad.xyz
cast send CONTRACT_ADDRESS "mint(address,uint256)" RECIPIENT_ADDRESS AMOUNT --private-key YOUR_PRIVATE_KEY --rpc-url https://rpc.testnet.monad.xyz
```

## 📁 Project Structure

```
rust-project/
├── contracts/
│   └── MonadToken.sol          # Main ERC-20 token contract
├── src/
│   ├── bin/
│   │   ├── deploy.rs           # Rust deployment tool
│   │   └── interact.rs         # Rust contract interaction tool
│   └── main.rs                 # Original Rust learning code
├── scripts/
│   └── deploy.sh               # Bash deployment script
├── config/                     # Configuration files
├── foundry.toml               # Foundry configuration
├── remappings.txt             # Contract import mappings
├── Cargo.toml                 # Rust dependencies
└── README.md                  # This file
```

## 🔍 Contract Features

### MonadToken Contract
- **ERC-20 Standard**: Full ERC-20 compliance
- **Minting**: Owner can mint tokens to any address
- **Public Minting**: Anyone can mint a limited amount
- **Burning**: Users can burn their own tokens
- **Transfer**: Standard ERC-20 transfer functionality
- **View Functions**: Get token info and account balances

### Key Functions
- `mint(address to, uint256 amount)` - Owner minting
- `publicMint()` - Public minting (1000 tokens per call)
- `burn(uint256 amount)` - Burn tokens
- `transfer(address to, uint256 amount)` - Transfer tokens
- `getTokenInfo()` - Get token metadata
- `getBalance(address account)` - Get account balance

## 🧪 Testing

### Local Testing
```bash
# Run Foundry tests
forge test

# Run Rust tests
cargo test
```

### Testnet Testing
1. Deploy to testnet
2. Use the interaction tools to test all functions
3. Verify on Monad block explorer

## 🔗 Useful Links

- [Monad Documentation](https://docs.monad.xyz/)
- [Monad Testnet Faucet](https://faucet.monad.xyz)
- [Monad Block Explorer](https://explorer.monad.xyz)
- [Foundry Documentation](https://book.getfoundry.sh/)
- [Ethers-rs Documentation](https://docs.rs/ethers/)

## 🚨 Important Notes

1. **Testnet Only**: This is configured for Monad testnet only
2. **Private Keys**: Never share or commit private keys
3. **Gas Fees**: Ensure you have sufficient testnet tokens for gas
4. **Contract Verification**: Verify your contract on the block explorer after deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Happy building on Monad! 🚀** 