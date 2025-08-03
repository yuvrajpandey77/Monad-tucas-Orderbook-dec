# 🚀 Monad DEX - Complete Decentralized Exchange

A production-ready decentralized exchange (DEX) built on Monad blockchain with full trading functionality, professional UI, and comprehensive backend tools.

## ✨ Features

### 🎯 Core Trading Features
- **Limit Orders** - Place buy/sell orders with custom prices
- **Market Orders** - Execute trades immediately at current market price
- **Order Book** - Real-time market depth display
- **User Order Management** - View, track, and cancel active orders
- **Token Withdrawal** - Withdraw tokens from DEX to wallet
- **Balance Display** - Real-time DEX and wallet balance tracking

### 🔐 Security & UX
- **Token Approval Flow** - Automatic ERC20 token approvals
- **Wallet Integration** - Seamless MetaMask connection
- **Error Handling** - User-friendly error messages and recovery
- **Loading States** - Professional loading indicators
- **Mobile Responsive** - Works on all devices

### 🛠️ Technical Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Library**: Shadcn UI + Radix UI + Tailwind CSS
- **Smart Contracts**: Solidity (MonadToken + OrderBookDEX)
- **Backend Tools**: Rust CLI for contract interaction
- **Web3**: Ethers.js v6 for blockchain integration

## 🏗️ Architecture

### Smart Contracts
- **MonadToken** (`0x14F49BedD983423198d5402334dbccD9c45AC767`) - ERC20 token
- **OrderBookDEX** (`0x6045fe7667E22CE9ff8106429128DDdC90F6F9Ae`) - Trading engine

### Frontend Components
- **Trading Interface** - Order placement and management
- **Order Book** - Real-time market depth
- **User Orders** - Order tracking and cancellation
- **Withdraw Form** - Token withdrawal functionality
- **Balance Display** - DEX and wallet balances

### Backend Tools
- **Rust CLI** - Contract interaction and management
- **Trading Pair Management** - Add new trading pairs
- **Order Operations** - Place, cancel, view orders
- **Token Management** - Mint, transfer, check balances

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Rust (for backend tools)
- MetaMask wallet
- Monad testnet configured

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yuvrajpandey77/tucas-dex-monad.git
cd tucas-dex-monad
```

2. **Install frontend dependencies**
```bash
cd MainFrontend/frontend
npm install
```

3. **Build Rust tools**
```bash
cargo build --release
```

### Running the Application

1. **Start development server**
```bash
cd MainFrontend/frontend
npm run dev
```

2. **Add trading pair (one-time setup)**
```bash
./add-trading-pair.sh <CONTRACT_OWNER_PRIVATE_KEY>
```

3. **Access the DEX**
- Open browser to `http://localhost:5173`
- Connect MetaMask wallet
- Start trading!

## 📋 Usage Guide

### For Traders
1. **Connect Wallet** - Click "Connect Wallet" button
2. **Select Trading Pair** - Choose from available pairs
3. **Approve Tokens** - Approve tokens for trading (first time only)
4. **Place Orders** - Use limit or market orders
5. **Manage Orders** - View and cancel active orders
6. **Withdraw Tokens** - Withdraw profits from DEX

### For Developers
1. **Contract Interaction** - Use Rust CLI tools
2. **Add Trading Pairs** - Use `add-trading-pair.sh` script
3. **Test Functions** - Use provided test scripts
4. **Deploy Frontend** - Build and deploy to any static hosting

## 🔧 Development

### Project Structure
```
rust-project/
├── contracts/           # Smart contracts (Solidity)
├── src/bin/            # Rust CLI tools
├── MainFrontend/       # React frontend
│   └── frontend/
│       ├── src/
│       │   ├── components/  # React components
│       │   ├── services/    # Web3 services
│       │   ├── pages/       # Application pages
│       │   └── config/      # Contract configuration
│       └── public/          # Static assets
├── scripts/            # Deployment scripts
└── docs/              # Documentation
```

### Key Commands
```bash
# Frontend development
cd MainFrontend/frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run linting

# Rust tools
cargo run --bin monad-dex --help     # DEX operations
cargo run --bin interact --help # Token operations

# Deployment
./add-trading-pair.sh <PRIVATE_KEY>  # Add trading pair
```

## 🌐 Deployment

### Smart Contracts
- **Network**: Monad Testnet
- **RPC URL**: `https://monad-testnet.g.alchemy.com/v2/hl5Gau0XVV37m-RDdhcRzqCh7ISwmOAe`
- **Status**: ✅ Deployed and verified

### Frontend Deployment
```bash
# Build for production
cd MainFrontend/frontend
npm run build

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod
```

## 📊 Contract Addresses

| Contract | Address | Status |
|----------|---------|--------|
| MonadToken | `0x14F49BedD983423198d5402334dbccD9c45AC767` | ✅ Deployed |
| OrderBookDEX | `0x6045fe7667E22CE9ff8106429128DDdC90F6F9Ae` | ✅ Deployed |

## 🧪 Testing

### Contract Testing
```bash
# Test token operations
cargo run --bin interact info --address <TOKEN_ADDRESS>

# Test DEX operations
cargo run --bin monad-dex get-order-book --address <DEX_ADDRESS>
```

### Frontend Testing
```bash
cd MainFrontend/frontend
npm run lint
npm run build
```

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT_CHECKLIST.md)
- [Project Analysis](./COMPREHENSIVE_ANALYSIS.md)
- [Codebase Explanation](./CODEBASE_EXPLANATION.md)
- [Next Steps Guide](./NEXT_STEPS_GUIDE.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎯 Project Status

**Status**: ✅ **PRODUCTION READY**

- ✅ Smart contracts deployed and verified
- ✅ Frontend application complete
- ✅ Backend tools functional
- ✅ All features implemented
- ✅ Ready for deployment

## 🏆 Achievement

This is a **complete, production-ready DEX application** with:
- Full trading functionality (limit/market orders)
- Professional user interface
- Robust backend infrastructure
- Security best practices
- Comprehensive documentation

**Ready for production deployment! 🚀**

---

*Built with ❤️ for the Monad ecosystem*
