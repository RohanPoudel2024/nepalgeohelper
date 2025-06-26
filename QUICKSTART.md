# Nepal Geo Helper - Quick Start Guide

## Installation

```bash
npm install nepalgeohelper
```

## Basic Usage

```javascript
const NepalGeoHelper = require('nepalgeohelper');
const geo = new NepalGeoHelper();

// Get all districts
const districts = geo.getDistricts();
console.log(`Nepal has ${districts.length} districts`);

// Find Kathmandu
const kathmandu = geo.getDistrict('Kathmandu');
console.log(`${kathmandu.name} has ${kathmandu.postOfficeCount} post offices`);

// Check postal code
const postal = geo.getPostalInfo('44600');
console.log(`44600 is in ${postal.district}`);
```

## Common Use Cases

### 1. Address Form Validation

```javascript
const address = {
    district: 'Kathmandu',
    postalCode: '44600'
};

const validation = geo.validateAddress(address);
if (!validation.isValid) {
    console.log('Errors:', validation.errors);
}
```

### 2. Location Search/Autocomplete

```javascript
const suggestions = geo.search.getSuggestions('Kath');
// Returns: ['Kathmandu', 'Kathjor']
```

### 3. District Information

```javascript
const stats = geo.districts.getDistrictStats('Kathmandu');
console.log('Post offices:', stats.totalPostOffices);
console.log('Has main office:', stats.hasMainPostOffice);
```

### 4. Export Data

```javascript
const csvData = geo.districts.exportData('csv');
// Get CSV of all districts
```

## TypeScript

```typescript
import NepalGeoHelper, { District, ValidationResult } from 'nepalgeohelper';

const geo = new NepalGeoHelper();
const districts: District[] = geo.getDistricts();
```

## API Quick Reference

| Method | Description | Returns |
|--------|-------------|---------|
| `getDistricts()` | All districts | `District[]` |
| `getDistrict(name)` | Specific district | `District \| null` |
| `getPostalInfo(code)` | Postal information | `PostalInfo \| null` |
| `searchLocations(query)` | Search results | `SearchResult[]` |
| `validateAddress(addr)` | Address validation | `ValidationResult` |
| `getStatistics()` | Geographic stats | `Statistics` |

Need more help? Check the full [README.md](README.md) or examples in the `examples/` directory.
