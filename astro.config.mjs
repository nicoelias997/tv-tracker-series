// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';

/**
 * Astro Configuration for SPA Mode
 *
 * This configuration optimizes Astro for Single Page Application architecture:
 * - output: 'static' - Build static HTML (no SSR)
 * - preact integration with compat enabled
 * - Client-side routing handled by wouter
 * - Single entry point (index.astro)
 */
export default defineConfig({
  // Static output - no server-side rendering
  output: 'static',

  // Preact integration with React compat for Portal support
  integrations: [
    preact({
      compat: true, // Enable preact/compat for Portal rendering
    })
  ],

  // Vite configuration
  vite: {
    plugins: [tailwindcss()],

    // Optimize dependencies
    optimizeDeps: {
      include: ['preact', 'preact/hooks', 'preact/compat', 'wouter']
    },

    // Build configuration
    build: {
      // Inline small assets
      assetsInlineLimit: 4096,
      // Minify for production
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false, // Keep console logs for debugging
        }
      }
    }
  },

  // Build configuration
  build: {
    // Inline stylesheets under 4kb
    inlineStylesheets: 'auto'
  }
});