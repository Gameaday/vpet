# 🌐 GitHub Pages Deployment Guide for VPet

## Overview

VPet can be deployed on **GitHub Pages** for free, but with important limitations regarding multiplayer functionality.

---

## ✅ What Works on GitHub Pages

GitHub Pages is **perfect for hosting the VPet client** (HTML/CSS/JavaScript):

- ✅ **Full Single-Player Experience**
  - Pet care (feed, play, train, sleep)
  - Evolution system (all 5 stages)
  - Local AI battles
  - Mini-games (Reaction, Memory, Rhythm)
  - Shop and inventory
  - Achievements and milestones
  - All themes and visual features
  - Progressive Web App (PWA) functionality
  - Offline play via Service Worker

- ✅ **Browser-Based Features**
  - LocalStorage persistence
  - Sound effects and vibration
  - Responsive mobile design
  - All animations and visual effects

---

## ❌ What DOESN'T Work on GitHub Pages

GitHub Pages is **static hosting only** - it cannot run server-side code:

- ❌ **Multiplayer Features** (requires Node.js server)
  - Online battles with real players
  - Friend matchmaking
  - Tournament mode with online players
  - Leaderboards (server-based)
  - Cloud backup syncing

- ❌ **Server Requirements**
  - WebSocket connections (real-time communication)
  - User authentication
  - Persistent server-side storage
  - Match-making logic

---

## 🎯 Deployment Strategy

### Option 1: GitHub Pages Only (Recommended for Most Users)

**Best for:** Casual players, single-player experience, demos

**Setup:**
1. Enable GitHub Pages in repository Settings
2. Select source: `GitHub Actions`
3. Push to main branch
4. Access at: `https://yourusername.github.io/vpet/`

**Result:**
- ✅ Full single-player game works perfectly
- ✅ Zero hosting cost
- ✅ Automatic updates on push
- ⚠️ No multiplayer features

### Option 2: GitHub Pages + External Server (Full Experience)

**Best for:** Communities wanting full multiplayer

**Setup:**
1. Deploy client to GitHub Pages (as above)
2. Deploy server separately to:
   - **Heroku** (free tier available)
   - **Railway** (free tier available)
   - **Render** (free tier available)
   - **DigitalOcean** ($4/month)
   - **Fly.io** (free tier available)
3. Update server URL in settings

**Result:**
- ✅ Full single-player game
- ✅ Full multiplayer features
- 💰 Server costs: $0-4/month depending on provider

---

## 📦 How to Deploy to GitHub Pages

### Automatic Deployment (Recommended)

The repository includes a GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) that automatically deploys on every push to main:

```bash
# Just push to main branch
git push origin main

# GitHub Actions will automatically:
# 1. Build the deployment package
# 2. Deploy to GitHub Pages
# 3. Make it live at https://yourusername.github.io/vpet/
```

### Manual Steps (If Needed)

1. **Enable GitHub Pages:**
   - Go to repository Settings
   - Navigate to "Pages" section
   - Under "Build and deployment":
     - Source: `GitHub Actions`
   - Save settings

2. **Verify Deployment:**
   - Check Actions tab for deployment status
   - Visit `https://yourusername.github.io/vpet/`
   - Confirm game loads and works

3. **Custom Domain (Optional):**
   - Add `CNAME` file with your domain
   - Configure DNS records with your registrar
   - Enable HTTPS in GitHub Pages settings

---

## 🖥️ Deploying the Multiplayer Server

If you want full multiplayer functionality, you need to host the server separately.

### Heroku Deployment (Free Tier)

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create vpet-server

# Deploy
git subtree push --prefix server heroku main

# Your server URL: https://vpet-server.herokuapp.com
```

### Railway Deployment (Free Tier)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init

# Deploy server folder
cd server
railway up

# Get server URL from Railway dashboard
```

### Docker Deployment (Any Platform)

```bash
# Build Docker image
docker build -t vpet-server ./server

# Run locally
docker run -p 3000:3000 vpet-server

# Or push to container registry
docker tag vpet-server your-registry/vpet-server
docker push your-registry/vpet-server
```

---

## 🔧 Configuring Server URL

After deploying your server, update the client to connect to it:

### In-Game Settings

1. Open VPet
2. Click Settings (⚙️)
3. Enter your server URL (e.g., `wss://vpet-server.herokuapp.com`)
4. Click Save
5. Test connection with "Online Battle"

### Default Server URL

To set a default server URL for all users, edit `js/server.js`:

```javascript
constructor() {
    // Change this line to your server URL
    this.serverUrl = 'wss://your-server-domain.com';
    // ...
}
```

---

## 📊 Comparison: Deployment Options

| Feature | GitHub Pages Only | GitHub Pages + Server |
|---------|------------------|---------------------|
| **Cost** | Free | $0-4/month |
| **Setup Time** | 5 minutes | 30 minutes |
| **Single Player** | ✅ Full | ✅ Full |
| **Multiplayer** | ❌ None | ✅ Full |
| **Maintenance** | None | Low |
| **Scalability** | Excellent | Depends on server |

---

## 🎮 User Experience

### Without Server (GitHub Pages Only)

Users will see:
- Full game with all single-player features
- "Offline" server status indicator
- Online battle button disabled
- "Connect to server to enable multiplayer" message

### With Server (Full Stack)

Users will see:
- Everything from single-player
- "Online" server status indicator
- Online battle button enabled
- Active matchmaking
- Friend challenges
- Tournament mode

---

## 🚀 Recommended Setup for Different Use Cases

### Personal Use / Demo
- **Deploy:** GitHub Pages only
- **Why:** Free, simple, perfect for showcasing the game
- **Features:** All single-player content

### Small Community (< 100 players)
- **Deploy:** GitHub Pages + Heroku/Railway free tier
- **Why:** Zero cost, full features, handles small player count
- **Features:** Everything including multiplayer

### Large Community (> 100 players)
- **Deploy:** GitHub Pages + DigitalOcean/AWS
- **Why:** Reliable, scalable, better performance
- **Cost:** ~$10/month
- **Features:** Everything with better server resources

---

## 🔍 Troubleshooting

### "Cannot connect to server"
- **Check:** Server is running and accessible
- **Check:** Server URL in settings is correct
- **Check:** URL uses `wss://` for HTTPS sites, `ws://` for HTTP
- **Solution:** Verify server deployment and URL

### "GitHub Pages not updating"
- **Check:** Actions tab for deployment status
- **Check:** Clear browser cache
- **Solution:** Wait 1-2 minutes after push, hard refresh browser

### "Features missing after deployment"
- **Check:** All files copied correctly in workflow
- **Check:** Browser console for JavaScript errors
- **Solution:** Verify `.github/workflows/deploy-pages.yml` includes all files

---

## 📚 Additional Resources

- **GitHub Pages Docs:** https://docs.github.com/pages
- **Server Deployment Guide:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Architecture Overview:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **Contributing Guide:** [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 💡 Pro Tips

1. **Start Simple:** Deploy to GitHub Pages first, add server later if needed
2. **Free Tiers:** Most server providers offer free tiers perfect for starting out
3. **Monitor Usage:** Track server usage to know when to upgrade
4. **CDN Benefits:** GitHub Pages includes global CDN for fast loading worldwide
5. **Version Control:** Use GitHub releases to track deployed versions

---

## 🤝 Community Servers

If you deploy a public VPet server, consider adding it to our community list:

- Fork the repository
- Add your server to `docs/COMMUNITY_SERVERS.md`
- Submit a pull request

This helps players discover active servers and join communities!

---

**Remember:** The core VPet experience works perfectly on GitHub Pages alone. Multiplayer is an optional enhancement that requires additional server hosting.
