# Nepal Geo Helper

A comprehensive Node.js package for Nepal geographic data including districts, postal codes, and location utilities for development teams.

[![npm version](https://badge.fury.io/js/nepalgeohelper.svg)](https://badge.fury.io/js/nepalgeohelper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://github.com/RohanPoudel2024/nepalgeohelper/actions/workflows/node.js.yml/badge.svg)](https://github.com/RohanPoudel2024/nepalgeohelper/actions/workflows/node.js.yml)

## Features

- 🗺️ **Complete Nepal District Data** - All 77+ districts with detailed information
- 📮 **Postal Code Integration** - 900+ postal codes with post office details
- 🔍 **Smart Search** - Fuzzy search for districts, post offices, and postal codes
- ✅ **Address Validation** - Comprehensive Nepal address validation
- 📊 **Geographic Statistics** - Detailed analytics about Nepal's postal system
- 🎯 **TypeScript Support** - Full TypeScript definitions included
- 🚀 **Zero Dependencies** - Lightweight and fast
- 📱 **Developer Friendly** - Simple API with extensive documentation

## Installation

```bash
npm install nepalgeohelper
```

## Quick Start

```javascript
const NepalGeoHelper = require('nepalgeohelper');

// Initialize
const geo = new NepalGeoHelper();

// Get all districts
const districts = geo.getDistricts();
console.log(`Nepal has ${districts.length} districts`);

// Find a specific district
const kathmandu = geo.getDistrict('Kathmandu');
console.log(`${kathmandu.name} has ${kathmandu.postOfficeCount} post offices`);

// Get postal code information
const postalInfo = geo.getPostalInfo('44600');
console.log(`Postal code 44600 belongs to ${postalInfo.district}`);

// Search locations
const results = geo.searchLocations('Pokhara');
console.log(`Found ${results.length} results for Pokhara`);

// Validate address
const address = {
    district: 'Kathmandu',
    postalCode: '44600',
    municipality: 'Kathmandu Metropolitan'
};

const validation = geo.validateAddress(address);
console.log(`Address is ${validation.isValid ? 'valid' : 'invalid'}`);
```

## API Documentation

### Main Class Methods

#### `new NepalGeoHelper()`
Creates a new instance of the Nepal Geo Helper.

#### `getDistricts()`
Returns an array of all districts in Nepal.

```javascript
const districts = geo.getDistricts();
// Returns: Array of district objects with name, postOfficeCount, and postOffices
```

#### `getDistrict(name)`
Returns information about a specific district.

```javascript
const district = geo.getDistrict('Kathmandu');
// Returns: District object or null if not found
```

#### `getPostalInfo(postalCode)`
Returns information about a postal code.

```javascript
const info = geo.getPostalInfo('44600');
// Returns: { postalCode, postOffice, district, type, isMainOffice }
```

#### `searchLocations(query)`
Searches for districts and post offices matching the query.

```javascript
const results = geo.searchLocations('Kath');
// Returns: Array of search results with relevance scores
```

#### `validateAddress(address)`
Validates a Nepal address object.

```javascript
const validation = geo.validateAddress({
    district: 'Kathmandu',
    postalCode: '44600'
});
// Returns: Validation result with errors, warnings, and suggestions
```

#### `getStatistics()`
Returns statistical information about Nepal's geographic data.

```javascript
const stats = geo.getStatistics();
// Returns: { totalDistricts, totalPostOffices, averagePostOfficesPerDistrict }
```

### Utility Classes

The package provides specialized utility classes for advanced use cases:

#### District Utils (`geo.districts`)

```javascript
// Get districts with most post offices
const busyDistricts = geo.districts.getDistrictsWithMostPostOffices(5);

// Get district statistics
const stats = geo.districts.getDistrictStats('Kathmandu');

// Export district data
const csvData = geo.districts.exportData('csv');
```

#### Postal Utils (`geo.postal`)

```javascript
// Get post offices by district
const postOffices = geo.postal.getPostOfficesByDistrict('Kathmandu');

// Find nearest postal codes
const nearest = geo.postal.getNearestPostalCodes('44600', 5);

// Get postal statistics
const stats = geo.postal.getPostalStatistics();
```

#### Location Validator (`geo.validator`)

```javascript
// Validate individual components
const isValidDistrict = geo.validator.validateDistrict('Kathmandu');
const isValidPostal = geo.validator.validatePostalCode('44600');

// Batch validate addresses
const results = geo.validator.batchValidate([address1, address2]);
```

#### Geo Search (`geo.search`)

```javascript
// Advanced search
const results = geo.search.advancedSearch({
    query: 'Kathmandu',
    postOfficeType: 'G.P.O.',
    limit: 10
});

// Get search suggestions
const suggestions = geo.search.getSuggestions('Kath');
```

## Address Object Structure

```javascript
const address = {
    district: 'Kathmandu',           // Required: District name
    municipality: 'Kathmandu Metropolitan', // Optional: Municipality/VDC
    ward: 1,                         // Optional: Ward number (1-35)
    postOffice: 'Kathmandu',        // Optional: Post office name
    postalCode: '44600'             // Optional: 5-digit postal code
};
```

## TypeScript Support

The package includes comprehensive TypeScript definitions:

```typescript
import NepalGeoHelper, { District, PostalInfo, Address, ValidationResult } from 'nepalgeohelper';

const geo = new NepalGeoHelper();
const districts: District[] = geo.getDistricts();
const validation: ValidationResult = geo.validateAddress(address);
```

## Static Methods

For quick one-off operations, you can use static methods:

```javascript
const { getDistricts, getDistrict, getPostalInfo } = require('nepalgeohelper');

const districts = getDistricts();
const kathmandu = getDistrict('Kathmandu');
const postal = getPostalInfo('44600');
```

## Examples

### Web Application Integration

```javascript
// Express.js route for address validation
app.post('/validate-address', (req, res) => {
    const geo = new NepalGeoHelper();
    const validation = geo.validateAddress(req.body);
    
    res.json({
        valid: validation.isValid,
        errors: validation.errors,
        suggestions: validation.suggestions,
        completeness: validation.completeness.percentage
    });
});
```

### Form Auto-completion

```javascript
// Get district suggestions for autocomplete
function getDistrictSuggestions(input) {
    const geo = new NepalGeoHelper();
    return geo.search.getSuggestions(input, { type: 'district', limit: 5 });
}
```

### Data Analysis

```javascript
// Analyze postal distribution
const geo = new NepalGeoHelper();
const stats = geo.postal.getPostalStatistics();

console.log('Post Office Distribution:');
Object.entries(stats.postOfficeTypes).forEach(([type, count]) => {
    console.log(`${type}: ${count} offices`);
});
```

## Data Sources

- **Districts**: Based on Nepal's administrative divisions
- **Postal Codes**: Nepal Postal Service official data
- **Geographic Information**: Government of Nepal sources

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/nepalgeohelper.git
cd nepalgeohelper

# Install dependencies
npm install

# Run tests
npm test

# Run examples
npm run example
```

## Testing

```bash
# Run all tests
npm test

# Run specific test
node test/district-utils.test.js
```

## Performance

- **Load time**: < 50ms for initial data loading
- **Search performance**: < 5ms for typical queries
- **Memory usage**: < 10MB for complete dataset
- **Package size**: < 2MB

## Browser Support

While primarily designed for Node.js, the package can be bundled for browser use with tools like Webpack or Browserify.

## Changelog

### v1.0.0
- Initial release
- Complete Nepal district and postal code data
- Search and validation utilities
- TypeScript support

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: your.email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/nepalgeohelper/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/nepalgeohelper/discussions)

## Related Projects

- [nepal-administrative-divisions](https://github.com/example/nepal-admin) - Administrative boundaries
- [nepal-location-picker](https://github.com/example/location-picker) - React location picker component

---

Made with ❤️ for Nepal's developer community
