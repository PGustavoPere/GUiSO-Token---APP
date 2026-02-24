# Technical Architecture: GUISO Token App

## 🏗️ High-Level Overview
The GUISO platform is built as a **Single Page Application (SPA)** with a **Mock Backend** layer, designed to be easily swapped for a real Web3/API infrastructure.

## 🎨 Frontend Structure
We use a **Feature-Based Architecture** to ensure that as the app grows, modules remain decoupled.

```text
src/
├── components/     # Shared UI (Layout, Buttons, Modals)
├── context/        # Global State (GuisoContext)
├── features/       # Business Logic Modules
│   ├── dashboard/  # Analytics & Stats
│   ├── impact/     # Social Projects & Support Logic
│   └── profile/    # User Data & History
├── services/       # API & Blockchain Communication
└── types/          # TypeScript Definitions
```

## 🧠 State Management (SocialFi Engine)
The core of the "SocialFi" experience is managed via the `GuisoProvider` (React Context).

### State Variables:
- `balance`: Current GSO tokens available for the user.
- `impactScore`: Accumulated points from social actions.
- `history`: Array of all previous social interactions.

### Logic Flow:
1. User triggers `supportProject(amount)`.
2. Context validates `amount <= balance`.
3. Context updates `balance` and calculates `impactScore` (10% of amount).
4. Action is added to `history` and persisted to `localStorage`.

## 📡 Backend & Scalability
Currently, the app uses an **Express.js** server to serve the frontend and provide mock JSON data via `/api` routes.

### Scaling Strategy:
1. **Database:** Replace mock arrays with **PostgreSQL** for persistent user data.
2. **Web3 Indexer:** Implement a service (like Subgraph or a custom Node.js listener) to track on-chain GSO transactions.
3. **Authentication:** Transition from simulated connection to **SIWE (Sign-In with Ethereum)**.

## 💅 Styling & UI
- **Tailwind CSS 4:** Used for utility-first styling with a custom theme defined in `index.css`.
- **Motion:** Handles all transitions and modal animations to provide a premium "App-like" feel.
- **Glassmorphism:** A consistent design language using `backdrop-blur` and semi-transparent backgrounds to evoke a modern Web3 aesthetic.
