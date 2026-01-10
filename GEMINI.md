# GEMINI Context: Orbit POS

## Project Overview
Orbit POS is a cross-platform desktop Point of Sale (POS) application designed for high-performance, offline-first operations. It uses Electron as the shell and React for the user interface, with data persisted locally using Dexie.js (IndexedDB).

### Core Technologies
- **Shell:** ElectronJS (Main and Renderer process architecture)
- **Frontend:** ReactJS (v19), TypeScript, Tailwind CSS
- **Database:** Dexie.js (IndexedDB wrapper)
- **State Management:** Zustand (Cart and Session management)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Build Tool:** Vite

## Building and Running

### Development
To start the development environment with hot-reloading for both React and Electron:
```bash
npm run dev
```
This command concurrently runs Vite for the frontend and compiles/starts Electron.

### Production Build
To build the application for production and package it using electron-builder:
```bash
npm run build
```
Individual build steps:
- Frontend: `npm run build:react`
- Electron: `npm run build:electron`

## Project Structure
- `electron/`: Contains the Electron main process logic and preload scripts.
  - `main.ts`: Entry point for the Electron app.
  - `preload.cts`: Bridge between the main and renderer processes (CommonJS for sandbox compatibility).
- `src/`: Contains the React frontend source code.
  - `db/`: Database schema (Dexie.js) and seeding logic.
  - `store/`: Zustand stores for global state (cart, auth).
  - `pages/`: Application views (POS, Inventory, Customers, Dashboard, History, Login).
  - `components/`: Reusable UI components.
  - `hooks/`: Custom React hooks (e.g., `useBarcodeScanner`).
- `PRD.md`: Detailed Product Requirements Document.
- `tasks.md`: Project development roadmap and completed tasks.

## Technical Details

### Database Schema (Dexie.js)
- `users`: `++id, username, pinCode`
- `categories`: `++id, name`
- `products`: `++id, name, categoryId, barcode`
- `customers`: `++id, name, phone`
- `orders`: `++id, customerId, status, createdAt, userId`

### Barcode Scanning
The POS interface includes a global `keydown` listener that distinguishes between manual keyboard entry and rapid barcode scanner input (keyboard emulator).

### Authentication
A simple PIN-based authentication system identifies users for order tracking. There is currently a single user type with full access.

## Development Conventions
- **ESM:** The project uses ES Modules (`"type": "module"` in `package.json`).
- **TypeScript:** Strict typing is enforced across the codebase.
- **Offline-First:** All critical sales data is stored locally first in IndexedDB.
- **Styling:** Tailwind CSS is used for utility-first styling.
