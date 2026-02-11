# VPet Quick Start Guide

## 🚀 Getting Started in 30 Seconds

### Option 1: Play Immediately (No Setup Required)
1. Open `index.html` in your web browser
2. That's it! Start caring for your pet!

### Option 2: With Live Server (Recommended)
```bash
# Using Python (if installed)
python -m http.server 8000

# Using Node.js (if installed)
npx http-server

# Then open: http://localhost:8000
```

### Option 3: GitHub Pages Deployment
1. Go to your repository Settings
2. Navigate to Pages section
3. Select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" directory
5. Your app will be live at: `https://yourusername.github.io/vpet/`

## 🎮 Basic Controls

### Taking Care of Your Pet
- **🍖 Feed** - When hunger drops below 70
- **🎮 Play** - To keep happiness high
- **💤 Sleep** - When energy is low
- **💪 Train** - To increase level for battles

### Understanding Stats
- **Health** ❤️: Keep above 50 (feed when hungry)
- **Hunger** 🍔: Decreases over time (feed regularly)
- **Happiness** 😊: Increases with play
- **Energy** ⚡: Restore with sleep

### Evolution Timeline
- **Egg** → **Baby** (~15 minutes)
- **Baby** → **Child** (~1 hour)
- **Child** → **Teen** (~2.4 hours)
- **Teen** → **Adult** (~5 hours)

### Battle System
1. Click **⚔️ Battle** for local AI battles
2. Choose your action each turn:
   - **Attack**: Normal damage
   - **Defend**: Reduce incoming damage
   - **Special**: 1.5x damage
3. Win to gain experience and level up!

## 🌐 Multiplayer Setup (Optional)

### Starting the Server
```bash
cd server
npm install
npm start
```

Server runs on `http://localhost:3000`

### Connecting Clients
1. Open the game in your browser
2. Click **⚙️ Settings**
3. Set Server URL to: `ws://localhost:3000`
4. Click **Save**
5. Click **🌐 Online Battle** to find opponents!

## 💡 Pro Tips

1. **Keep stats balanced** - Don't let any stat drop too low
2. **Check on your pet regularly** - Stats decay over time
3. **Sleep is important** - Best way to restore energy
4. **Train before battles** - Higher level = better stats
5. **Pet persists** - Close and reopen anytime, your pet is saved!

## 📱 Mobile Use

The game is fully responsive! Add it to your home screen:

**iOS:**
1. Open in Safari
2. Tap Share button
3. Select "Add to Home Screen"

**Android:**
1. Open in Chrome
2. Tap menu (⋮)
3. Select "Add to Home screen"

## 🐛 Troubleshooting

**Pet stats not updating?**
- Refresh the page - stats update every 10 seconds

**Battle buttons not working?**
- Make sure it's your turn (buttons enable after opponent's action)

**Can't connect to server?**
- Check server is running (`npm start` in server directory)
- Verify WebSocket URL in settings matches server

**Pet disappeared?**
- Check browser localStorage is enabled
- Try different browser if issues persist

## 🎯 Quick Reference

| Action | Energy Cost | Hunger Impact | Happiness Change |
|--------|-------------|---------------|------------------|
| Feed   | 0           | +30          | +5               |
| Play   | -15         | -10          | +20              |
| Sleep  | Restores    | 0            | 0                |
| Train  | -25         | -20          | -5               |
| Battle | -30         | 0            | Win: +10, Lose: -10 |

## 🌟 Enjoy Your Virtual Pet!

Remember: The best pet is a well-cared-for pet! 🐾
