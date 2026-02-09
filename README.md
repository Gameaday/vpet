# 🐾 VPet - Virtual Pet Game

[![🚀 Deploy to GitHub Pages](https://github.com/Gameaday/vpet/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/Gameaday/vpet/actions/workflows/deploy-pages.yml)
[![🐳 Docker Image CI/CD](https://github.com/Gameaday/vpet/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/Gameaday/vpet/actions/workflows/docker-publish.yml)
[![✅ CI - Validation & Tests](https://github.com/Gameaday/vpet/actions/workflows/ci.yml/badge.svg)](https://github.com/Gameaday/vpet/actions/workflows/ci.yml)

A cross-platform virtual pet application inspired by Digimon and traditional virtual pets. Take care of your pixelated animated pet, watch it grow and evolve, and battle with others online!

🎮 **[Play Now on GitHub Pages](https://gameaday.github.io/vpet/)** | 📖 [Quick Start Guide](QUICKSTART.md) | 🗺️ [Roadmap](ROADMAP.md) | 🐳 [Docker Hub](https://github.com/Gameaday/vpet/pkgs/container/vpet)

---

## 📚 Documentation Navigation

**New to VPet?** Start here:
- 📋 **[EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md)** - Single-page project overview and status
- 🚀 **[QUICKSTART.md](QUICKSTART.md)** - Get playing in 30 seconds

**For Developers:**
- 🤝 **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute to VPet
- 🔧 **[TECHNICAL_DEBT.md](TECHNICAL_DEBT.md)** - Known issues and priorities
- 🗺️ **[ROADMAP.md](ROADMAP.md)** - Future features and improvements
- 💡 **[IMPROVEMENTS.md](IMPROVEMENTS.md)** - Quick wins and enhancement ideas

**For Project Planning:**
- 📊 **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - Detailed analysis and metrics
- 🎯 **[DEVELOPMENT_STRATEGY.md](DEVELOPMENT_STRATEGY.md)** - 6-phase development plan and monetization strategy
- 🚀 **[DEPLOYMENT.md](DEPLOYMENT.md)** - How to deploy VPet

---

## ✨ Features

- **🎮 Interactive Pet Care**: Feed, play, train, and rest your virtual pet with keyboard shortcuts
- **📊 Dynamic Stats System**: Monitor health, hunger, happiness, energy, discipline, and cleanliness
- **🌱 Evolution System**: Watch your pet grow from egg → baby → child → teen → adult
- **⚔️ Battle System**: Fight against AI opponents locally or challenge other players online with damage numbers
- **💾 Persistent Data**: Your pet's progress, personality, and stats history are automatically saved
- **📱 Mobile-First Design**: Responsive UI optimized for mobile devices
- **🌐 Online Multiplayer**: Connect to the server for real-time battles with other players
- **🎨 Pixelated Animations**: Retro-style visual effects and smooth idle animations
- **🔊 8-bit Sound Effects**: Optional retro audio for immersive gameplay
- **🏆 Achievement System**: Unlock milestones and celebrate progress
- **🎭 Personality Traits**: Your pet develops unique characteristics based on your care
- **🤒 Illness System**: Keep your pet healthy or use medicine to cure sickness
- **🎨 Theme Customization**: Dark mode, light mode, and authentic retro LCD theme

## 🚀 Quick Start

### 🌐 Play Online (Easiest!)

Visit **[https://gameaday.github.io/vpet/](https://gameaday.github.io/vpet/)** to play instantly in your browser!

### 💻 Playing Locally

1. **Open the game**:
   - Simply open `index.html` in a web browser
   - Or use a local web server (recommended):
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   ```

2. **Start caring for your pet**:
   - Your pet starts as an egg
   - Use the action buttons to feed, play, train, or put it to sleep
   - Watch the stats bars to keep your pet healthy and happy
   - Your pet will automatically evolve as it ages

3. **Battle**:
   - Click "Battle" for local AI battles
   - Win battles to gain experience and level up

### Running the Server (Optional - for Online Battles)

The server enables multiplayer battles between players.

1. **Install dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3000`

3. **Connect clients**:
   - Open settings (⚙️ button)
   - Set server URL to `ws://localhost:3000`
   - Click "Online Battle" to find opponents

## 📖 How to Play

### Pet Care

- **🍖 Feed**: Restores hunger, increases happiness and health
- **🎮 Play**: Boosts happiness but consumes energy and hunger
- **💤 Sleep**: Put your pet to sleep to restore energy over time
- **💪 Train**: Increase level but consumes energy and hunger

### Stats

- **❤️ Health**: Decreases when hunger is too low. Keep your pet fed!
- **🍔 Hunger**: Decreases over time. Feed regularly.
- **😊 Happiness**: Decreases slowly. Play with your pet.
- **⚡ Energy**: Consumed by activities. Let your pet sleep.

### Evolution Stages

1. **Egg** (Birth): Your pet starts here
2. **Baby** (~15 minutes): First evolution
3. **Child** (~1 hour): Growing stronger
4. **Teen** (~2.4 hours): Almost mature
5. **Adult** (~5 hours): Final form

### Battle System

- **Local Battle**: Fight against AI opponents based on your level
- **Online Battle**: Connect to server and fight real players
- **Battle Actions**:
  - **Attack**: Deal normal damage
  - **Defend**: Reduce incoming damage next turn
  - **Special**: Deal 1.5x damage but use it wisely
- Win battles to gain experience and increase your pet's level

## 🛠️ Technical Details

### Architecture

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Storage**: LocalStorage API for pet persistence
- **Server**: Node.js with WebSocket (ws library)
- **Design**: Mobile-first responsive design

### File Structure

```
vpet/
├── index.html          # Main HTML file
├── style.css          # Styling and animations
├── pet.js             # Pet class and logic
├── battle.js          # Battle system
├── server.js          # WebSocket client
├── app.js             # Main application logic
├── server/            # Optional multiplayer server
│   ├── index.js       # WebSocket server
│   └── package.json   # Server dependencies
└── README.md          # Documentation
```

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- LocalStorage required
- WebSocket support for online features

## 🎮 Gameplay Tips

1. **Check stats regularly**: Don't let your pet's stats drop too low
2. **Balance activities**: Each action affects different stats
3. **Let your pet sleep**: It's the best way to restore energy
4. **Battle when ready**: Make sure your pet has enough energy
5. **Train regularly**: Increase your level to win more battles
6. **Keep your pet happy**: Higher stats improve battle performance

## 🌐 Deployment

### GitHub Pages

1. Enable GitHub Pages in repository settings
2. Set source to main branch, root directory
3. Access at: `https://yourusername.github.io/vpet/`

### Server Deployment

The server can be deployed to any Node.js hosting platform:

- **Heroku**: `heroku create` and `git push heroku main`
- **Railway**: Connect repository and deploy
- **DigitalOcean**: Deploy on App Platform or Droplet
- **AWS/Azure**: Use container services or App Service

Remember to update the WebSocket URL in client settings to match your server URL.

## 🔧 Development

### Running Locally

```bash
# Open in browser (no build required)
open index.html

# Or with live server
npx live-server
```

### Modifying the Pet

Edit `pet.js` to customize:
- Evolution stages and timing
- Stat decay rates
- Action effects
- Battle statistics

### Customizing Visuals

Edit `style.css` to change:
- Pet sprites and animations
- Color schemes
- Layout and spacing
- Responsive breakpoints

## 📝 License

MIT License - Feel free to use and modify!

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

**Quick Start:**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

**Priority Areas:**
- Bug fixes (see [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md))
- Visual polish and animations
- Battle system enhancements
- Multiplayer features
- Documentation improvements

**Resources:**
- [ROADMAP.md](ROADMAP.md) - Planned features
- [IMPROVEMENTS.md](IMPROVEMENTS.md) - Quick wins
- [DEVELOPMENT_STRATEGY.md](DEVELOPMENT_STRATEGY.md) - Long-term strategy

## 🐛 Known Issues

See [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md) for a complete list of known issues and planned fixes.

**Critical Issues:**
- Server reconnection needs improvement (manual reconnect required after disconnect)
- Illness system exists but not fully activated
- Some personality traits and stats (cleanliness, discipline) need deeper integration

**Note:** We track all issues transparently and prioritize fixes based on impact.

## 🎯 Future Enhancements

See [DEVELOPMENT_STRATEGY.md](DEVELOPMENT_STRATEGY.md) for our complete development roadmap.

**Next Up (Phase 1-2):**
- [ ] Fix critical bugs and activate dormant features
- [ ] Enhanced animations and visual polish
- [ ] Battle system improvements
- [ ] Automated testing suite

**Coming Soon (Phase 3-4):**
- [ ] Multiple evolution paths based on care style
- [ ] Item system with shop
- [ ] Mini-games for coins and stat boosts
- [ ] Friend system and leaderboards

**Long Term (Phase 5-6):**
- [ ] Native mobile apps
- [ ] Tournament mode
- [ ] Breeding system
- [ ] Advanced social features

---

Made with ❤️ for the vpet community