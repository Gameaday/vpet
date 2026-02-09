# Build System Documentation

This document describes the improved build system for VPet.

## Available Scripts

### Development Scripts

- **`npm run lint`** - Run ESLint to check code quality
- **`npm run lint:fix`** - Automatically fix ESLint issues where possible
- **`npm test`** - Run all tests once
- **`npm run test:watch`** - Run tests in watch mode (for development)
- **`npm run test:coverage`** - Run tests with coverage report
- **`npm run serve`** - Start a local web server on port 8000

### Build Scripts

- **`npm run clean`** - Remove build artifacts (www/, dist/, coverage/)
- **`npm run validate`** - Run comprehensive validation (files, lint, tests, syntax)
- **`npm run build:quick`** - Quick build without validation (for development)
- **`npm run build`** - Full production build with validation
  - Runs `prebuild` hook (lint + test)
  - Cleans old builds
  - Copies files to www/ directory

### Mobile Build Scripts

- **`npm run android:build`** - Build Android debug APK
- **`npm run android:release`** - Build Android release APK

## Build Process

### Quick Development Build

For rapid iteration during development:

```bash
npm run build:quick
```

This skips validation and just copies files to the www/ directory.

### Production Build

For production deployments:

```bash
npm run build
```

This runs the full validation pipeline:
1. Lints all JavaScript files
2. Runs all tests
3. Cleans old build artifacts
4. Copies files to www/ directory

### Validation Pipeline

To validate code quality without building:

```bash
npm run validate
```

This runs:
- File existence checks
- ESLint code quality checks
- Test suite
- JavaScript syntax validation

## Code Quality

### ESLint Configuration

The project uses ESLint 10 with flat config (`eslint.config.js`). Configuration highlights:

- Uses ESLint recommended rules
- Configured for ES modules
- Includes globals for browser, Node.js, and test environments
- Warnings for unused variables (errors for undefined variables)
- Enforces semicolons and consistent quotes

### Running Linter

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix
```

### Test Suite

The project uses Vitest with the following configuration:
- Environment: happy-dom (lightweight DOM simulation)
- Coverage provider: v8
- Coverage includes: pet.js, battle.js, server.js
- All tests must pass before building

## Robustness Improvements

### Input Validation

- Pet names are sanitized to prevent XSS attacks
- All HTML characters (< and >) are removed
- Names are limited to 50 characters
- Type coercion ensures data integrity

### Error Handling

- localStorage operations wrapped in try-catch
- Handles quota exceeded errors gracefully
- Automatic cleanup of old data when storage is full
- Corrupted data recovery with fallback to defaults

### Stat Validation

- All pet stats validated to stay within 0-100 range
- Stage validation ensures only valid evolution stages
- Level and wins constrained to positive numbers

## Continuous Integration

The GitHub Actions CI workflow:
1. Validates client code structure
2. Checks server dependencies
3. Validates documentation
4. Runs the test suite
5. Generates coverage reports

See `.github/workflows/ci.yml` for details.

## Best Practices

### Before Committing

Always run validation before committing:

```bash
npm run validate
```

### Before Deploying

Always run the full build:

```bash
npm run build
```

### Code Style

- Use ES6+ features (classes, arrow functions, template literals)
- Follow ESLint rules
- Write tests for new features
- Document complex logic with comments

## Troubleshooting

### Build Fails on Lint

Run `npm run lint` to see specific issues. Many can be auto-fixed:

```bash
npm run lint:fix
```

### Tests Fail

Run tests in watch mode to debug:

```bash
npm run test:watch
```

### Build Artifacts Not Cleaned

Manually clean:

```bash
npm run clean
```

### LocalStorage Issues

The app handles localStorage issues gracefully:
- Corrupted data: Falls back to defaults
- Quota exceeded: Automatically cleans old data
- Unavailable: Continues with in-memory state

## Development Workflow

1. Make changes to code
2. Run `npm run lint:fix` to auto-fix style issues
3. Run `npm test` to ensure tests pass
4. Run `npm run build:quick` for quick validation
5. Test the built version locally
6. Run `npm run validate` before committing
7. Commit and push

## Security

### Input Sanitization

All user inputs are sanitized:
- Pet names: HTML stripped, length limited
- Battle opponent names: Validated
- Stats: Clamped to valid ranges

### Dependencies

Run `npm audit` regularly to check for vulnerabilities:

```bash
npm audit
```

Note: Current dev dependency vulnerabilities (vitest/esbuild) are non-critical and only affect the development server, not production builds.

## Performance

### Build Times

- Quick build: < 1 second
- Full build: ~15-20 seconds (includes lint + tests)
- Validation: ~15-20 seconds

### Optimization Tips

- Use `build:quick` during active development
- Use `build` for production deployments
- Run `test:watch` in the background during development
- Clean build artifacts regularly with `npm run clean`

## Future Improvements

Potential enhancements to consider:
- Bundle minification for production
- Source maps for debugging
- Asset optimization (image compression, CSS minification)
- Incremental builds
- Build caching
- TypeScript migration
