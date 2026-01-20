# Dark Mode Implementation Design

## Architecture

The dark mode will be implemented using Tailwind CSS's built-in dark mode feature with class-based toggling. We'll extend the existing Zustand `useSettings` store to include a `theme` property ('light' | 'dark'), stored in the IndexedDB database via Dexie. A theme context will manage the application of the `dark` class to the document root, ensuring all Tailwind `dark:` variants are activated.

The implementation will be centralized around the `useSettings` store, which already handles persistence for system settings like currency. This approach maintains consistency with the app's current state management pattern and ensures the theme choice survives app restarts.

## Components

**ThemeProvider**: A new context provider that wraps the app, subscribing to `useSettings` for theme changes and applying the `dark` class to `document.documentElement`. Placed at the app root in `main.tsx` or `App.tsx`.

**Settings Toggle**: A new toggle switch component added to the System Settings tab in `src/pages/Settings.tsx`. The component will display "Light Mode" / "Dark Mode" labels and bind to the `useSettings` theme state.

**Updated UI Components**: All existing components will need `dark:` variants added to their Tailwind classes. For example:
- Backgrounds: `bg-white dark:bg-slate-900`
- Text: `text-slate-900 dark:text-slate-100`
- Borders: `border-slate-200 dark:border-slate-700`

## Data Flow

1. User clicks toggle in Settings → calls `useSettings.setTheme('dark')`
2. Zustand store updates state and persists to DB
3. ThemeProvider detects change via store subscription
4. `document.documentElement.classList.add('dark')` applied
5. Tailwind CSS automatically applies dark variants throughout the app

## Error Handling

- DB write failures: Gracefully fall back to light mode, log error
- Invalid theme value from DB: Default to 'light' on load
- Missing DOM element: Check for `document.documentElement` existence before class manipulation

## Testing

- Unit tests for `useSettings` theme persistence
- Integration tests for ThemeProvider class application
- Visual regression tests for dark mode styling (if using tools like Chromatic)
- Manual testing across different Electron window states

---

*Design validated on 2026-01-20. Ready to proceed with implementation if this looks correct.*