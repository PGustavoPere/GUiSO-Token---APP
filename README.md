# GUISO Token - Social Impact Web3 Platform

![GUISO Banner](https://picsum.photos/seed/guiso-banner/1200/400)

## 🌎 Overview
**GUISO Token (GSO)** is a SocialFi project designed to bridge the gap between decentralized finance and real-world social impact. Our platform allows community members to participate in funding and governing social initiatives with total transparency.

### The Problem
Traditional social aid often suffers from a lack of transparency, high administrative overhead, and zero community involvement in decision-making.

### Our Solution
A Web3-native platform where:
- **Transparency is Default:** Every action is recorded (simulated in MVP, on-chain in V1).
- **Community-Driven:** Token holders decide which projects receive funding.
- **Direct Impact:** Minimal intermediaries between the donor and the cause.

---

## 🚀 Tech Stack
- **Frontend:** React 19, Tailwind CSS 4
- **State Management:** React Context API (GuisoProvider)
- **Animations:** Motion (formerly Framer Motion)
- **Charts:** Recharts
- **Backend:** Node.js + Express (Mock API Layer)
- **Icons:** Lucide React

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗺️ Vision & Roadmap
Our vision is to create a global "Impact Ledger" where social good is a verifiable asset.

**Current Status:** `MVP SocialFi` (Simulated Economy)
**Next Milestone:** `Wallet Integration & On-chain Verification`

See [ROADMAP.md](./ROADMAP.md) for details.

---

## 🏗️ Architecture & Core Systems
The project follows a modular, domain-driven architecture:
- **GuisoCoreStore:** Centralized state management for user profile, token economy, and global impact metrics.
- **WalletProvider:** Simulation layer for Web3 wallet connectivity.
- **ImpactEngine:** Logic layer that converts financial actions into humanitarian metrics (Impact Points).
- **Proof of Impact (PoI):** Conceptual framework for social validation (see [PROOF-OF-IMPACT.md](./docs/PROOF-OF-IMPACT.md)).

## 🎯 MVP Features
- **Wallet Simulation:** Connect/Disconnect mock wallets with persistent addresses.
- **Impact Transaction Panel:** Direct support for community kitchens, homeless support, and food programs.
- **Real-time Impact Dashboard:** Visualize personal and collective impact metrics (Meals generated, Impact Score).
- **Impact History:** Transparent log of all social actions with unique transaction IDs.
- **Emotional Feedback:** Instant humanitarian feedback after every contribution.

## 🚀 Investor Demo Mode
The application includes a specialized **Investor Demo Mode** designed for partners and stakeholders:
- **Guided Experience:** A step-by-step walkthrough of the GUISO ecosystem.
- **Investor Metrics Panel:** Simulated growth and scalability metrics (Retention, Volume, Reach).
- **Impact Story Mode:** Narrative cards that explain the real-world connection of digital transactions.
- **Vision Section:** Deep dive into the philosophy, neutrality, and long-term roadmap.
- **Demo Reset:** Instantly reset the experience to showcase the first-time user journey.

## 🌉 Web3 Bridge Architecture
GUISO uses a specialized bridge layer to separate humanitarian logic from blockchain complexity:
- **Abstraction Layer:** All UI components interact with a `web3Bridge` rather than direct blockchain libraries.
- **Adapters:** Modular `WalletAdapter` and `TransactionAdapter` allow switching between simulation and real networks.
- **Simulation Mode:** Default state for development and demos, using mock transactions and local state.
- **Web3 Mode:** Future state where adapters will connect to EVM-compatible providers (MetaMask, WalletConnect) and interact with GSO Smart Contracts.
- **Impact Sync:** Transactions generate `txHash` placeholders that map directly to the humanitarian impact ledger.

## 🔗 Testnet Integration
The application is now connected to the **BNB Smart Chain (BSC) Testnet** for a safe development setup.
- **Real Transactions:** When in Web3 mode, the app generates real transaction hashes on the BSC Testnet.
- **Safety:** We only use testnets (never mainnet) to ensure a risk-free environment.
- **Fallback:** If MetaMask is not installed or the user rejects the connection, the app gracefully falls back to Simulation Mode.
- **Configuration:** Network settings are managed in `/src/web3/networkConfig.ts`.

## 🔮 Future Blockchain Integration
- **Smart Contracts:** Transition from mock state to EVM-compatible smart contracts for GSO tokens.
- **On-chain Proof of Impact:** Minting soulbound tokens (SBTs) or NFTs as verifiable credentials of social contribution.
- **DAO Governance:** Impact-weighted voting power for community decisions.
- **Oracle Integration:** Connecting off-chain social data (e.g., from NGOs) to on-chain impact verification.

---

## 🤝 Contributing
We welcome contributors! Whether you are a blockchain dev, a designer, or a social activist.
1. Fork the repo.
2. Create your feature branch.
3. Commit your changes.
4. Push to the branch.
5. Open a Pull Request.

---

## 📄 License
This project is licensed under the Apache-2.0 License.
