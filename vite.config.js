import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwind()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'three-core', test: /three[\\/]build[\\/]three\.core\.js$/ },
            { name: 'three-renderer', test: /three[\\/]build[\\/]three\.module\.js$/ },
          ],
        },
      },
    },
  },
})
