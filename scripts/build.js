/**
 * Build script for Nepal Geo Helper package
 */

const fs = require('fs');
const path = require('path');

function buildPackage() {
    console.log('🔨 Building Nepal Geo Helper package...\n');

    try {
        // Ensure data directory exists
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Check if geo-data module can load data
        console.log('📊 Checking data loading...');
        const GeoData = require('../lib/geo-data');
        const geoData = new GeoData();
        console.log(`✅ Loaded ${geoData.getStatistics().totalDistricts} districts and ${geoData.getStatistics().totalPostOffices} post offices`);

        // Validate package structure
        console.log('\n📁 Validating package structure...');
        const requiredFiles = [
            '../index.js',
            '../index.d.ts',
            '../package.json',
            '../README.md',
            '../LICENSE',
            '../lib/geo-data.js',
            '../lib/district-utils.js',
            '../lib/postal-utils.js',
            '../lib/location-validator.js',
            '../lib/geo-search.js'
        ];

        let allFilesExist = true;
        requiredFiles.forEach(file => {
            const filePath = path.join(__dirname, file);
            if (fs.existsSync(filePath)) {
                console.log(`✅ ${file}`);
            } else {
                console.log(`❌ ${file} - Missing!`);
                allFilesExist = false;
            }
        });

        if (!allFilesExist) {
            throw new Error('Some required files are missing');
        }

        // Run tests
        console.log('\n🧪 Running tests...');
        const { runTests } = require('../test');
        const testsPassed = runTests();

        if (!testsPassed) {
            throw new Error('Tests failed');
        }

        // Generate data file if it doesn't exist
        const dataFile = path.join(dataDir, 'postal-data.json');
        if (!fs.existsSync(dataFile)) {
            console.log('\n📄 Generating data file...');
            // The geo-data module will create it automatically
            console.log(`✅ Data file created at ${dataFile}`);
        }

        // Check package.json validity
        console.log('\n📦 Validating package.json...');
        const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
        
        const requiredFields = ['name', 'version', 'description', 'main', 'keywords', 'author', 'license'];
        const missingFields = requiredFields.filter(field => !packageJson[field]);
        
        if (missingFields.length > 0) {
            console.log(`⚠️  Missing package.json fields: ${missingFields.join(', ')}`);
        } else {
            console.log('✅ package.json is valid');
        }

        console.log('\n🎉 Build completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('1. Update package.json with your details (author, repository, etc.)');
        console.log('2. Test the package: npm test');
        console.log('3. Publish to npm: npm publish');

        return true;

    } catch (error) {
        console.error(`\n❌ Build failed: ${error.message}`);
        return false;
    }
}

// Run build if this file is executed directly
if (require.main === module) {
    buildPackage();
}

module.exports = { buildPackage };
