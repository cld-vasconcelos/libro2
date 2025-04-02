---
name: Vite Development
description: Expert knowledge for Vite build tool configuration and optimization
type: knowledge
triggers: [vite, build, dev, hmr, rollup, esbuild, bundler]
author: OpenHands
version: 1.0.0
---

# Vite Guide

Essential configuration and optimization patterns for Vite in the Libro project.

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
  }
});
```

## Development Server

### Hot Module Replacement
```typescript
// Enable HMR in components
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // Handle updates
  });
}

// Configure server
export default defineConfig({
  server: {
    hmr: {
      overlay: true,
      timeout: 2000
    },
    watch: {
      usePolling: true
    }
  }
});
```

## Build Optimization

### Production Setup
```typescript
export default defineConfig({
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@/components/ui']
        }
      }
    },

    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
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

## Plugin Integration

### Custom Plugin
```typescript
// plugins/custom-plugin.ts
import type { Plugin } from 'vite';

export default function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    
    configResolved(config) {
      // Plugin setup
    },
    
    transform(code, id) {
      // Transform code
      return {
        code: transformedCode,
        map: sourceMap
      };
    }
  };
}
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

## Best Practices

### Performance
- Enable code splitting
- Configure chunk strategy
- Optimize dependencies
- Use build caching
- Monitor bundle size

### Development
- Use aliases for imports
- Enable source maps
- Configure proxies
- Handle assets properly
- Use environment variables

### Production
- Minify output
- Generate source maps
- Configure caching
- Enable compression
- Validate builds

### Asset Handling
- Optimize images
- Bundle CSS efficiently
- Handle fonts properly
- Configure public path
- Set size limits

### Debugging
- Use development tools
- Check build output
- Monitor HMR updates
- Validate config
- Test production builds

## Common Issues

### Troubleshooting
- HMR not working
- Build failures
- Import errors
- Plugin conflicts
- Performance issues

### Solutions
- Clear cache
- Check dependencies
- Validate config
- Update plugins
- Monitor resources
