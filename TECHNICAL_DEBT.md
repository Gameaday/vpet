# 🔧 Technical Debt & Known Issues

This document tracks technical debt, known issues, and areas for improvement in the VPet project.

**Last Updated:** 2026-02-09

---

## 🐛 Critical Bugs (High Priority)

### 1. Server Reconnection Broken
**Severity:** High  
**Location:** `server.js:24-68`  
**Impact:** After disconnect, no auto-reconnect is attempted; 5-second timeout kills promise  
**Fix Required:**
- Implement exponential backoff retry logic
- Add connection pooling
- Show connection status in UI
- Handle graceful degradation to offline mode

### 2. Missing Opponent Reference in Battle Modal
**Severity:** High  
**Location:** `app.js:619`  
**Impact:** Line references `currentBattle.opponent.name` but Battle class stores opponent as `opponentPet`  
**Fix Required:**
- Update reference from `.opponent.name` to `.opponentPet.name`
- Add null checks before accessing opponent properties
- Test online battle completion flow

### 3. Illness System Non-Functional
**Severity:** High  
**Location:** `pet.js:386`  
**Impact:** `checkSickness()` defined but never called - pets never get sick despite the system existing  
**Fix Required:**
- Call `checkSickness()` in the periodic update loop
- Test illness trigger conditions
- Verify medicine button appears when sick
- Test cure functionality

---

## ⚠️ Medium Priority Issues

### 4. Personality Traits Never Updated
**Severity:** Medium  
**Location:** `app.js` - action handlers  
**Impact:** Personality traits defined but static; never changes based on player actions  
**Fix Required:**
- Call `pet.updatePersonality()` after each action (feed, play, train, etc.)
- Add personality display in UI
- Show how care style affects personality

### 5. Stats History Never Recorded
**Severity:** Medium  
**Location:** `app.js` - update loop  
**Impact:** `recordStatsSnapshot()` defined but never called - stats history stays empty, graphs won't work  
**Fix Required:**
- Call `recordStatsSnapshot()` periodically in update loop
- Implement stats history graph visualization
- Add data retention limits (e.g., last 24 hours)

### 6. Cleanliness Stat Completely Unused
**Severity:** Medium  
**Location:** `pet.js:427`  
**Impact:** `clean()` method exists but no button/UI to trigger it; stat never decays  
**Fix Required:**
- Add cleanliness decay over time
- Create "Clean" action button in UI
- Add visual indicators when pet is dirty
- Link cleanliness to illness probability

### 7. Battle History Not Synchronized Online
**Severity:** Medium  
**Location:** `battle.js` - online battle completion  
**Impact:** Battle results recorded locally but never sent to opponent; inconsistent histories  
**Fix Required:**
- Implement battle result synchronization via WebSocket
- Store battle results on server
- Add conflict resolution for disputed results

### 8. Stat Tooltip Selector Bug
**Severity:** Medium  
**Location:** `app.js:456`  
**Impact:** Selects `.stat-bar[data-tooltip]` but updates all stat bars identically  
**Fix Required:**
- Fix selector to target specific stat bar
- Show unique tooltip per stat (value, decay rate, time to critical)
- Add tooltip styling for mobile

---

## 🔍 Low Priority Issues

### 9. Evolution Milestone Called Twice
**Severity:** Low  
**Location:** `app.js:217-230` and `pet.js:169`  
**Impact:** Evolution notification may trigger twice; minor UX issue  
**Fix Required:**
- Consolidate evolution event handling in one location
- Ensure single notification per evolution

### 10. No Input Validation for Pet Names
**Severity:** Low  
**Location:** Pet name input  
**Impact:** Pet name can be any string without sanitization; potential XSS risk  
**Fix Required:**
- Add character limits (e.g., 20 characters max)
- Sanitize HTML entities
- Disallow special characters
- Validate on both client and server

### 11. Discipline Stat Unused
**Severity:** Low  
**Location:** `pet.js` - discipline stat  
**Impact:** Discipline stat stored but never actively used or displayed  
**Fix Required:**
- Link discipline to training effectiveness
- Add "Scold" action to increase discipline
- Show discipline bar in UI
- Use discipline in battle calculations

---

## 🏗️ Architecture Issues

### 12. Monolithic app.js File
**Severity:** Medium  
**Current Size:** 31.7 KB  
**Impact:** Hard to maintain, test, and collaborate on  
**Refactoring Plan:**
```
app.js → Split into:
- app.js (core initialization, orchestration)
- ui-manager.js (DOM updates, rendering)
- action-handler.js (feed, play, sleep, train)
- battle-ui.js (battle modal, animations)
- settings-manager.js (settings modal, themes)
- sound-manager.js (audio context, sound effects)
- toast-manager.js (notifications)
```

### 13. Global Variables
**Severity:** Low  
**Location:** Top of `app.js`  
**Impact:** Pollutes global scope; hard to test in isolation  
**Fix Required:**
- Wrap in IIFE or use ES6 modules
- Create AppState class to encapsulate state
- Use dependency injection for testability

### 14. Magic Numbers Throughout Code
**Severity:** Low  
**Impact:** Evolution thresholds, decay rates, damage calculations hardcoded  
**Fix Required:**
```javascript
// Create config.js
const CONFIG = {
  STATS: {
    DECAY_RATE_HUNGER: 0.5,
    DECAY_RATE_HAPPINESS: 0.2,
    DECAY_RATE_ENERGY: 0.15,
    CRITICAL_THRESHOLD: 30,
    WARNING_THRESHOLD: 50,
    HEALTHY_THRESHOLD: 90
  },
  EVOLUTION: {
    EGG_TO_BABY: 900000,      // 15 minutes
    BABY_TO_CHILD: 3600000,   // 1 hour
    CHILD_TO_TEEN: 8640000,   // 2.4 hours
    TEEN_TO_ADULT: 18000000   // 5 hours
  },
  BATTLE: {
    BASE_ATTACK: 10,
    SPECIAL_MULTIPLIER: 1.5,
    DEFEND_REDUCTION: 0.5
  }
};
```

---

## 📊 Performance Issues

### 15. No Lazy Loading
**Severity:** Low  
**Impact:** All assets load upfront; slow initial load on mobile  
**Fix Required:**
- Lazy load battle system when first battle starts
- Defer sound effects until first interaction
- Use code splitting for online features

### 16. LocalStorage Quota Not Handled
**Severity:** Low  
**Impact:** App crashes if localStorage quota exceeded  
**Fix Required:**
- Implement try-catch for localStorage writes
- Add quota check before writes
- Implement data cleanup (remove old battle history)
- Fallback to in-memory storage

### 17. No Request Throttling
**Severity:** Low  
**Location:** Server WebSocket handlers  
**Impact:** Potential DoS if client spams requests  
**Fix Required:**
- Add rate limiting per connection
- Implement request queue
- Add cooldown between battle requests

---

## 🧪 Testing Issues

### 18. No Automated Tests
**Severity:** High  
**Impact:** Hard to refactor safely; high regression risk  
**Fix Required:**
- Add unit tests for Pet class
- Add unit tests for Battle class
- Add integration tests for action handlers
- Add E2E tests for critical flows (create pet, battle, evolve)
- Set up test framework (Jest, Mocha, or Vitest)

### 19. No CI Test Suite
**Severity:** Medium  
**Impact:** CI validates structure but doesn't run tests  
**Fix Required:**
- Add test step to `.github/workflows/ci.yml`
- Run tests on PR and push to main
- Add coverage reporting
- Block merge if tests fail

---

## 📱 Mobile Issues

### 20. No Offline Support
**Severity:** Medium  
**Impact:** App doesn't work offline despite being perfect for offline play  
**Fix Required:**
- Implement Service Worker properly (sw.js exists but not utilized)
- Cache assets for offline use
- Show offline indicator in UI
- Sync data when back online

### 21. No Push Notifications
**Severity:** Low  
**Impact:** Players can't be reminded to care for pet  
**Fix Required:**
- Implement Push Notification API
- Add notification permission request
- Send reminders for low stats
- Notify on evolution ready
- Add notification settings in UI

---

## 🔒 Security Issues

### 22. No XSS Protection
**Severity:** Medium  
**Impact:** Pet name, battle opponent names not sanitized  
**Fix Required:**
- Use textContent instead of innerHTML where possible
- Sanitize all user input
- Implement Content Security Policy headers
- Add DOMPurify library for sanitization

### 23. WebSocket Not Authenticated
**Severity:** Medium  
**Location:** `server/index.js`  
**Impact:** Anyone can connect and send battle requests  
**Fix Required:**
- Add token-based authentication
- Implement session management
- Add rate limiting per IP
- Validate all incoming messages

---

## 📚 Documentation Debt

### 24. Missing API Documentation
**Severity:** Medium  
**Impact:** Server WebSocket protocol undocumented  
**Fix Required:**
- Document WebSocket message format
- Document server endpoints
- Add JSDoc comments to all functions
- Create API reference guide

### 25. Inaccurate README
**Severity:** Low  
**Impact:** README says "No sound effects yet" but they exist  
**Fix Required:**
- Update README feature list
- Mark implemented features accurately
- Remove "Known Issues" section (move to this file)
- Update screenshots

---

## 🎯 Prioritized Action Plan

### Immediate (Week 1)
1. Fix illness system (call checkSickness)
2. Fix opponent reference bug in battle modal
3. Implement server reconnection
4. Add personality updates after actions
5. Enable stats history recording

### Short Term (Weeks 2-4)
6. Add cleanliness decay and UI
7. Fix stat tooltip selector
8. Add input validation
9. Implement battle result sync
10. Add automated tests

### Medium Term (Months 2-3)
11. Refactor app.js into modules
12. Eliminate global variables
13. Extract magic numbers to config
14. Implement proper offline support
15. Add push notifications

### Long Term (Months 3-6)
16. Add comprehensive test suite
17. Implement WebSocket authentication
18. Add XSS protection
19. Complete API documentation
20. Optimize performance with lazy loading

---

## 📈 Success Metrics

Track these to measure technical debt reduction:
- **Code Coverage:** Target 80%+
- **Bundle Size:** Keep under 100KB gzipped
- **Lighthouse Score:** Target 90+ on all metrics
- **Zero High-Severity Bugs:** Track in issue tracker
- **Documentation Coverage:** 100% of public APIs documented
- **Build Time:** Keep under 30 seconds
- **Test Execution Time:** Keep under 5 seconds

---

**Note:** This document should be updated regularly as issues are fixed and new debt is discovered.
