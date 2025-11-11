# 🚀 VPet Deployment Guide

This guide covers deploying the VPet application and multiplayer server.

## 📦 Deployment Options

### Option 1: GitHub Pages (Client Only) - Easiest

The client application is automatically deployed to GitHub Pages when changes are pushed to the main branch.

**Setup:**
1. Go to your repository Settings → Pages
2. Select "GitHub Actions" as the source
3. The workflow will automatically deploy on push to main
4. Access your app at: `https://[username].github.io/vpet/`

**Features:**
- ✅ Free hosting
- ✅ Automatic deployments
- ✅ HTTPS enabled
- ✅ CDN distribution
- ⚠️ Client-only (no multiplayer server)

### Option 2: Docker (Full Stack) - Recommended

Run the multiplayer server using Docker for easy deployment and management.

#### Local Development

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

#### Production Deployment

**Using Docker Hub:**

```bash
# Build image
docker build -t yourusername/vpet-server:latest .

# Push to Docker Hub
docker push yourusername/vpet-server:latest

# Run on server
docker run -d \
  --name vpet-server \
  -p 3000:3000 \
  --restart unless-stopped \
  yourusername/vpet-server:latest
```

**Using GitHub Container Registry (GHCR):**

The GitHub Actions workflow automatically builds and publishes Docker images to GHCR.

```bash
# Pull from GHCR
docker pull ghcr.io/[username]/vpet:latest

# Run
docker run -d \
  --name vpet-server \
  -p 3000:3000 \
  --restart unless-stopped \
  ghcr.io/[username]/vpet:latest
```

**Environment Variables:**

```bash
# Port configuration
docker run -d \
  -e PORT=3000 \
  -e NODE_ENV=production \
  -p 3000:3000 \
  vpet-server
```

### Option 3: Cloud Platforms

#### Heroku

```bash
# Login
heroku login

# Create app
heroku create vpet-server

# Set buildpack
heroku buildpacks:set heroku/nodejs

# Deploy
git subtree push --prefix server heroku main

# Scale
heroku ps:scale web=1
```

#### Railway.app

1. Connect your GitHub repository
2. Select the `server` directory as root
3. Railway auto-detects Node.js
4. Deploy automatically on push

#### DigitalOcean App Platform

1. Create a new app from GitHub
2. Select the repository
3. Configure:
   - Build Command: `cd server && npm install`
   - Run Command: `cd server && npm start`
   - Port: 3000
4. Deploy

#### AWS EC2

```bash
# SSH into instance
ssh -i key.pem ubuntu@your-ec2-ip

# Install Docker
sudo apt update
sudo apt install docker.io docker-compose

# Clone repository
git clone https://github.com/[username]/vpet.git
cd vpet

# Run with Docker
sudo docker-compose up -d

# Check status
sudo docker-compose ps
```

#### Google Cloud Run

```bash
# Build and push
gcloud builds submit --tag gcr.io/[PROJECT-ID]/vpet-server

# Deploy
gcloud run deploy vpet-server \
  --image gcr.io/[PROJECT-ID]/vpet-server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000
```

## 🔧 Configuration

### Client Configuration

Update the server URL in the client application:

1. Open the game
2. Click Settings (⚙️)
3. Set Server URL to your deployed server
4. Save

Or set it in localStorage:

```javascript
localStorage.setItem('vpet_server_url', 'wss://your-server.com');
```

### Server Configuration

#### Environment Variables

```bash
PORT=3000                    # Server port
NODE_ENV=production         # Environment mode
```

#### CORS Configuration

The server allows all origins by default. For production, modify `server/index.js`:

```javascript
res.setHeader('Access-Control-Allow-Origin', 'https://your-domain.com');
```

## 📊 Monitoring

### Health Check

The server exposes a health endpoint:

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "uptime": 12345.67,
  "connections": 5
}
```

### Docker Health Check

Docker automatically monitors server health:

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' vpet-server
```

### Logs

```bash
# Docker logs
docker logs -f vpet-server

# Docker Compose logs
docker-compose logs -f

# Follow specific container
docker logs -f --tail 100 vpet-multiplayer-server
```

## 🔒 Security Best Practices

### Production Checklist

- [ ] Use HTTPS/WSS in production
- [ ] Configure proper CORS origins
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Monitor resource usage
- [ ] Set up automatic backups
- [ ] Use environment variables for secrets
- [ ] Keep dependencies updated
- [ ] Enable container security scanning

### SSL/TLS Setup

**Using Let's Encrypt with Nginx:**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## 🔄 Continuous Deployment

### GitHub Actions Workflows

Two workflows are included:

1. **docker-publish.yml** - Builds and publishes Docker images
   - Triggers on push to main (server changes)
   - Publishes to GitHub Container Registry
   - Runs security scans with Trivy

2. **deploy-pages.yml** - Deploys client to GitHub Pages
   - Triggers on push to main (client changes)
   - Automatic deployment
   - No configuration needed

### Automatic Updates

```bash
# Set up auto-pull and restart
docker run -d \
  --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  vpet-server --interval 300
```

## 🧪 Testing Deployment

### Local Testing

```bash
# Test client locally
open index.html

# Test server
cd server
npm start

# Test Docker build
docker build -t vpet-test .
docker run -p 3000:3000 vpet-test
```

### Integration Testing

```bash
# Test server health
curl http://localhost:3000/health

# Test WebSocket connection
wscat -c ws://localhost:3000
```

## 📱 Mobile Deployment

### Progressive Web App (PWA)

The app can be installed on mobile devices:

1. Open the app in a mobile browser
2. Use "Add to Home Screen" option
3. App runs as standalone application

## 🆘 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Find and kill process
lsof -i :3000
kill -9 [PID]

# Or use different port
docker run -p 3001:3000 vpet-server
```

**Container Won't Start:**
```bash
# Check logs
docker logs vpet-server

# Restart
docker restart vpet-server

# Rebuild
docker-compose down
docker-compose up --build
```

**WebSocket Connection Failed:**
- Check firewall settings
- Verify server is running
- Check CORS configuration
- Ensure correct protocol (ws:// or wss://)

## 📈 Scaling

### Horizontal Scaling

Use a load balancer with sticky sessions:

```nginx
upstream vpet_backend {
    ip_hash;  # Sticky sessions for WebSocket
    server server1:3000;
    server server2:3000;
    server server3:3000;
}

server {
    location / {
        proxy_pass http://vpet_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Vertical Scaling

Increase container resources:

```bash
docker run -d \
  --cpus="2" \
  --memory="1g" \
  vpet-server
```

## 📞 Support

For deployment issues:
- Check the [README.md](README.md) for general setup
- Review [QUICKSTART.md](QUICKSTART.md) for basic usage
- Open an issue on GitHub

---

**Happy Deploying! 🚀**
