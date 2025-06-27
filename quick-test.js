// Quick functionality test
const NepalGeoHelper = require('./index.js');

console.log('🧪 Testing NepalGeoHelper functionality...\n');

// Test 1: District count using class
const geoHelper = new NepalGeoHelper();
const districts = geoHelper.getDistricts();
console.log(`📊 Total districts: ${districts.length} (expected: 75)`);
console.log(`✅ District count test: ${districts.length === 75 ? 'PASS' : 'FAIL'}\n`);

// Test 2: Specific district
const kathmandu = geoHelper.getDistrict('Kathmandu');
console.log(`🏙️  Kathmandu district:`, kathmandu ? 'Found' : 'Not found');
console.log(`✅ District lookup test: ${kathmandu ? 'PASS' : 'FAIL'}\n`);

// Test 3: Package stats
const stats = geoHelper.getStatistics();
console.log(`📈 Package stats:`, stats);
console.log(`✅ Stats test: ${stats.totalDistricts === 75 ? 'PASS' : 'FAIL'}\n`);

// Test 4: Search functionality
const searchResults = geoHelper.searchLocations('Pokhara');
console.log(`🔍 Search for 'Pokhara':`, searchResults.length > 0 ? `${searchResults.length} results` : 'No results');
console.log(`✅ Search test: ${searchResults.length > 0 ? 'PASS' : 'FAIL'}\n`);

// Test 5: Quick access functions
const quickDistricts = NepalGeoHelper.getDistricts();
console.log(`🚀 Quick access districts: ${quickDistricts.length}`);
console.log(`✅ Quick access test: ${quickDistricts.length === 75 ? 'PASS' : 'FAIL'}\n`);

console.log('🎉 Package is ready for use!');
