# 🚀 Monad DEX - Real Trading Platform

A fully functional decentralized exchange (DEX) built on Monad testnet with real trading capabilities.

## ✨ Features

- **Real Trading**: Live order book with buy/sell orders
- **Multiple Token Pairs**: USDC/MONAD, WETH/MONAD, DAI/MONAD, WBTC/MONAD
- **MetaMask Integration**: Secure wallet connection
- **Order Management**: Place, cancel, and track orders
- **Real-time Updates**: Live market data and order book
- **Responsive UI**: Modern, mobile-friendly interface

## 🏗️ Architecture

### Smart Contracts
- **DEX Contract**: `0xa6b0D09e1c6CbBDE669eBBD0854515F002a7732e`
- **Test Tokens**: USDC, WETH, DAI, WBTC deployed on Monad testnet
- **Trading Pairs**: All pairs configured and active

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Ethers.js** for blockchain interaction
- **MetaMask** wallet integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask wallet
- Monad testnet configured in MetaMask

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd rust-project
```

2. **Install dependencies**
```bash
cd MainFrontend/frontend
npm install
```

3. **Start the frontend**
```bash
npm run dev
```

4. **Open your browser**
Navigate to `http://localhost:8080`

### Configure MetaMask

Add Monad Testnet to MetaMask:
- **Network Name**: Monad Testnet
- **Chain ID**: 10143
- **RPC URL**: https://monad-testnet.g.alchemy.com/v2/hl5Gau0XVV37m-RDdhcRzqCh7ISwmOAe
- **Currency Symbol**: MONAD

## 🪙 Test Tokens

Import these test tokens to your wallet:

| Token | Address | Decimals |
|-------|---------|----------|
| USDC | `0x1234567890123456789012345678901234567890` | 6 |
| WETH | `0x2345678901234567890123456789012345678901` | 18 |
| DAI | `0x3456789012345678901234567890123456789012` | 18 |
| WBTC | `0x4567890123456789012345678901234567890123` | 8 |

## 📊 Trading Pairs

| Pair | Base Token | Quote Token | Status |
|------|------------|-------------|--------|
| USDC/MONAD | USDC | MONAD | ✅ Active |
| WETH/MONAD | WETH | MONAD | ✅ Active |
| DAI/MONAD | DAI | MONAD | ✅ Active |
| WBTC/MONAD | WBTC | MONAD | ✅ Active |

## 🔧 Development

### Project Structure
```
rust-project/
├── contracts/           # Smart contracts
├── MainFrontend/       # React frontend
│   └── frontend/
│       ├── src/
│       │   ├── components/  # UI components
│       │   ├── services/    # Blockchain services
│       │   ├── hooks/       # Custom React hooks
│       │   └── store/       # State management
│       └── public/
├── scripts/            # Deployment scripts
└── docs/              # Documentation
```

### Key Scripts

- `deploy-test-tokens.sh` - Deploy test tokens
- `add-real-trading-pairs.sh` - Add trading pairs to DEX
- `update-frontend-real-tokens.sh` - Update frontend config
- `mint-tokens-to-wallet.sh` - Mint tokens to your wallet

### Environment Variables

Create `.env` file:
```env
PRIVATE_KEY=your_private_key_here
RPC_URL=https://monad-testnet.g.alchemy.com/v2/hl5Gau0XVV37m-RDdhcRzqCh7ISwmOAe
CHAIN_ID=10143
```

## 🎯 Usage

1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask
2. **Select Trading Pair**: Choose from available pairs
3. **Place Orders**: Set price and quantity for buy/sell orders
4. **Execute Trades**: Orders are matched automatically
5. **Track Balances**: View your token balances in real-time

## 🔒 Security Features

- **MetaMask-only**: Prioritizes MetaMask over other wallets
- **Input Validation**: All user inputs are validated
- **Error Handling**: Comprehensive error handling and user feedback
- **Network Validation**: Ensures correct network connection

## 🚀 Deployment

### Smart Contracts
```bash
# Deploy DEX contract
forge create contracts/DEX.sol:DEX --rpc-url $RPC_URL --private-key $PRIVATE_KEY

# Deploy test tokens
./deploy-test-tokens.sh

# Add trading pairs
./add-real-trading-pairs.sh
```

### Frontend
```bash
# Build for production
cd MainFrontend/frontend
npm run build

# Deploy to hosting service (Vercel, Netlify, etc.)
```

## 📈 Roadmap

- [ ] Liquidity pools
- [ ] Advanced order types (stop-loss, take-profit)
- [ ] Mobile app
- [ ] Analytics dashboard
- [ ] Cross-chain trading
- [ ] Governance token

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions
- **Documentation**: Check the docs folder

---

**Built with ❤️ for the Monad ecosystem**
