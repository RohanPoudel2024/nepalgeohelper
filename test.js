const NepalGeoHelper = require('./index');

function runTests() {
    console.log('Running Nepal Geo Helper Tests...\n');
    
    let passed = 0;
    let failed = 0;

    function test(name, testFn) {
        try {
            const result = testFn();
            if (result) {
                console.log(`[PASS] ${name}`);
                passed++;
            } else {
                console.log(`[FAIL] ${name} - Test failed`);
                failed++;
            }
        } catch (error) {
            console.log(`[ERROR] ${name} - Error: ${error.message}`);
            failed++;
        }
    }

    const geo = new NepalGeoHelper();

    // Test 1: Initialize package
    test('Package initialization', () => {
        return geo && typeof geo.getDistricts === 'function';
    });

    // Test 2: Get districts
    test('Get all districts', () => {
        const districts = geo.getDistricts();
        console.log(`\nActual district count: ${districts.length}`);
        
        // Log all district names to check for duplicates
        const districtNames = districts.map(d => d.name).sort();
        console.log('All districts:', districtNames);
        
        // Check for duplicates
        const duplicates = districtNames.filter((name, index) => districtNames.indexOf(name) !== index);
        if (duplicates.length > 0) {
            console.log('Duplicate districts found:', duplicates);
        }
        
        return Array.isArray(districts) && districts.length === 75;
    });

    // Test 3: Get specific district
    test('Get specific district', () => {
        const kathmandu = geo.getDistrict('Kathmandu');
        return kathmandu && kathmandu.name === 'Kathmandu' && kathmandu.postOfficeCount > 0;
    });

    // Test 4: Case insensitive district search
    test('Case insensitive district search', () => {
        const kathmandu1 = geo.getDistrict('kathmandu');
        const kathmandu2 = geo.getDistrict('KATHMANDU');
        return kathmandu1 && kathmandu2 && kathmandu1.name === kathmandu2.name;
    });

    // Test 5: Non-existent district
    test('Non-existent district returns null', () => {
        const result = geo.getDistrict('NonExistentDistrict');
        return result === null;
    });

    // Test 6: Get postal info
    test('Get postal code information', () => {
        const postal = geo.getPostalInfo('44600');
        return postal && postal.district && postal.postOffice;
    });

    // Test 7: Invalid postal code
    test('Invalid postal code returns null', () => {
        const result = geo.getPostalInfo('99999');
        return result === null;
    });

    // Test 8: Search functionality
    test('Search locations', () => {
        const results = geo.searchLocations('Kathmandu');
        return Array.isArray(results) && results.length > 0;
    });

    // Test 9: Address validation - valid
    test('Valid address validation', () => {
        const validation = geo.validateAddress({
            district: 'Kathmandu',
            postalCode: '44600'
        });
        return validation.isValid === true;
    });

    // Test 10: Address validation - invalid
    test('Invalid address validation', () => {
        const validation = geo.validateAddress({
            district: 'InvalidDistrict'
        });
        return validation.isValid === false && validation.errors.length > 0;
    });

    // Test 11: Statistics
    test('Get statistics', () => {
        const stats = geo.getStatistics();
        return stats.totalDistricts > 0 && stats.totalPostOffices > 0;
    });

    // Test 12: District utilities
    test('District utilities', () => {
        const districtNames = geo.districts.getDistrictNames();
        console.log(`\nDistrict names count: ${districtNames.length}`);
        return Array.isArray(districtNames) && districtNames.length === 75; // Should be exactly 75
    });

    // Test 13: Postal utilities
    test('Postal utilities', () => {
        const mainOffices = geo.postal.getMainPostOffices();
        return Array.isArray(mainOffices) && mainOffices.length > 0;
    });

    // Test 14: Search suggestions
    test('Search suggestions', () => {
        const suggestions = geo.search.getSuggestions('Kath');
        return Array.isArray(suggestions) && suggestions.length > 0;
    });

    // Test 15: Export functionality
    test('Export district data', () => {
        const csvData = geo.districts.exportData('csv');
        return typeof csvData === 'string' && csvData.includes('District Name');
    });

    // Test 16: Fuzzy matching - abbreviations
    test('Fuzzy matching for abbreviations', () => {
        const ktmResults = geo.searchLocations('ktm');
        const foundKathmandu = ktmResults.some(r => 
            r.name === 'Kathmandu' && r.matchType === 'fuzzy'
        );
        return foundKathmandu;
    });

    // Test 17: Fuzzy matching - typos
    test('Fuzzy matching for typos', () => {
        const typoResults = geo.searchLocations('lalitpurr');
        const foundLalitpur = typoResults.some(r => 
            r.name === 'Lalitpur' && r.matchType === 'fuzzy'
        );
        return foundLalitpur;
    });

    // Test 18: Fuzzy matching - multiple abbreviations
    test('Fuzzy matching for multiple abbreviations', () => {
        const bhktResults = geo.searchLocations('bhkt');
        const pokResults = geo.searchLocations('pok');
        
        const foundBhaktapur = bhktResults.some(r => 
            r.name === 'Bhaktapur' && r.matchType === 'fuzzy'
        );
        const foundPokResults = pokResults.length > 0;
        
        return foundBhaktapur && foundPokResults;
    });

    // Test 19: Fuzzy matching - relevance scoring
    test('Fuzzy matching relevance scoring', () => {
        const results = geo.searchLocations('ktm');
        const kathmandu = results.find(r => r.name === 'Kathmandu');
        
        return kathmandu && kathmandu.relevance >= 70 && kathmandu.relevance <= 100;
    });

    // Test 20: Fuzzy matching - common typos
    test('Fuzzy matching for common typos', () => {
        const pokhra = geo.searchLocations('pokhra'); // typo for pokhara
        const chitwan = geo.searchLocations('chitawan'); // typo for chitwan
        
        return pokhra.length > 0 && chitwan.length > 0;
    });

    // Summary
    console.log('\nTest Results:');
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

    if (failed === 0) {
        console.log('\nAll tests passed! Package is working correctly.');
    } else {
        console.log('\nSome tests failed. Please check the implementation.');
    }

    return failed === 0;
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests();
}

module.exports = { runTests };
