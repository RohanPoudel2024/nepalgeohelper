// Showcase for Nepal Geo Helper v1.2.0 New Features
const NepalGeoHelper = require('../index.js');

console.log('Nepal Geo Helper v1.2.0 - New Features Showcase\n');

const geo = new NepalGeoHelper();

console.log('=== PROVINCE-BASED ORGANIZATION ===');
const provinces = geo.getDistrictsByProvince();
console.log('Nepal is organized into 7 provinces:');
Object.entries(provinces).forEach(([province, districts]) => {
    console.log(`${province}: ${districts.length} districts`);
    console.log(`   Sample districts: ${districts.slice(0, 3).map(d => d.name).join(', ')}`);
});

console.log('\n=== GEOGRAPHIC COORDINATES ===');
const coordDistricts = geo.getMajorDistrictsWithCoordinates();
console.log('Major districts with coordinates:');
coordDistricts.forEach(district => {
    console.log(`${district.name}: ${district.lat}, ${district.lng} ${district.isCapital ? '(Capital)' : ''}`);
});

console.log('\n=== ENHANCED POSTAL VALIDATION ===');
const testCodes = ['44600', '4460', '446000', '44abc', '99999'];
console.log('Testing postal codes with intelligent suggestions:');
testCodes.forEach(code => {
    const validation = geo.validatePostalCodeWithSuggestions(code);
    console.log(`${code}: ${validation.isValid ? 'Valid' : 'Invalid'}`);
    if (validation.errors && validation.errors.length > 0) {
        console.log(`   Error: ${validation.errors[0]}`);
    }
    if (validation.suggestions && validation.suggestions.length > 0) {
        console.log(`   Suggestion: ${validation.suggestions[0]}`);
    }
    if (validation.message) {
        console.log(`   ${validation.message}`);
    }
});

console.log('\n=== DISTRICT ANALYTICS ===');
const analytics = geo.getDistrictAnalytics('Kathmandu');
console.log('Comprehensive Kathmandu Analysis:');
console.log(`Province: ${analytics.province}`);
console.log(`Coordinates: ${analytics.coordinates.lat}, ${analytics.coordinates.lng}`);
console.log(`Capital Status: ${analytics.isCapital ? 'Yes' : 'No'}`);
console.log(`Post Office Rank: #${analytics.rankings.postOfficeCount} out of ${analytics.rankings.totalDistricts}`);
console.log(`Postal Range: ${analytics.postalCodeRange.min} - ${analytics.postalCodeRange.max}`);
console.log(`Border Districts: ${analytics.borderDistricts.join(', ')}`);
console.log(`Office Types: ${Object.keys(analytics.officeTypes).join(', ')}`);

console.log('\n=== POPULATION-BASED CATEGORIES ===');
const largeDistricts = geo.getDistrictsByPopulation('large');
const mediumDistricts = geo.getDistrictsByPopulation('medium');
console.log(`Large Districts (${largeDistricts.length}): ${largeDistricts.map(d => d.name).join(', ')}`);
console.log(`Medium Districts (${mediumDistricts.length}): ${mediumDistricts.slice(0, 5).map(d => d.name).join(', ')}...`);

console.log('\n=== DISTRICT RELATIONSHIPS ===');
const borders = geo.getBorderingDistricts('Kathmandu');
console.log(`Kathmandu borders ${borders.length} districts:`);
borders.forEach(border => {
    const borderProvince = geo.getDistrictProvince(border.name);
    console.log(`   ${border.name} (${borderProvince}) - ${border.postOfficeCount} post offices`);
});

console.log('\n=== PACKAGE INSIGHTS ===');
const packageInfo = geo.getPackageInfo();
console.log(`Package: ${packageInfo.name} v${packageInfo.version}`);
console.log(`Data: ${packageInfo.dataStats.totalDistricts} districts, ${packageInfo.dataStats.totalPostOffices} post offices`);
console.log(`Last Updated: ${new Date(packageInfo.lastUpdated).toLocaleDateString()}`);

console.log('\nNepal Geo Helper v1.2.0 - Ready for production use!');
console.log('Full documentation: https://github.com/RohanPoudel2024/nepalgeohelper');
console.log('Thank you for using Nepal Geo Helper!');
console.log('For any issues, please open a GitHub issue or contact the maintainer.');