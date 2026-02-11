#!/usr/bin/env node
/**
 * Generate build-info.js with current build time
 * This script is called during the build process
 */

const fs = require('fs');
const path = require('path');

const buildTime = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
const version = '2.0.0'; // Should match package.json version

const buildInfoContent = `/**
 * Build Information
 * This file is auto-generated during build
 */

const BuildInfo = {
    version: '${version}',
    buildTime: '${buildTime}',
    commit: 'local',
    branch: 'local'
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BuildInfo;
}
`;

// Write to js/build-info.js for development
const devPath = path.join(__dirname, 'js', 'build-info.js');
fs.writeFileSync(devPath, buildInfoContent);
console.log(`✅ Generated build-info.js with build time: ${buildTime}`);
