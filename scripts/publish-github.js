#!/usr/bin/env node

/**
 * Manual script to publish to GitHub Packages
 * Run this locally after setting up authentication
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('Publishing to GitHub Packages...\n');

try {
    // Backup original package.json
    console.log('Backing up package.json...');
    fs.copyFileSync('package.json', 'package.json.backup');
    
    // Read current package.json
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log(`Current version: ${packageJson.version}`);
    
    // Create GitHub Packages version
    console.log('Creating GitHub Packages version...');
    packageJson.name = '@rohanpoudel2024/nepalgeohelper';
    packageJson.publishConfig = {
        registry: 'https://npm.pkg.github.com'
    };
    
    // Write modified package.json
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    
    // Skip authentication check and proceed directly
    console.log('Proceeding with publish (authentication was done via npm login)...');
    
    // Set registry for this scope
    console.log('Configuring registry...');
    execSync('npm config set @rohanpoudel2024:registry https://npm.pkg.github.com', { stdio: 'inherit' });
    
    // Publish to GitHub Packages
    console.log('Publishing to GitHub Packages...');
    execSync('npm publish', { stdio: 'inherit' });
    
    console.log('Successfully published to GitHub Packages!');
    
} catch (error) {
    console.error('Error publishing to GitHub Packages:', error.message);
    
    if (error.message.includes('401') || error.message.includes('403')) {
        console.log('\nAuthentication failed. Make sure you have:');
        console.log('1. Generated a GitHub Personal Access Token with `write:packages` permission');
        console.log('2. Logged in with: npm login --scope=@rohanpoudel2024 --registry=https://npm.pkg.github.com');
        console.log('3. Used your GitHub username and the token as password');
    }
    
} finally {
    // Restore original package.json
    console.log('\nRestoring original package.json...');
    if (fs.existsSync('package.json.backup')) {
        fs.copyFileSync('package.json.backup', 'package.json');
        fs.unlinkSync('package.json.backup');
        console.log('Original package.json restored');
    }
}
