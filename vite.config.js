import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig(({ command }) => ({
  base: './',
  root: 'src',
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
    ...(command === 'build' ? [createHtmlPlugin({
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true,
        minifyCSS: true,
        minifyJS: true
      }
    })] : []),
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
}));
