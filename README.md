# 🐾 VPet - Virtual Pet Game

A cross-platform virtual pet application inspired by Digimon and traditional virtual pets. Take care of your pixelated animated pet, watch it grow and evolve, and battle with others online!

## ✨ Features

- **🎮 Interactive Pet Care**: Feed, play, train, and rest your virtual pet
- **📊 Dynamic Stats System**: Monitor health, hunger, happiness, and energy
- **🌱 Evolution System**: Watch your pet grow from egg → baby → child → teen → adult
- **⚔️ Battle System**: Fight against AI opponents locally or challenge other players online
- **💾 Persistent Data**: Your pet's progress is automatically saved
- **📱 Mobile-First Design**: Responsive UI optimized for mobile devices
- **🌐 Online Multiplayer**: Connect to the server for real-time battles with other players
- **🎨 Pixelated Animations**: Retro-style visual effects and smooth animations

## 🚀 Quick Start

### Playing the Game (Client Only)

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

Contributions are welcome! Some ideas:
- Add more pet stages and evolution paths
- Create different pet species
- Add items and inventory system
- Implement achievement system
- Add mini-games
- Improve AI battle strategy
- Add pet customization options

## 🐛 Known Issues

- Server reconnection could be more robust
- Battle animations are basic
- No sound effects yet

## 🎯 Future Enhancements

- [ ] Multiple pet species with different stats
- [ ] Breeding system
- [ ] Items and shop
- [ ] Achievements and badges
- [ ] Leaderboards
- [ ] Friend system
- [ ] Pet trading
- [ ] Mini-games
- [ ] Sound effects and music
- [ ] More evolution branches

---

Made with ❤️ for the vpet community