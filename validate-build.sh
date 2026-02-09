#!/bin/bash
# Build validation script - ensures code is ready for production

set -e  # Exit on any error

echo "🔍 Starting build validation..."
echo ""

# Check if required files exist
echo "✓ Checking required files..."
required_files=("index.html" "style.css" "app.js" "pet.js" "battle.js" "server.js" "manifest.json" "sw.js")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing required file: $file"
        exit 1
    fi
done
echo "  All required files present"
echo ""

# Run linter
echo "🧹 Running linter..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting failed"
    exit 1
fi
echo "  Linting passed"
echo ""

# Run tests
echo "🧪 Running tests..."
npm test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed"
    exit 1
fi
echo "  Tests passed"
echo ""

# Check syntax of JavaScript files
echo "🔍 Checking JavaScript syntax..."
for file in *.js; do
    if [ "$file" != "eslint.config.js" ]; then
        node -c "$file" > /dev/null 2>&1
        if [ $? -ne 0 ]; then
            echo "❌ Syntax error in $file"
            node -c "$file"
            exit 1
        fi
    fi
done
echo "  Syntax check passed"
echo ""

echo "✅ Build validation complete!"
echo ""
echo "Ready to build with: npm run build"
