# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-02-10

### 🎉 Major Release: Phases 3-6 Implementation

This is a major feature release implementing Phases 3-6 of the VPet roadmap, adding gameplay depth, social features, mobile app support, and monetization infrastructure.

### Added - Phase 3: Gameplay Depth

#### Item System
- Complete item system with 5 categories (food, medicine, battle, evolution, cosmetic)
- 15+ unique items with various effects
- Stackable and non-stackable item types
- Item effects: stat restoration, illness cure, evolution influence, cosmetics

#### Shop & Inventory
- Shop with coin-based purchases
- Category filtering (all, food, medicine, battle, evolution, cosmetic)
- Real-time coin balance display
- Inventory management system (30 slots)
- Item usage system with visual feedback
- Premium coin multipliers (2x/3x for premium users)

#### Mini-Games
- **Reaction Game**: Catch falling items before they hit the ground (30 seconds)
- **Memory Game**: Match pairs of cards with scoring system
- **Rhythm Game**: Hit notes at the right time using D, F, J, K keys
- High score tracking for all games
- Coin rewards based on performance
- Stat boosts as rewards (energy, happiness)
- Responsive canvas-based games

#### Evolution Paths
- Multiple evolution branches based on care style:
  - **Power Path**: Battle-focused evolutions (Warrior Child → Battle Teen → Battle Master → Dragon Warrior)
  - **Care Path**: Care-focused evolutions (Happy Child → Gentle Teen → Angel Pet → Divine Guardian)
  - **Balanced Path**: All-around evolutions (Smart Child → Scholar Teen → Wise Guardian → Phoenix Master)
  - **Neglect Path**: Alternative evolution line (Sad Child → Lonely Teen → Shadow Pet → Void Entity)
- 20+ unique evolution forms with different sprites and stat modifiers
- Evolution requirements based on stats, battles, level, and care history
- Evolution influence system (items and actions can influence evolution path)
- Mega/Ultimate forms for end-game progression

### Added - Phase 4: Social Features

#### Friend System
- Add/remove friends
- Friend list with pet information and battle history
- Friend requests (send, accept, decline)
- Block/unblock functionality
- Friend interaction tracking (last interaction, gifts, battles)
- Maximum 50 friends

#### Friend Challenges
- Direct battle challenges to friends
- Challenge history tracking
- Accept/decline challenge system
- Challenge status tracking (pending, accepted, declined, completed)

#### Enhanced Social Features
- Friends button in UI
- Friend tabs (Friends List, Requests, Add Friend)
- Friend item cards with challenge and remove buttons
- Tournament button (placeholder UI - full implementation coming)

### Added - Phase 5: Mobile Apps

#### Android Support
- Capacitor 8.x configuration
- Android build scripts (`npm run android:build`, `npm run android:release`)
- App ID: com.gameaday.vpet
- Build documentation (ANDROID_BUILD.md)
- APK signing support ready

### Added - Phase 6: Monetization

#### Premium Integration
- Coin multiplier integration (2x for Basic, 3x for Premium Plus)
- Premium-exclusive features ready for activation
- Payment structure already defined
- Stripe integration prepared (requires API keys)
- Google Play Billing structure ready

### Added - UI/UX Improvements

#### New UI Elements
- Game Panel with 3 buttons (Shop, Inventory, Games)
- Extended Social Panel (Share, Leaderboard, Friends, Tournament)
- Shop Modal with category filtering and item grid
- Inventory Modal with item usage
- Mini-Games Modal with game selection and canvas
- Friends Modal with tabbed interface
- Tournament Modal (placeholder)
- Coin display in pet stats

#### CSS Styling
- 400+ lines of new CSS for Phase 3-4 features
- Responsive grid layouts for shop and inventory
- Game card styling
- Friend item cards and request cards
- Modal improvements
- Mobile-responsive adjustments
- Empty state messaging

### Changed

#### Battle System
- Battle victories now award coins (10 + level * 2 base reward)
- Premium multipliers applied to coin rewards
- Coin notification on battle win

#### Core Integration
- Phase 3-4 integration module (phase34-integration.js)
- Manager initialization in app.js startup
- Script loading order updated in index.html
- Global manager access for cross-module communication

### Technical Improvements

#### Build & Quality
- All tests passing: 124/124
- ESLint clean: 0 errors, 0 warnings
- Build system updated for new modules
- www/ directory generation includes all new files

#### Code Organization
- New modules: item-system.js, minigames.js, evolution-paths.js, friend-system.js
- Separation of concerns maintained
- Manager pattern for all new systems
- Proper global declarations for linting

### Performance & Optimization

- LocalStorage-based persistence for all new features
- Efficient item and inventory management
- Optimized canvas rendering for mini-games
- Lazy loading of UI components (modals only populate when opened)

## [Unreleased]

### Added

#### Build System
- ESLint integration with modern flat config format (eslint.config.js)
- Comprehensive build validation script (validate-build.sh)
- New npm scripts:
  - `npm run lint` - Check code quality
  - `npm run lint:fix` - Auto-fix code issues
  - `npm run validate` - Full validation pipeline
  - `npm run clean` - Remove build artifacts
  - `npm run build:quick` - Fast build for development
- Pre-build hooks that run lint and tests
- BUILD.md documentation for build system

#### App Robustness
- `validateStats()` method to ensure pet stats stay within valid ranges (0-100)
- Comprehensive error handling for localStorage operations
- Automatic cleanup of old data when localStorage quota is exceeded
- Input sanitization for pet names (removes HTML, limits length)
- Type coercion and validation when loading saved data
- Graceful handling of corrupted localStorage data
- Better error messages and fallback behavior

### Changed

#### Code Quality
- Fixed syntax error in premium.js (extra closing brace)
- Fixed ESLint case declaration issues in app.js and battle.js
- Improved code consistency with ternary operators
- Added comprehensive global declarations for ESLint

#### Security
- Enhanced input sanitization to prevent XSS attacks
- Changed from regex-based HTML tag removal to character-based filtering
- Removes all `<` and `>` characters from pet names
- CodeQL security scan passes with 0 alerts

### Fixed
- localStorage quota exceeded errors now handled gracefully
- Corrupted save data no longer crashes the app
- Pet stats now properly validated on load and save
- Invalid evolution stages now reset to 'egg' instead of causing errors

## [1.0.0] - Previous Release

### Features
- Virtual pet care system (feed, play, train, sleep)
- Evolution system (egg → baby → child → teen → adult)
- Battle system with local AI and online multiplayer
- Progressive Web App (PWA) support
- Multiple themes (dark, light, retro LCD)
- Achievement system
- Personality traits
- Stats tracking and history
- Sound effects (optional)
- Mobile-responsive design

[Unreleased]: https://github.com/Gameaday/vpet/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Gameaday/vpet/releases/tag/v1.0.0
