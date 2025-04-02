# Vite Development Knowledge

## Keywords
vite, build, dev, hmr, rollup, esbuild, bundler, optimization, plugin

## Overview
Expert in Vite build tool configuration, optimization, and development workflow for modern web applications.

## Basic Configuration

### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

## Development Server

### Features
- Hot Module Replacement (HMR)
- Fast startup and updates
- ESM-based dev server
- Optimized dependencies

### Configuration
```typescript
export default defineConfig({
  server: {
    // Host configuration
    host: true,
    port: 3000,
    
    // CORS and proxy settings
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    },
    
    // Force HTTPS
    https: true,
    
    // Custom middlewares
    middlewares: [
      // Add custom middleware here
    ]
  }
});
```

## Build Configuration

### Production Build
```typescript
export default defineConfig({
  build: {
    // Output directory
    outDir: 'dist',
    
    // Generate sourcemaps
    sourcemap: true,
    
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    },
    
    // Chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          // Add more manual chunks
        }
      }
    }
  }
});
```

### Asset Handling
```typescript
export default defineConfig({
  build: {
    assetsDir: 'assets',
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
});
```

## Plugin System

### Custom Plugin
```typescript
import type { Plugin } from 'vite';

export default function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    
    // Hook examples
    configResolved(config) {
      // Store final resolved config
    },
    
    transform(code, id) {
      // Transform code
      return {
        code: transformedCode,
        map: sourceMap
      };
    },
    
    // More hooks available
  };
}
```

### Common Plugins
```typescript
import vue from '@vitejs/plugin-vue';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    // Add more plugins
  ]
});
```

## Performance Optimization

### Code Splitting
```typescript
// Dynamic imports for route-based code splitting
const MyComponent = () => import('./MyComponent');

// Configure chunk splitting
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
});
```

### Caching
```typescript
export default defineConfig({
  build: {
    // Cache busting
    rollupOptions: {
      output: {
        entryFileNames: '[name].[hash].js',
        chunkFileNames: '[name].[hash].js',
        assetFileNames: '[name].[hash].[ext]'
      }
    }
  }
});
```

## Environment Variables

### Configuration
```typescript
// .env
VITE_API_URL=https://api.example.com

// vite.config.ts
export default defineConfig({
  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_URL)
  }
});

// Usage in code
console.log(import.meta.env.VITE_API_URL);
```

## Testing Setup

### Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html']
    }
  }
});
```

## Troubleshooting

### Common Issues
- HMR not working
- Build optimization problems
- Asset loading issues
- Plugin conflicts

### Debug Mode
```bash
# Enable debug logging
DEBUG=vite:* vite build

# Specific debug scopes
DEBUG=vite:transform vite dev
```

## Best Practices

### Development
- Use alias for imports
- Enable source maps
- Configure proxy for API requests
- Use environment variables

### Production
- Enable minification
- Configure chunk splitting
- Optimize assets
- Generate source maps
- Enable legacy support if needed

### Performance
- Use dynamic imports
- Configure caching
- Optimize dependencies
- Monitor bundle size

## Deployment

### Static Hosting
```typescript
export default defineConfig({
  base: '/my-app/', // For subdirectory deployment
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
```

### Preview
```bash
# Build and preview
vite build
vite preview
