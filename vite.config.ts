import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// Independent TanStack Start application; no third-party builder runtime.
export default defineConfig({
  plugins: [tsconfigPaths(), tanstackStart(), react(), tailwindcss()],
});
