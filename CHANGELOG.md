# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
