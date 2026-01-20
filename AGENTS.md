# AGENTS.md - Coding Guidelines for Orbit POS

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

## Build/Lint/Test Commands

### Development
- `pnpm run dev` - Start development server with Electron app
- `pnpm run dev:react` - Start Vite React development server only
- `pnpm run dev:electron` - Start Electron development server only
- `pnpm run dev:start` - Start Electron app connected to Vite dev server

### Building
- `pnpm run build` - Build for current platform (Mac/Linux/Windows)
- `pnpm run build:mac` - Build for macOS only
- `pnpm run build:win` - Build for Windows only
- `pnpm run build:react` - Build React frontend only
- `pnpm run build:electron` - Build Electron backend only
- `pnpm run clean` - Clean build directories

### Code Quality
- `pnpm run typecheck` - Check TypeScript types (inferred from build process)
- Code linting is handled by TypeScript compiler with strict settings

## Project Structure
```
electron/         # Electron main process logic and preload scripts
  main.ts         # Entry point for the Electron app
  preload.cts     # Bridge between main and renderer processes
src/              # React frontend source code
  components/     # Reusable UI components
  pages/          # Route-level components (POS, Inventory, etc.)
  store/          # Zustand stores (cart, auth, settings, UI)
  db/             # Database schema (Dexie.js) and seed data
  lib/            # Utility functions
  hooks/          # Custom React hooks (e.g., useBarcodeScanner)
  assets/         # Static assets
docs/       # Product Documentations
```

## Code Style Guidelines

### General Formatting
1. Use 2-space indentation (no tabs)
2. No semicolons
3. Trailing commas in multi-line objects/arrays
4. Line width: 100 characters
5. Use single quotes for strings
6. No trailing whitespace

### Imports
1. Use absolute imports with `@/` alias for src directory
2. Group imports in order: external libraries, internal modules, relative imports
3. Use destructuring for named exports
4. Place import statements at the top of the file

### Types
1. Use TypeScript interfaces for object shapes
2. Define component props interfaces above component
3. Use `type` for union/intersection types
4. Avoid `any` - use `unknown` with type guards instead
5. Use explicit return types for functions
6. Use strict TypeScript settings from tsconfig.json

### Naming Conventions
1. Components: PascalCase (`ProductList`)
2. Functions/Variables: camelCase (`fetchProducts`)
3. Interfaces: Prefix with `I` (`IProduct`)
4. Constants: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`)
5. Files: PascalCase for components, camelCase for utilities
6. CSS classes: Use Tailwind utility classes with dark mode variants

### Error Handling
1. Always handle async/await with try/catch
2. Log errors with appropriate context
3. Show user-friendly error messages in UI
4. Use specific error types when possible

### Component Structure
1. Define props interface above component
2. Use React.FC<Props> type annotation
3. Destructure props in function parameters
4. Use useEffect for side effects
5. Use custom hooks for reusable logic
6. Keep components focused on single responsibility

### Database Usage
1. Use Dexie.js for IndexedDB operations
2. Define interfaces for all database entities
3. Use async/await for database operations
4. Handle database errors gracefully
5. Use transactions for related operations

### Database Schema (Dexie.js)
- `users`: `++id, username, pinCode`
- `categories`: `++id, name`
- `products`: `++id, name, categoryId, barcode`
- `customers`: `++id, name, phone`
- `orders`: `++id, customerId, status, createdAt, userId`
- `settings`: `++id, &key`

### UI/UX Guidelines
1. Use provided UI components (Button, Input, etc.)
2. Implement dark mode with `dark:` variants
3. Use framer-motion for animations
4. Follow existing design patterns
5. Ensure responsive design
6. Use appropriate loading states

### Dark Mode Implementation
1. Use `dark:` prefix for dark mode variants
2. Configure Tailwind with `@variant dark (&:where(.dark, .dark *))`
3. ThemeProvider manages `dark` class on document element
4. Settings store persists theme preference
5. Use `dark:bg-slate-800/60` for modal backdrops

### State Management
1. Use Zustand for global state
2. Define store interfaces clearly
3. Use immer-style updates for nested state
4. Separate concerns into different stores

### Barcode Scanning
The POS interface includes a global `keydown` listener that distinguishes between manual keyboard entry and rapid barcode scanner input (keyboard emulator).

### Authentication
A simple PIN-based authentication system identifies users for order tracking. There is currently a single user type with full access.

## Development Conventions
- **ESM:** The project uses ES Modules (`"type": "module"` in `package.json`)
- **TypeScript:** Strict typing is enforced across the codebase
- **Offline-First:** All critical sales data is stored locally first in IndexedDB
- **Styling:** Tailwind CSS is used for utility-first styling

## Testing
1. No specific test framework configured
2. Manual testing through development server
3. Type checking via TypeScript compiler
4. Build process validates code correctness