# Orbit POS

Orbit POS is a modern, cross-platform desktop Point of Sale (POS) application designed for high-performance, offline-first operations. Built with Electron and React, it provides a seamless and responsive experience for retail environments, ensuring business continuity even without an internet connection.

## 🚀 Features

- **Offline-First Architecture:** Local data persistence using IndexedDB (via Dexie.js).
- **High Performance:** Built with React 19 and Vite for a snappy user interface.
- **Cross-Platform:** Desktop application powered by Electron.
- **Barcode Scanning:** Integrated global listener for rapid barcode scanner input.
- **Inventory Management:** Category and product organization.
- **Real-time Cart:** Managed with Zustand for smooth state transitions.
- **PIN-based Authentication:** Secure access for staff and administrators.
- **Beautiful UI:** Styled with Tailwind CSS and animated with Framer Motion.

## 🛠️ Tech Stack

- **Shell:** [Electron](https://www.electronjs.org/)
- **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database:** [Dexie.js](https://dexie.org/) (IndexedDB)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)

## 📂 Project Structure

```text
├── electron/          # Electron main process and preload scripts
├── src/               # React frontend source code
│   ├── components/    # Reusable UI components
│   ├── db/            # Database schema and seeding logic
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Application views (POS, Inventory, etc.)
│   ├── store/         # Zustand global state stores
│   └── lib/           # Utility functions
├── docs/              # Documentation (PRD, roadmap)
└── public/            # Static assets
```

## 🏁 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://gitlab.com/ikhanraheel/orbit-pos.git
   cd orbit-pos
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development environment with hot-reloading for both React and Electron:
```bash
npm run dev
```

### Production Build

To build and package the application for your current platform:
```bash
npm run build
```

Individual build steps:
- **Frontend:** `npm run build:react`
- **Electron:** `npm run build:electron`

## 📊 Database Schema

The application uses IndexedDB for local storage with the following primary tables:
- `users`: Staff credentials and PINs.
- `products`: Inventory items with barcode support.
- `categories`: Product groupings.
- `customers`: Customer profiles and contact info.
- `orders`: Transaction history and status.
