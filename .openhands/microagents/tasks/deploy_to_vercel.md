# Deploy to Vercel

Guides through the process of deploying the application to Vercel, including environment setup, build configuration, and deployment verification.

## Trigger
"deploy to vercel", "vercel deployment", "publish app"

## Inputs
- Environment (required: production/preview/development)
- Branch name (optional, defaults to main)
- Build configuration (optional)
- Environment variables (optional)

## Steps

1. Prepare for Deployment

### Version Control
```bash
# Ensure clean working directory
git status

# Pull latest changes
git pull origin main

# Switch to deployment branch if needed
git checkout {branch_name}
```

### Environment Setup
```bash
# Verify environment variables
cat .env.example

# Check Vercel configuration
cat vercel.json
```

2. Configure Build Settings

### vercel.json Configuration
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
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Build Commands
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

3. Pre-deployment Checks

### Build Verification
```bash
# Local build test
npm run build

# Preview build
npm run preview
```

### Type Checking
```bash
# Run TypeScript checks
npm run typecheck
```

### Test Suite
```bash
# Run tests
npm run test
```

4. Deploy Application

### Using Vercel CLI
```bash
# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Environment Variables
```bash
# Set environment variables
vercel env add VITE_API_URL production
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
```

5. Post-deployment Verification

### Health Checks
```bash
# Check deployment status
vercel list

# View deployment logs
vercel logs
```

### Integration Tests
- Test authentication flow
- Verify API connectivity
- Check database access
- Validate file uploads

## Validation

### Required Configuration
```
project/
├── vercel.json
├── .env.example
├── vite.config.ts
└── package.json
```

### Build Requirements
- No TypeScript errors
- All tests passing
- Build successful
- Preview working
- Environment configured

### Deployment Standards
- Proper environment variables
- Correct build settings
- Routes configured
- SSL enabled
- Domains set up

## Examples

### Production Deployment
```bash
# Deploy to production
claude deploy to vercel --env production
```

### Preview Deployment
```bash
# Deploy feature branch
claude deploy to vercel --env preview --branch feature/auth
```

### Custom Build
```bash
# Deploy with custom configuration
claude deploy to vercel --config custom-vercel.json
```

## Best Practices

### Environment Management
- Use environment variables
- Secure sensitive data
- Document required vars
- Test all environments
- Handle fallbacks

### Build Configuration
- Optimize build size
- Enable source maps
- Configure caching
- Handle assets
- Set up redirects

### Monitoring
- Set up error tracking
- Configure logging
- Monitor performance
- Track deployments
- Set up alerts

### Security
- Enable HTTPS
- Configure CSP
- Set up CORS
- Handle auth tokens
- Protect routes

### Performance
- Enable compression
- Configure caching
- Optimize assets
- Use CDN
- Monitor metrics

## Notes
- Verify environment setup
- Test before deploying
- Monitor deployment
- Check logs for errors
- Verify all features
- Document changes
- Have rollback plan
