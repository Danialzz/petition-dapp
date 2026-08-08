# PetitionBase 📜

[![Live App](https://img.shields.io/badge/Live%20App-danialzz.github.io-blue)](https://danialzz.github.io/petition-dapp/)
[![Network](https://img.shields.io/badge/Network-Base%20Sepolia-0052FF)](https://sepolia.basescan.org)

**PetitionBase** is a decentralized petition platform built on the **Base network**. Anyone can create a petition, and anyone can sign open petitions — with every signature stored permanently on-chain. No company owns your signature.

🔗 **Live App:** https://danialzz.github.io/petition-dapp/

---

## ✨ Features

- ✅ **Create petitions** — title, description, category, custom deadline (1–365 days), optional signature goal
- ✅ **Sign petitions** — one signature per wallet per petition, while the petition is open
- ✅ **Automatic deadlines** — petitions close on-chain once their deadline passes
- ✅ **Moderation** — the platform owner can remove violating petitions (with an on-chain reason)
- ✅ **Creator control** — creators can remove their own petitions at any time
- ✅ **On-chain profiles** — username + bio identities via a separate `ProfileRegistry`
- ✅ **Live countdowns** — cards and detail views show real-time time remaining
- ✅ **Shareable deep links** — `?petition=ID` opens a petition directly
- ✅ **Read-only browsing** — no wallet needed to explore; only actions (create/sign) require one

## 🧱 Smart Contracts

**PetitionPlatform** — the core petitions platform:
| Function | Who | Description |
|---|---|---|
| `createPetition(title, desc, category, days, goal)` | Anyone | Create a new petition |
| `signPetition(id)` | Anyone | Sign an open petition |
| `removePetition(id, reason)` | Owner or creator | Remove a violating/own petition |
| `transferOwnership(newOwner)` | Owner only | Hand over platform control |
| `getPetition(id)` | Anyone | Get full petition details |
| `getSigners(id)` | Anyone | Get all signer addresses |
| `hasWalletSigned(id, wallet)` | Anyone | Check if a wallet signed |
| `isPetitionOpen(id)` | Anyone | Check if a petition is still open |

**ProfileRegistry** — optional on-chain identity layer:
| Function | Who | Description |
|---|---|---|
| `setProfile(username, bio)` | Anyone | Create or update your profile |
| `clearProfile()` | Anyone | Remove your profile |
| `getProfile(wallet)` | Anyone | Get username, bio, updatedAt, exists |
| `isUsernameAvailable(username)` | Anyone | Check username availability |

### Deployed on Base Sepolia

| Contract | Address |
|---|---|
| PetitionPlatform | [0x7F7AE9E9104679d41AA66C17a7a15bECAC5AE44B](https://sepolia.basescan.org/address/0x7F7AE9E9104679d41AA66C17a7a15bECAC5AE44B) |
| ProfileRegistry | [0xc88181798d0F235Ba3AfD85007Fb2B05075842d4](https://sepolia.basescan.org/address/0xc88181798d0F235Ba3AfD85007Fb2B05075842d4) |

> Contract addresses are baked into `docs/index.html` (`CONTRACT_ADDRESS` / `PROFILE_CONTRACT_ADDRESS`).

## 📁 Project Structure

```
petition-dapp/
├── contracts/
│   ├── PetitionPlatform.sol    # Core petition platform
│   └── ProfileRegistry.sol     # Username/bio identity layer
├── scripts/
│   └── deploy.js               # Hardhat deploy script (local/testnet/mainnet)
├── test/
│   ├── PetitionPlatform.test.js
│   └── ProfileRegistry.test.js
├── docs/
│   └── index.html              # The dApp (served on GitHub Pages via /docs)
├── index.html                  # Root redirect → docs/index.html
├── hardhat.config.js
├── package.json
├── .env.example
└── .gitignore
```

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment
```bash
cp .env.example .env
```
Fill in your `PRIVATE_KEY` and, optionally, `BASESCAN_API_KEY` (for contract verification). **Never commit your real `.env`.**

### 3. Compile & test
```bash
npx hardhat compile
npx hardhat test
```

### 4. Run a local node & deploy
```bash
npm run node          # start a local Hardhat network
npm run deploy:local  # deploy to the local network
```

### 5. Deploy to Base Sepolia
> Get free testnet ETH: https://faucets.chain.link/ or the [Coinbase faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)

```bash
npm run deploy:testnet
```

### 6. Point the frontend at your deployment
Open `docs/index.html` and update the two address constants:
```js
const CONTRACT_ADDRESS = "YOUR_PLATFORM_ADDRESS";
const PROFILE_CONTRACT_ADDRESS = "YOUR_PROFILE_REGISTRY_ADDRESS";
```

Open `docs/index.html` directly in your browser — no build step, no server needed.

## 🕹️ How To Use

### Create a petition
1. Open the app and connect your wallet (MetaMask, Coinbase Wallet, etc.)
2. Go to **Create** and set a title, description, category, deadline (days), and an optional signature goal
3. Confirm the transaction on Base — your petition goes on-chain immediately

### Sign a petition
1. Browse any open petition and click **Sign** (or open the detail modal)
2. Confirm — your signature is recorded permanently, one per wallet

## 🙏 Tech Stack

| Layer | Tool |
|---|---|
| Smart Contracts | Solidity 0.8.20 |
| Dev Framework | Hardhat |
| Network | Base (L2 on Ethereum) / Base Sepolia testnet |
| Frontend | Vanilla HTML/CSS/JS + ethers.js v6 |
| Wallets | MetaMask, Coinbase Wallet, Rabby & more (EIP-6963) |
| Hosting | GitHub Pages (`/docs` folder) |

## 📄 License

MIT