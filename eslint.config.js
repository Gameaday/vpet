import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        WebSocket: 'readonly',
        console: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        clearTimeout: 'readonly',
        fetch: 'readonly',
        Stripe: 'readonly',
        Audio: 'readonly',
        URL: 'readonly',
        location: 'readonly',
        // Service Worker globals
        self: 'readonly',
        caches: 'readonly',
        clients: 'readonly',
        // App globals - classes and functions defined in HTML script tags
        Pet: 'readonly',
        Battle: 'readonly',
        ServerConnection: 'readonly',
        PremiumManager: 'readonly',
        showNotification: 'readonly',
        showToast: 'readonly',
        generateOpponent: 'readonly',
        AccessibilityManager: 'readonly',
        InputValidator: 'readonly',
        GLOBAL_CONSTANTS: 'readonly',
        // Global managers and state (writable in app.js, readable elsewhere)
        pet: 'readonly',
        currentBattle: 'readonly',
        battleUIManager: 'readonly',
        accessibilityManager: 'readonly',
        // Node globals
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        global: 'readonly',
        // Test globals
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
      }
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'semi': ['error', 'always'],
      'quotes': ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: true }]
    }
  },
  {
    ignores: [
      'node_modules/**',
      'www/**',
      'coverage/**',
      'dist/**',
      'android/**',
      'ios/**'
    ]
  }
];
