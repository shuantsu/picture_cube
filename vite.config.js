import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  base: './',
  root: 'dist',
  build: {
    outDir: '../build',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'backgrounds', dest: '.' },
        { src: 'examples', dest: '.' },
        { src: 'editor', dest: '.' },
        { src: 'texture.png', dest: '.' },
        { src: 'texture-instructions.md', dest: '.' },
      ]
    })
  ],
  server: {
    port: 8000,
    open: true
  }
});
