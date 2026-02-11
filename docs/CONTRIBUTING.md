# 🤝 Contributing to VPet

Thank you for your interest in contributing to VPet! This document provides guidelines and information for contributors.

---

## 🎯 Ways to Contribute

### 1. 🐛 Report Bugs
- Check existing issues first to avoid duplicates
- Use the bug report template
- Include reproduction steps, expected vs actual behavior
- Provide browser/OS information
- Add screenshots if applicable

### 2. 💡 Suggest Features
- Check the [ROADMAP.md](ROADMAP.md) and [DEVELOPMENT_STRATEGY.md](DEVELOPMENT_STRATEGY.md) first
- Use the feature request template
- Explain the use case and benefit
- Consider implementation complexity
- Be open to feedback and discussion

### 3. 📝 Improve Documentation
- Fix typos, clarify instructions
- Add examples, diagrams, screenshots
- Update outdated information
- Write tutorials or guides
- Translate to other languages

### 4. 🎨 Create Content
- Design pet sprites or evolution stages
- Create background themes
- Compose music or sound effects
- Write lore or backstory
- Create promotional materials

### 5. 💻 Write Code
- Fix bugs from the [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md)
- Implement features from the roadmap
- Improve performance or code quality
- Add tests
- Refactor for maintainability

---

## 🚀 Getting Started

### Prerequisites
- Basic knowledge of HTML, CSS, JavaScript
- Git installed on your machine
- A modern web browser
- Node.js (for server development)
- Text editor (VS Code recommended)

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/vpet.git
   cd vpet
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Gameaday/vpet.git
   ```

4. **Install server dependencies** (optional, for multiplayer)
   ```bash
   cd server
   npm install
   cd ..
   ```

5. **Start development**
   ```bash
   # Option 1: Open index.html directly in browser
   open index.html
   
   # Option 2: Use a local server (recommended)
   python -m http.server 8000
   # or
   npx http-server
   
   # Option 3: For server development
   cd server
   npm start
   ```

### Project Structure
```
vpet/
├── index.html          # Main HTML file
├── style.css          # Styles and animations
├── pet.js             # Pet class (state, evolution, stats)
├── battle.js          # Battle system
├── server.js          # WebSocket client
├── app.js             # Main application logic
├── sw.js              # Service worker (PWA)
├── manifest.json      # PWA manifest
├── server/            # Multiplayer server
│   ├── index.js       # WebSocket server
│   └── package.json   # Server dependencies
├── icons/             # PWA icons
├── README.md          # Main documentation
├── ROADMAP.md         # Future features
├── IMPROVEMENTS.md    # Quick wins
├── TECHNICAL_DEBT.md  # Known issues
├── DEVELOPMENT_STRATEGY.md # Long-term plan
├── CONTRIBUTING.md    # This file
└── .github/
    └── workflows/     # CI/CD pipelines
```

---

## 📋 Development Workflow

### 1. Create a Feature Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b fix/bug-description
```

### 2. Make Your Changes

**Code Style:**
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused
- Follow existing code patterns
- Use camelCase for variables/functions
- Use PascalCase for classes

**Testing:**
- Test manually in multiple browsers (Chrome, Firefox, Safari)
- Test on mobile devices (or use browser dev tools)
- Ensure no console errors
- Check that existing features still work
- Add automated tests if possible (future requirement)

**Commit Messages:**
```bash
# Good examples
git commit -m "feat: add idle animation for pet"
git commit -m "fix: resolve opponent reference bug in battle modal"
git commit -m "docs: update README with accurate feature list"
git commit -m "refactor: extract sound manager from app.js"
git commit -m "test: add unit tests for Pet class evolution"

# Format: type(scope): description
# Types: feat, fix, docs, style, refactor, test, chore
```

### 3. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name
```

Then on GitHub:
1. Navigate to your fork
2. Click "Pull Request" button
3. Fill out the PR template
4. Reference related issues (#123)
5. Wait for review

---

## ✅ Pull Request Guidelines

### Before Submitting
- [ ] Code follows project style
- [ ] All tests pass (when tests exist)
- [ ] No console errors or warnings
- [ ] Tested in multiple browsers
- [ ] Documentation updated if needed
- [ ] Commit messages are clear
- [ ] Branch is up to date with main

### PR Description Should Include
- **What:** Brief description of changes
- **Why:** Reason for changes (fix bug, add feature)
- **How:** Implementation approach
- **Testing:** How you tested it
- **Screenshots:** For UI changes
- **Related Issues:** Links to issues (#123)

### Review Process
1. Automated checks run (CI pipeline)
2. Maintainer reviews code
3. Feedback provided (if needed)
4. You make requested changes
5. Approved and merged!

---

## 🎨 Design Guidelines

### UI/UX Principles
- **Mobile-first:** Design for small screens first
- **Simple:** Avoid clutter, prioritize clarity
- **Accessible:** Consider color blindness, screen readers
- **Retro aesthetic:** Maintain pixel art style
- **Consistent:** Match existing design patterns

### Visual Style
- **Colors:** Use existing color scheme (dark/light themes)
- **Fonts:** System fonts for performance
- **Animations:** Subtle, smooth (60fps)
- **Icons:** Simple, recognizable
- **Spacing:** Consistent padding/margins

### Sound Design
- **8-bit style:** Keep retro game feel
- **Short:** Sound effects should be <500ms
- **Optional:** Always respect sound toggle
- **Appropriate volume:** Not too loud (10% gain)

---

## 🧪 Testing Guidelines

### Manual Testing Checklist
- [ ] Create new pet (reset if needed)
- [ ] Feed, play, sleep, train actions work
- [ ] Stats update correctly
- [ ] Evolution occurs at right times
- [ ] Local battles work
- [ ] Online battles work (if server running)
- [ ] Settings save and apply
- [ ] Pet data persists after refresh
- [ ] Mobile responsive (test different sizes)
- [ ] No JavaScript errors in console

### Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

### Automated Testing (Future)
```bash
# When test suite is implemented
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --coverage # Coverage report
```

---

## 🐛 Bug Fix Process

### 1. Reproduce the Bug
- Understand the issue completely
- Document reproduction steps
- Identify root cause

### 2. Write a Test (if applicable)
- Create test that fails due to bug
- This prevents regression

### 3. Fix the Bug
- Make minimal changes
- Avoid refactoring unrelated code
- Keep fix focused

### 4. Verify Fix
- Run test (should now pass)
- Manual testing
- Check for side effects

### 5. Submit PR
- Reference issue number
- Explain root cause and fix

---

## 🎯 Priority Contributions

See [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md) for prioritized issues.

### 🔥 High Priority (Good First Issues)
1. Fix illness system - activate `checkSickness()` calls
2. Add stat bar color warnings (red/yellow/green)
3. Fix opponent reference in battle modal
4. Implement personality trait updates
5. Add input validation for pet names

### 🌟 Medium Priority
1. Refactor app.js into modules
2. Add idle animations
3. Implement stats history recording
4. Improve toast notifications
5. Add battle history display

### 💡 Low Priority (Advanced)
1. Implement mini-games
2. Add multiple evolution paths
3. Create item system
4. Build friend system
5. Add leaderboards

---

## 📚 Resources

### Learning Resources
- [MDN Web Docs](https://developer.mozilla.org/) - Web standards reference
- [JavaScript.info](https://javascript.info/) - Modern JS tutorial
- [CSS Tricks](https://css-tricks.com/) - CSS techniques
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) - For multiplayer

### Tools
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/) - Debugging
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance auditing
- [Can I Use](https://caniuse.com/) - Browser compatibility
- [Prettier](https://prettier.io/) - Code formatting

### Inspiration
- [Tamagotchi](https://en.wikipedia.org/wiki/Tamagotchi) - Original virtual pet
- [Digimon](https://en.wikipedia.org/wiki/Digimon) - Evolution system inspiration
- [Pou](https://pou.me/) - Modern virtual pet reference

---

## 🏆 Recognition

### Contributors Wall of Fame
Contributors will be recognized in:
- README.md contributors section
- In-game credits
- Release notes
- Community shoutouts

### Contribution Levels
- **🌱 Seedling:** First contribution
- **🌿 Sprout:** 5+ contributions
- **🌳 Tree:** 20+ contributions or major feature
- **🏆 Champion:** Core maintainer status

---

## ❓ Questions?

- **General Questions:** Open a discussion on GitHub
- **Bug Reports:** Create an issue
- **Feature Ideas:** Create a feature request
- **Security Issues:** Email gameaday@example.com (use actual email)
- **Chat:** Join our Discord server (when created)

---

## 📜 Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background or identity.

### Expected Behavior
- ✅ Be respectful and constructive
- ✅ Give and receive feedback gracefully
- ✅ Focus on what's best for the community
- ✅ Show empathy towards others
- ✅ Celebrate others' achievements

### Unacceptable Behavior
- ❌ Harassment, trolling, or insulting comments
- ❌ Personal or political attacks
- ❌ Publishing others' private information
- ❌ Spam or off-topic disruptions
- ❌ Any conduct that would be inappropriate professionally

### Enforcement
Violations may result in:
1. Warning
2. Temporary ban
3. Permanent ban

Report issues to gameaday@example.com (use actual email)

---

## 📄 License

By contributing to VPet, you agree that your contributions will be licensed under the MIT License.

---

## 🎉 Thank You!

Every contribution, no matter how small, helps make VPet better for everyone. We appreciate your time and effort! 🐾

**Happy coding!**
