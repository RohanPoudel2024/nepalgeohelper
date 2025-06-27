#!/usr/bin/env node

/**
 * Quick script to test GitHub Packages authentication
 */

const { execSync } = require('child_process');

console.log('Testing GitHub Packages Authentication...\n');

try {
    const whoami = execSync('npm whoami --registry=https://npm.pkg.github.com', { encoding: 'utf8' }).trim();
    console.log(`Authenticated as: ${whoami}`);
    console.log('Ready to publish to GitHub Packages!');
    console.log('\nRun: node scripts/publish-github.js');
} catch (error) {
    console.log('Not authenticated with GitHub Packages');
    console.log('\nTo fix this:');
    console.log('1. Create a GitHub Personal Access Token:');
    console.log('   https://github.com/settings/tokens/new');
    console.log('   Scopes needed: write:packages, read:packages');
    console.log('\n2. Login with npm:');
    console.log('   npm login --scope=@rohanpoudel2024 --registry=https://npm.pkg.github.com');
    console.log('   Username: rohanpoudel2024');
    console.log('   Password: <your_github_token>');
    console.log('   Email: yitsmerohan@gmail.com');
    console.log('\n3. Then run this script again to verify');
}
