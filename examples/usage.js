const NepalGeoHelper = require('../index');

// Initialize the helper
const geo = new NepalGeoHelper();

console.log('=== Nepal Geo Helper - Usage Examples ===\n');

// Example 1: Get all districts
console.log('1. Getting all districts:');
const districts = geo.getDistricts();
console.log(`Total districts: ${districts.length}`);
console.log(`First 5 districts: ${districts.slice(0, 5).map(d => d.name).join(', ')}\n`);

// Example 2: Get specific district
console.log('2. Getting specific district:');
const kathmandu = geo.getDistrict('Kathmandu');
if (kathmandu) {
    console.log(`${kathmandu.name} has ${kathmandu.postOfficeCount} post offices`);
    console.log(`Main post offices: ${kathmandu.postOffices.filter(po => po.type === 'G.P.O.' || po.type === 'D.P.O.').map(po => po.name).join(', ')}\n`);
}

// Example 3: Get postal code information
console.log('3. Getting postal code information:');
const postalInfo = geo.getPostalInfo('44600');
if (postalInfo) {
    console.log(`Postal code 44600:`);
    console.log(`  Post Office: ${postalInfo.postOffice}`);
    console.log(`  District: ${postalInfo.district}`);
    console.log(`  Type: ${postalInfo.type}\n`);
}

// Example 4: Search locations
console.log('4. Searching locations:');
const searchResults = geo.searchLocations('Pokhara');
console.log(`Search results for "Pokhara":`);
searchResults.forEach(result => {
    console.log(`  ${result.type}: ${result.name} ${result.district ? `(${result.district})` : ''}`);
});
console.log();

// Example 5: Validate address
console.log('5. Validating address:');
const address = {
    district: 'Kathmandu',
    postOffice: 'Kathmandu',
    postalCode: '44600',
    municipality: 'Kathmandu Metropolitan',
    ward: 1
};

const validation = geo.validateAddress(address);
console.log(`Address validation:`);
console.log(`  Is valid: ${validation.isValid}`);
console.log(`  Completeness: ${validation.completeness.percentage}`);
if (validation.errors.length > 0) {
    console.log(`  Errors: ${validation.errors.join(', ')}`);
}
if (validation.suggestions.length > 0) {
    console.log(`  Suggestions: ${validation.suggestions.join(', ')}`);
}
console.log();

// Example 6: Get statistics
console.log('6. Nepal geo statistics:');
const stats = geo.getStatistics();
console.log(`  Total districts: ${stats.totalDistricts}`);
console.log(`  Total post offices: ${stats.totalPostOffices}`);
console.log(`  Average post offices per district: ${stats.averagePostOfficesPerDistrict}\n`);

// Example 7: Using individual utilities
console.log('7. Using individual utilities:');

// District utilities
const busyDistricts = geo.districts.getDistrictsWithMostPostOffices(3);
console.log(`Districts with most post offices:`);
busyDistricts.forEach((district, index) => {
    console.log(`  ${index + 1}. ${district.name}: ${district.postOfficeCount} offices`);
});

// Postal utilities
const mainOffices = geo.postal.getMainPostOffices();
console.log(`\nMain post offices (D.P.O./G.P.O.): ${mainOffices.length}`);

// Search utilities
const suggestions = geo.search.getSuggestions('Kath');
console.log(`\nSuggestions for "Kath": ${suggestions.join(', ')}`);

console.log('\n=== End of Examples ===');

// Export for use in other examples
module.exports = {
    geo,
    exampleDistrict: kathmandu,
    examplePostalInfo: postalInfo,
    exampleValidation: validation
};
