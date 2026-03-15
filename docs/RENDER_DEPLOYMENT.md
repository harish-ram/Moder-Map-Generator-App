# Render Deployment Guide

This guide provides step-by-step instructions for deploying the Map Poster Generator to Render.

## Prerequisites

- GitHub account with access to the maptoposter repository
- Render account (free tier available at [render.com](https://render.com))

## Step 1: Prepare Your Repository

1. Ensure your repository structure matches the project layout
2. Create a `render.yaml` file in the root directory with build configurations
3. Ensure all necessary files are committed and pushed to main branch

## Step 2: Create Backend Service on Render

1. Log in to [render.com](https://render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `map-poster-backend`
   - **Environment**: `Docker`
   - **Region**: Select closest to your users
   - **Branch**: `main`

5. Set environment variables:
   ```
   CACHE_DIR=/app/cache
   ```

6. Advanced settings:
   - **Disk**: Ensure you have suitable storage (at least 1GB for cache)
   - **Auto-deploy**: Enable (optional)

7. Click **Create Web Service**

## Step 3: Configure Persistent Storage

1. In your backend service settings, go to **Disks**
2. Add a new disk:
   - **Name**: `cache`
   - **Mount Path**: `/app/cache`
   - **Size**: 10GB (adjust based on expected usage)

3. Add another disk for posters:
   - **Name**: `posters`
   - **Mount Path**: `/app/posters`
   - **Size**: 20GB

## Step 4: Create Frontend Service on Render

1. Click **New +** → **Static Site**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `map-poster-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`

4. Set environment:
   - Create `.env.production`:
     ```
     VITE_API_URL=https://map-poster-backend.onrender.com
     ```

5. Click **Create Static Site**

## Step 5: Configure CORS and API Connection

1. Update backend environment variables:
   ```
   FRONTEND_URL=https://map-poster-frontend.onrender.com
   ```

2. Update `backend/main.py` CORS settings:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[
           "https://map-poster-frontend.onrender.com",
           "http://localhost:3000"
       ],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

## Step 6: Set Up GitHub Actions Integration

Create `.github/workflows/render-deploy.yml`:
```yaml
name: Deploy to Render
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Trigger Render Deployment
        if: secrets.RENDER_DEPLOY_HOOK_BACKEND
        run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_BACKEND }}
      - name: Trigger Frontend Deployment
        if: secrets.RENDER_DEPLOY_HOOK_FRONTEND
        run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_FRONTEND }}
```

## Step 7: Get Deployment Hooks

1. Go to backend service settings → **Deploy**
2. Copy the "Deploy hook" URL
3. Add to GitHub secrets as `RENDER_DEPLOY_HOOK_BACKEND`
4. Repeat for frontend as `RENDER_DEPLOY_HOOK_FRONTEND`

## Step 8: Monitor Deployment

1. Check build logs in Render dashboard
2. Verify both services are "Live"
3. Test API at `https://map-poster-backend.onrender.com/api/health`
4. Access frontend at the provided Render URL

## Monitoring and Maintenance

### View Logs
```bash
# Backend logs
tail -f /var/log/render/backend.log
```

### Clear Cache
Via API:
```bash
curl -X POST https://map-poster-backend.onrender.com/api/clear-cache
```

### Update Code
Simply push to main branch - Render will automatically redeploy

## Cost Considerations

- **Web Service**: $7/month (paid tier) or free tier with limitations
- **Storage**: Pay-as-you-use after included usage
- **Bandwidth**: Included, but may have limits

## Troubleshooting

### 502 Bad Gateway
- Check backend service is running
- Verify environment variables are set
- Check Docker build succeeded

### Static files not loading
- Verify frontend build directory is correct
- Check VITE_API_URL is properly set
- Clear browser cache

### API connection timeout
- Increase request timeout in frontend
- Check network connectivity
- Verify backend service is responsive

## Free vs Paid Tier Considerations

| Feature | Free | Paid |
|---------|------|------|
| Deployments | Unlimited | Unlimited |
| Disk Storage | 0.5 GB | Included + Pay per GB |
| Memory | 512 MB | 1+ GB |
| CPU | Shared | Dedicated |
| Auto-sleep | Yes (30 min inactivity) | No |
| Custom Domain | No | Yes |
| Monitoring | Basic | Advanced |

## Next Steps

1. Configure custom domain (paid tier)
2. Set up monitoring and alerts
3. Configure backup strategy for cache/posters
4. Set up CDN for frontend distribution
5. Monitor usage and optimize costs
