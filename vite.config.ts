import { defineConfig } from 'vite'

// Dynamic import of ESM-only plugin to avoid `require` loading ESM in some environments
export default async () => {
  const reactPlugin = (await import('@vitejs/plugin-react')).default
  return defineConfig({
    plugins: [reactPlugin()],
  })
}
