# XRP Film Funding Platform

A decentralized film funding platform built on XRPL and Flare that enables investors to fund film projects with XRP and earn rewards through a unique "share your reward" mechanism.

## 🎬 Features

### Core Functionality
- **Project Creation**: Filmmakers can create projects with funding goals and milestones
- **XRP Investment**: Investors fund projects using XRP on the XRPL network
- **Claim Tokens**: Non-transferable SBTs (Soul Bound Tokens) represent investor shares
- **Milestone Management**: Projects unlock funding based on milestone completion
- **Revenue Distribution**: Automatic pro-rata distribution to active claim holders

### Unique "Share Your Reward" Mechanism
- **Stake Claims**: Investors can stake their claims to mint shareable reward NFTs
- **Share Success**: Transfer reward NFTs to others to share your success
- **Pause Revenue**: While staked, claims don't receive revenue distributions
- **Reclaim**: Burn reward NFTs to unlock claims and resume earning

## 🏗️ Architecture

### XRPL Layer
- **Payments**: Accept XRP contributions to project addresses
- **Event Monitoring**: Real-time payment detection and processing
- **Transaction Verification**: Secure payment validation

### Flare Layer
- **Smart Contracts**: Business logic and data management
- **Claim SBTs**: Non-transferable tokens representing investor shares
- **Reward NFTs**: Transferable tokens for sharing rewards
- **Revenue Distribution**: Automated pro-rata payouts

### Bridge/Relayer
- **Payment Processing**: Monitors XRPL and submits attestations to Flare
- **State Connector**: Verifies XRPL transactions on Flare
- **Automated Minting**: Creates claim tokens after payment verification

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask or compatible wallet
- XRP testnet tokens
- Flare testnet tokens

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd xrp-film-funding
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Deploy smart contracts**
   ```bash
   npm run compile
   npm run deploy
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📱 Usage

### For Investors
1. **Connect Wallet**: Connect your Flare-compatible wallet
2. **Browse Projects**: View available film projects
3. **Invest**: Send XRP to project addresses
4. **Receive Claims**: Get claim tokens representing your share
5. **Stake & Share**: Stake claims to mint shareable reward NFTs
6. **Earn Revenue**: Receive proportional revenue from successful projects

### For Filmmakers
1. **Create Project**: Set funding goals and milestones
2. **Share Address**: Provide XRPL address for investments
3. **Track Progress**: Monitor funding and milestone completion
4. **Unlock Milestones**: Use attestations to release funds
5. **Distribute Revenue**: Share profits with investors

## 🔧 Smart Contracts

### Core Contracts
- **ProjectFactory**: Deploys new project vaults
- **ProjectVault**: Manages individual project funding and milestones
- **ClaimSBT**: Non-transferable tokens for investor claims
- **RewardNFT**: Transferable tokens for sharing rewards
- **StakeManager**: Handles staking/unstaking of claims

### Key Features
- **ERC-5192 Compliance**: Claim tokens are non-transferable SBTs
- **ERC-721 NFTs**: Reward tokens are standard transferable NFTs
- **Reentrancy Protection**: Secure against reentrancy attacks
- **Access Control**: Proper ownership and permission management

## 🌐 Network Configuration

### XRPL Testnet
- **URL**: `wss://s.altnet.rippletest.net:51233`
- **Faucet**: https://xrpl.org/xrp-testnet-faucet.html

### Flare Coston2 Testnet
- **RPC**: `https://coston2-api.flare.network/ext/bc/C/rpc`
- **Chain ID**: `114`
- **Explorer**: https://coston2-explorer.flare.network/
- **Faucet**: https://faucet.towolabs.com/

## 🔐 Security Considerations

### Smart Contract Security
- **Audited Libraries**: Uses OpenZeppelin contracts
- **Reentrancy Guards**: Protection against reentrancy attacks
- **Access Controls**: Proper permission management
- **Input Validation**: Comprehensive parameter validation

### Operational Security
- **Private Key Management**: Use hardware wallets for production
- **Environment Variables**: Never commit private keys
- **Network Validation**: Verify network connections
- **Transaction Monitoring**: Monitor for suspicious activity

## 🧪 Testing

### Run Tests
```bash
npm run test
```

### Test Coverage
- Smart contract functionality
- XRPL integration
- Frontend components
- End-to-end workflows

## 📊 Monitoring & Analytics

### Key Metrics
- Total projects created
- Total funding raised
- Active investors
- Revenue distributed
- Reward NFTs minted

### Monitoring Tools
- Flare Explorer integration
- XRPL transaction tracking
- Smart contract event monitoring
- User analytics

## 🚀 Deployment

### Production Deployment
1. **Deploy Contracts**: Deploy to Flare mainnet
2. **Configure RPC**: Update to mainnet endpoints
3. **Set Environment**: Configure production variables
4. **Deploy Frontend**: Deploy to hosting platform
5. **Monitor**: Set up monitoring and alerts

### Environment Setup
- Configure mainnet RPC URLs
- Set production contract addresses
- Enable security features
- Set up monitoring

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Standards
- Follow Solidity best practices
- Use TypeScript for frontend
- Write comprehensive tests
- Document your code

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- [Flare Network Docs](https://docs.flare.network/)
- [XRPL Documentation](https://xrpl.org/docs.html)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

### Community
- [Discord](https://discord.gg/flare)
- [Telegram](https://t.me/flarenetwork)
- [Twitter](https://twitter.com/FlareNetworks)

## 🔮 Future Enhancements

### Planned Features
- **FAssets Integration**: Native XRP representation on Flare
- **Advanced Analytics**: Detailed project and investor analytics
- **Mobile App**: Native mobile application
- **Multi-token Support**: Support for additional cryptocurrencies
- **Governance**: DAO-based project governance
- **Insurance**: Project failure insurance mechanisms

### Technical Improvements
- **Layer 2 Scaling**: Optimize for higher transaction volumes
- **Cross-chain**: Support for additional blockchain networks
- **AI Integration**: Smart project recommendation system
- **Advanced Oracles**: More sophisticated attestation mechanisms

---

Built with ❤️ for the decentralized future of film funding.
