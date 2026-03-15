# Railway Deployment Guide

Deploy the Map Poster Generator to Railway for free with easy integration.

## Prerequisites

- GitHub account with maptoposter repository
- Railway account (free at [railway.app](https://railway.app))
- Basic familiarity with CLI

## Step 1: Set Up Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Create new project
railway init
```

## Step 2: Configure Backend Service

1. Create `railway.toml` in root directory:
```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT"
healthcheck = "/api/health"
restartPolicyMaxRetries = 5

[env]
CACHE_DIR = "/app/cache"
PORT = "8000"
```

2. Add environment:
```bash
railway environment create production
railway environment switch production
```

## Step 3: Create Services

### Backend Service
```bash
# Create backend service
railway service create
# Select Docker as source

# Set environment variables
railway variables set CACHE_DIR=/app/cache

# Deploy
railway up
```

### Frontend Service
```bash
# Create frontend service
railway service create frontend
# Select Node as runtime

# Set build command
railway variables set NODE_BUILD_SCRIPT="cd frontend && npm install && npm run build"
railway variables set NODE_START_SCRIPT="npm run serve"

# Set environment
railway variables set VITE_API_URL=$BACKEND_URL
```

## Step 4: Link Services

Create `railway-link.yml`:
```yaml
services:
  - name: backend
    platform: docker
  - name: frontend
    platform: node

links:
  - from: frontend
    to: backend
    type: environment
    variableName: BACKEND_URL
```

## Step 5: Deploy with CLI

```bash
# Deploy all services
railway up

# View logs
railway logs

# Open dashboard
railway status
```

## Step 6: GitHub Actions Integration

Create `.github/workflows/railway-deploy.yml`:

```yaml
name: Deploy to Railway
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Railway CLI
        run: npm i -g @railway/cli
      
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## Step 7: Environment Variables

Configure these in Railway dashboard:

**Backend:**
```
CACHE_DIR=/app/cache
PORT=8000
PYTHONUNBUFFERED=1
```

**Frontend:**
```
VITE_API_URL=https://map-poster-backend-production.railway.app
NODE_ENV=production
```

## Monitoring

### View Logs
```bash
railway logs -s backend
railway logs -s frontend
```

### Check Status
```bash
railway status
```

### Monitor Metrics
```bash
railway metrics
```

## Scaling

### Increase Resources
```bash
# In Railway dashboard
# Services → [service] → Resources → Increase CPU/Memory
```

### Enable Auto-scaling
1. Go to service settings
2. Enable "Auto-restart on crash"
3. Set memory limits

## Database/Storage (Optional)

```bash
# Add PostgreSQL for user data (future)
railway add postgres

# Add Redis for caching
railway add redis
```

Connect to database:
```python
# In backend/main.py
import os
database_url = os.getenv("DATABASE_URL")
```

## Troubleshooting

### Build Fails
```bash
# Check build logs
railway logs --source build

# Rebuild
railway up --no-cache
```

### Service Not Starting
```bash
# View startup logs
railway logs -s backend --follow

# Restart service
railway service restart
```

### Connection Issues
```bash
# Test API
curl https://[your-backend].railway.app/api/health

# Check CORS in logs
railway logs -s frontend
```

## Cost (Free Tier)

Rails deployment includes:
- 500 hours/month compute (free tier)
- Generous bandwidth
- Automatic SSL certificates
- GitHub integration

## Upgrade to Pro

When you need more resources:
- Unlimited compute hours
- Priority support
- Multiple projects
- Custom domains

## Advanced Configuration

### Custom Domain
1. Dashboard → Project → Domains
2. Add custom domain
3. Update DNS records
4. Configure SSL

### Database Backups
```bash
# Automatic daily backups included
# Manual backup with:
railway database backup create
```

### CI/CD Pipeline
1. Push to main → Railway auto-deploys
2. Run tests in GitHub Actions first:
```yaml
- name: Run tests
  run: python -m pytest backend/
```

## Migration from Other Platforms

### From Render
1. Export environment variables
2. Update `railway.toml`
3. Push to main branch
4. Railway auto-deploys

### From Heroku
1. Create `Procfile` in root:
```
web: python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```
2. Railway auto-detects and deploys

## Network Configuration

### Private Services
```yaml
[deploy]
private = true  # Only accessible from other services
```

### Port Configuration
```toml
[deploy]
port = 8000
```

## Useful Commands

```bash
# View all services
railway services

# Connect to service
railway shell

# Environment management
railway environment list
railway environment create staging
railway environment switch staging

# Logs
railway logs --follow
railway logs -n 100

# Status
railway status

# Variables
railway variables list
railway variables set KEY=value
railway variables delete KEY
```

## Support

- **Documentation**: [docs.railway.app](https://docs.railway.app)
- **Community**: [Discord](https://discord.gg/railway)
- **Issues**: GitHub repository issues

---

Happy deploying! 🚀
