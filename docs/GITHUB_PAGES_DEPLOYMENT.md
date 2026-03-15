# GitHub Pages Deployment Guide

Deploy the frontend directly to GitHub Pages for free static hosting.

## Prerequisites

- GitHub repository with maptoposter code
- Backend API deployed to a service (Render, Railway, Fly.io, etc.)

## Step 1: Configure Frontend for GitHub Pages

Update `frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/maptoposter/',  // Replace 'maptoposter' with your repo name
  build: {
    outDir: 'dist',
  }
})
```

## Step 2: Create GitHub Actions Workflow

Create `.github/workflows/github-pages-deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: 'frontend/package.json'

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Build frontend
        run: |
          cd frontend
          npm run build
        env:
          VITE_API_URL: ${{ secrets.API_URL || 'https://backend-api.onrender.com' }}

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: 'frontend/dist'

      - name: Deploy to GitHub Pages
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        id: deployment
        uses: actions/deploy-pages@v2
```

## Step 3: Configure GitHub Pages

1. Go to repository **Settings** → **Pages**
2. Source: Select "GitHub Actions"
3. Save settings

## Step 4: Set Environment Variables

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Create new secret `API_URL`:
   ```
   https://your-deployed-backend-api.onrender.com
   ```
3. Or use the default in the workflow

## Step 5: Update App.jsx for GitHub Pages

Update `frontend/src/App.jsx` to use correct API URL:

```javascript
const [apiUrl, setApiUrl] = useState(
  process.env.VITE_API_URL || 
  'https://your-backend-api.onrender.com'
);
```

## Step 6: Deploy

1. Commit all changes:
```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

2. Workflow automatically triggers
3. Check **Actions** tab for build status
4. Access frontend at: `https://username.github.io/maptoposter/`

## Step 7: Custom Domain (Optional)

### DNS Configuration

1. Go to **Settings** → **Pages**
2. Under "Custom domain", enter your domain
3. Configure DNS:

**For Apex Domain** (example.com):
```
Type: A
Name: @
Value: 185.199.108.153
        185.199.109.153
        185.199.110.153
        185.199.111.153
```

**For Subdomain** (app.example.com):
```
Type: CNAME
Name: app
Value: username.github.io
```

4. Enable "Enforce HTTPS"
5. Click **Save**

## Troubleshooting

### Build Fails
```bash
# Check errors in Actions tab
# Common issues:
# 1. Wrong base path in vite.config.js
# 2. Missing VITE_API_URL environment variable
# 3. Incorrect node version

# Test locally:
cd frontend
npm run build
```

### API Requests Fail
**Symptom**: 404 or CORS errors in browser console

**Solution**:
1. Verify `VITE_API_URL` is set correctly in GitHub secrets
2. Check backend service is running and accessible
3. Verify CORS is enabled in backend:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],  # or specific domain
   )
   ```

### Paths Break After Deployment
**Cause**: Incorrect base path in vite.config.js

**Solution**:
```javascript
base: '/maptoposter/',  // Use correct repo name
```

### Assets Return 404
```bash
# Verify dist folder has correct structure:
frontend/dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
```

## Performance Optimization

### Caching Headers
GitHub Pages automatically sets good caching headers, but you can optimize further with `_headers` file:

Create `frontend/public/_headers`:
```
/*
  Cache-Control: max-age=3600

/assets/*
  Cache-Control: max-age=31536000

/index.html
  Cache-Control: max-age=0
```

### Build Optimization
Update `frontend/vite.config.js`:
```javascript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor': ['react', 'react-dom'],
      }
    }
  }
}
```

### Minification
Already enabled by default in production build.

## Monitoring Deployments

### View Workflow Runs
1. Go to **Actions** tab
2. Click on workflow runs to see details
3. Check for errors in build logs

### Track Deployment Status
```bash
# Using GitHub CLI
gh run list --workflow github-pages-deploy.yml
gh run view <run-id>
```

## Limitations of GitHub Pages

- **Static site only** - No backend processing
- **Maximum 100 MB** - Per repository
- **Rate limiting** - For build frequency (10 per hour)
- **No server-side features** - Must use external API

## Best Practices

1. **Separate Backend and Frontend**
   - Backend: Render/Railway/other
   - Frontend: GitHub Pages

2. **Environment Configuration**
   - Use GitHub secrets for API URLs
   - Different URLs per environment

3. **CI/CD Pipeline**
   - Run tests before deployment
   - Build optimization enabled
   - Deploy only on main branch

4. **Version Control**
   - Keep frontend code separate in `/frontend`
   - Use `.gitignore` for build artifacts
   - Tag releases for easy rollback

## Example Workflow for Multiple Environments

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [development, production]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Build for ${{ matrix.environment }}
        run: |
          cd frontend
          npm ci
          npm run build
        env:
          VITE_API_URL: ${{ secrets[format('API_URL_{0}', matrix.environment)] }}
      
      - name: Deploy
        uses: actions/deploy-pages@v2
        if: matrix.environment == 'production'
```

## Advanced: Using Cloudflare with GitHub Pages

1. Add nameservers to your domain registrar
2. Create `frontend/next.config.js` or use Cloudflare directly
3. Set up Cloudflare workers for API proxying:
```javascript
// worker.js
export default {
  async fetch(request) {
    const url = request.url.replace(/\/api\//, '/');
    return fetch(new Request(url, request));
  }
}
```

## Support Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Deploying with GitHub Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)

---

Your frontend is now hosted on GitHub Pages! 🎉
