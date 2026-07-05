# PetitionBase 📜

A decentralized petition platform on **Base network**. Anyone can create and sign petitions. The platform owner can moderate petitions that violate the rules.

## Features

- ✅ Anyone can create a petition with a title, description, category, and custom deadline
- ✅ Anyone can sign any open petition (one signature per wallet per petition)
- ✅ Petitions automatically close after their deadline
- ✅ Owner can remove petitions that violate platform rules (with an on-chain reason)
- ✅ Owner can transfer ownership to a new address
- ✅ All data is stored fully on-chain — transparent and permanent

## Project Structure

```
petition-dapp/
├── contracts/
│   └── PetitionPlatform.sol    # Main Solidity contract
├── scripts/
│   └── deploy.js               # Hardhat deploy script
├── test/
│   └── PetitionPlatform.test.js # Full test suite
├── frontend/
│   └── index.html              # Browser dApp (no build step)
├── hardhat.config.js
├── package.json
├── .env.example
└── .gitignore
```

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment
```bash
cp .env.example .env
# Fill in PRIVATE_KEY and BASESCAN_API_KEY
```

### 3. Compile & test
```bash
npx hardhat compile
npx hardhat test
```

### 4. Deploy to Base Sepolia
> Get free testnet ETH: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
```bash
npm run deploy:testnet
```

### 5. Update the frontend
Open `frontend/index.html` and replace:
```js
const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";
```
with your deployed contract address.

### 6. Open the frontend
Open `frontend/index.html` directly in your browser — no server needed.

---

## Smart Contract

**PetitionPlatform.sol** — Core functions:

| Function | Who | Description |
|---|---|---|
| `createPetition(title, desc, category, days)` | Anyone | Create a new petition |
| `signPetition(id)` | Anyone | Sign an open petition |
| `removePetition(id, reason)` | Owner only | Remove a violating petition |
| `transferOwnership(newOwner)` | Owner only | Hand over platform control |
| `getPetition(id)` | Anyone | Get full petition details |
| `getSigners(id)` | Anyone | Get list of all signers |
| `hasWalletSigned(id, wallet)` | Anyone | Check if a wallet signed |
| `isPetitionOpen(id)` | Anyone | Check if petition is still open |

## Tech Stack

| Layer | Tool |
|---|---|
| Smart Contract | Solidity 0.8.20 |
| Development | Hardhat |
| Network | Base (L2 on Ethereum) |
| Frontend | Vanilla HTML/JS + ethers.js v6 |
| Wallet | MetaMask |
