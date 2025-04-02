---
name: Deploy to Vercel
description: Guides through the process of deploying the application to Vercel
type: task
triggers: [deploy to vercel, vercel deployment, publish app]
author: OpenHands
version: 1.0.0
---

# Vercel Deployment Guide

Ensures consistent and reliable deployments to Vercel.

## Usage

```bash
claude deploy to vercel --env production
claude deploy to vercel --env preview --branch feature/auth
claude deploy to vercel --config custom-vercel.json
```

## Process

1. Pre-deployment Checks

### Version Control
```bash
# Ensure clean state
git status
git pull origin main

# Switch to deployment branch
git checkout {branch_name}
```

### Environment Setup
```bash
# Verify required variables
cat .env.example

# Check configuration
cat vercel.json
```

2. Build Configuration

### vercel.json
```json
{
  "build": {
    "env": {
      "VITE_API_URL": "@api_url",
      "VITE_SUPABASE_URL": "@supabase_url",
      "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key"
    }
  },
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

3. Deployment Steps

### Local Verification
```bash
# Build test
npm run build

# Type check
npm run typecheck

# Run tests
npm run test
```

### Deploy Command
```bash
# Login if needed
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

4. Post-deployment Verification

### Health Checks
```bash
# List deployments
vercel ls

# Check logs
vercel logs
```

## Validation

### Required Files
```
project/
├── vercel.json
├── .env.example
├── vite.config.ts
└── package.json
```

### Environment Variables
- API endpoints
- Authentication keys
- Feature flags
- Service URLs
- Analytics IDs

### Build Requirements
- Clean git state
- All tests passing
- Types checking
- Build succeeding
- Dependencies updated

## Examples

### Production Deploy
```bash
# Full production deployment
claude deploy to vercel --env production
```

### Preview Deploy
```bash
# Feature branch preview
claude deploy to vercel --env preview --branch feature/auth
```

## Best Practices

### Environment Setup
- Use environment variables
- Secure sensitive data
- Document requirements
- Test all environments
- Handle fallbacks

### Build Process
- Optimize assets
- Enable source maps
- Configure caching
- Handle redirects
- Validate output

### Monitoring
- Set up error tracking
- Configure logging
- Monitor performance
- Track deployments
- Enable alerts

### Security
- Enable HTTPS
- Configure CSP
- Set up CORS
- Handle auth tokens
- Secure routes

### Performance
- Enable compression
- Configure caching
- Optimize assets
- Use CDN
- Monitor metrics

## Troubleshooting

### Common Issues
- Build failures
- Environment issues
- Route conflicts
- SSL problems
- Cache issues

### Solutions
- Check logs
- Verify config
- Test locally
- Clear cache
- Update dependencies
