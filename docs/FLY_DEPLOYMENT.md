# Fly.io Deployment Guide

Deploy the Map Poster Generator to Fly.io for a fast, scalable hosting solution.

## Prerequisites

- GitHub repository
- Fly.io account (free tier available at [fly.io](https://fly.io))
- Flyctl CLI installed

## Installation

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Add to PATH (macOS/Linux)
export PATH="$HOME/.fly/bin:$PATH"

# Verify installation
flyctl version

# Login to Fly
flyctl auth login
```

## Step 1: Create Fly App for Backend

```bash
# Create backend app
flyctl apps create map-poster-backend
# Or let them generate an app name

# Generate Dockerfile if needed
flyctl launch
# Answer prompts:
# - Would you like to set up a Postgres database? No
# - Would you like to set up a Redis instance? No
# - Choose region closest to you
```

## Step 2: Configure Backend

Create `fly.toml`:

```toml
app = "map-poster-backend"
kill_signal = "SIGINT"
kill_timeout = 5
processes = []

[env]
  CACHE_DIR = "/app/cache"
  PYTHONUNBUFFERED = "1"

[build]
  builder = "docker"
  dockerfile = "Dockerfile"

[build.args]
  PYTHON_VERSION = "3.11"

[[services]]
  internal_port = 8000
  process_name = "app"
  protocol = "tcp"

  [services.concurrency]
    hard_limit = 25
    soft_limit = 20

  [[services.ports]]
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [[services.tcp_checks]]
    grace_period = "10s"
    interval = "15s"
    timeout = "2s"

[[services.http_checks]]
  grace_period = "10s"
  interval = "10s"
  protocol = "http"
  timeout = "2s"
  path = "/api/health"

[[mounts]]
  destination = "/app/cache"
  source = "cache_volume"

[metrics]
  port = 9090
  path = "/metrics"
```

## Step 3: Create Volumes

```bash
# Create persistent volume for cache
flyctl volumes create cache_volume --size 10

# Verify volume
flyctl volumes list
```

## Step 4: Deploy Backend

```bash
# Set environment variables
flyctl secrets set CACHE_DIR=/app/cache

# Deploy
flyctl deploy

# Check status
flyctl status

# View logs
flyctl logs
```

## Step 5: Create Frontend App

```bash
# Create frontend app
flyctl apps create map-poster-frontend

# Initialize
flyctl launch --org [your-org]

# Choose Node.js environment
# Select region
```

## Step 6: Configure Frontend

Create `frontend/fly.toml`:

```toml
app = "map-poster-frontend"
primary_region = "dfw"  # Dallas

[build]
  builder = "docker"
  dockerfile = "frontend/Dockerfile"

[[services]]
  internal_port = 80
  protocol = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443
```

Update `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN VITE_API_URL=https://map-poster-backend.fly.dev npm run build

FROM nginx:alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Step 7: Deploy Frontend

```bash
# Set backend URL
flyctl secrets set VITE_API_URL=https://map-poster-backend.fly.dev

# Deploy from frontend directory
cd frontend
flyctl deploy --app map-poster-frontend

# Check status
flyctl status --app map-poster-frontend

# Open in browser
flyctl open --app map-poster-frontend
```

## Step 8: Custom Domain Configuration

### Add Custom Domain

```bash
# Add domain
flyctl certs add yourdomain.com --app map-poster-backend
flyctl certs add yourdomain.com --app map-poster-frontend

# Verify DNS
flyctl certs show yourdomain.com --app map-poster-backend
```

### DNS Configuration

1. Get CNAME from Fly:
   ```bash
   flyctl certs list --app map-poster-backend
   ```

2. Add to your DNS provider:
   ```
   Type: CNAME
   Name: yourdomain.com
   Value: [fly-assigned-dns-name].fly.dev
   ```

3. Verify SSL certificate:
   ```bash
   flyctl certs check yourdomain.com --app map-poster-backend
   ```

## Database (Optional - for future features)

```bash
# Create PostgreSQL database
flyctl postgres create

# Create Redis cache
flyctl redis create

# List resources
flyctl resources list
```

## Monitoring

### View Logs

```bash
# Real-time logs
flyctl logs --app map-poster-backend

# Filter logs
flyctl logs -a map-poster-backend --follow -- -n 10
```

### Metrics

```bash
# View app metrics
flyctl metrics

# Show specific metric
flyctl metrics app --app map-poster-backend
```

### Status

```bash
# Overall status
flyctl status

# Specific app
flyctl status --app map-poster-backend

# Machine details
flyctl machines list --app map-poster-backend
```

## Scaling

### Horizontal Scaling

```bash
# Scale to 2 instances
flyctl scale count 2 --app map-poster-backend

# View current scaling
flyctl scale show --app map-poster-backend
```

### Vertical Scaling

```bash
# Show VM sizes
flyctl platform vm-sizes

# Change VM size
flyctl scale vm shared-cpu-1x --app map-poster-backend
```

## GitHub Actions Integration

Create `.github/workflows/deploy-flyio.yml`:

```yaml
name: Deploy to Fly.io

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Install Flyctl
        run: curl -L https://fly.io/install.sh | sh

      - name: Deploy Backend
        run: |
          flyctl deploy --remote-only -a map-poster-backend
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

      - name: Deploy Frontend
        run: |
          cd frontend
          flyctl deploy --remote-only -a map-poster-frontend
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

## Environment Variables

### Backend Secrets

```bash
# Set secrets
flyctl secrets set \
  CACHE_DIR=/app/cache \
  PYTHONUNBUFFERED=1 \
  --app map-poster-backend

# List secrets
flyctl secrets list --app map-poster-backend

# Remove secret
flyctl secrets delete SECRET_NAME --app map-poster-backend
```

### Frontend Environment

```bash
flyctl secrets set \
  VITE_API_URL=https://map-poster-backend.fly.dev \
  --app map-poster-frontend
```

## Backup and Recovery

### Manual Backup

```bash
# Download cache volume
flyctl ssh console -a map-poster-backend
tar czf cache.tar.gz /app/cache
exit
```

### Volume Management

```bash
# List volumes
flyctl volumes list --app map-poster-backend

# Create snapshot
flyctl volumes snapshot --app map-poster-backend cache_volume

# Restore from snapshot
flyctl volumes create cache_volume --snapshot-id [snapshot-id]
```

## Troubleshooting

### Build Issues

```bash
# Check build logs
flyctl logs --app map-poster-backend

# Rebuild without cache
flyctl deploy --buildarg NOCACHE=$(date +%s) --app map-poster-backend
```

### Connectivity Issues

```bash
# Test health check
curl https://map-poster-backend.fly.dev/api/health

# SSH into machine
flyctl ssh console -a map-poster-backend

# Check running processes
ps aux
```

### Out of Memory

```bash
# Check resource usage
flyctl metrics

# Scale to larger VM
flyctl scale vm shared-cpu-2x --app map-poster-backend
```

## Advanced Configuration

### Load Balancing

Fly.io automatically handles load balancing across machines.

### Rate Limiting

Add to `backend/main.py`:
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
```

### Caching Headers

Update `frontend/nginx.conf`:
```nginx
location ~* \.(js|css|png|jpg)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

## Cost Analysis

- **Compute**: $0.0147/hour per shared CPU-1x machine
- **Memory**: Included with compute
- **Volumes**: $0.15/GB/month
- **Bandwidth**: Included (1TB/month free)
- **Transactions**: Pay-as-you-go

## Migration Checklist

- [ ] Create Fly apps
- [ ] Configure volumes
- [ ] Set environment variables
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Configure custom domains
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Set up CI/CD

## Related Commands

```bash
# List all apps
flyctl apps list

# Delete app
flyctl apps destroy app-name

# Show detailed app info
flyctl apps info app-name

# Change region
flyctl regions set [region-code]

# View pricing
flyctl status --verbose
```

## Useful Resources

- [Fly.io Documentation](https://fly.io/docs)
- [Troubleshooting Guide](https://fly.io/docs/getting-started/troubleshooting)
- [CLI Reference](https://fly.io/docs/reference/flyctl)

---

Your application is now deployed to Fly.io! 🚀
