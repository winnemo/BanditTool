import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  // @ts-expect-error – Plugin type mismatch zwischen vitest/vite
  plugins: [react()],
  base: '/BanditTool/',
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
