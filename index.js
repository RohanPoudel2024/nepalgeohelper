/**
 * Nepal Geo Helper - Making Nepal location data easy for developers
 * 
 * This package helps you work with Nepal's geographic data including districts,
 * postal codes, and addresses. Perfect for building forms, validation, and 
 * location-based features in your applications.
 * 
 * @author Rohan Poudel <yitsmerohan@gmail.com>
 * @version 1.2.0
 */

const NepalGeoData = require('./lib/geo-data');
const DistrictUtils = require('./lib/district-utils');
const PostalUtils = require('./lib/postal-utils');
const LocationValidator = require('./lib/location-validator');
const GeoSearch = require('./lib/geo-search');

/**
 * Main class that brings together all the Nepal geographic utilities
 * Think of this as your one-stop shop for Nepal location data
 */
class NepalGeoHelper {
    constructor() {
        // Load all the Nepal geographic data
        this.geoData = new NepalGeoData();
        
        // Set up utility classes that you can use
        this.districts = new DistrictUtils(this.geoData);
        this.postal = new PostalUtils(this.geoData);
        this.validator = new LocationValidator(this.geoData);
        this.search = new GeoSearch(this.geoData);
    }

    /**
     * Get all districts in Nepal
     * Returns an array with info about each district
     */
    getDistricts() {
        return this.districts.getAllDistricts();
    }

    /**
     * Find a specific district by name
     * Case-insensitive, so 'kathmandu' and 'Kathmandu' both work
     */
    getDistrict(name) {
        return this.districts.getDistrictByName(name);
    }

    /**
     * Look up information about a postal code
     * Give it a 5-digit code and get back the post office details
     */
    getPostalInfo(postalCode) {
        return this.postal.getPostalInfo(postalCode);
    }

    /**
     * Search for places in Nepal
     * Works with district names, post offices, even partial matches
     */
    searchLocations(query) {
        return this.search.searchByQuery(query);
    }

    /**
     * Validate a Nepal address
     * Checks if districts exist, postal codes are valid, etc.
     */
    validateAddress(address) {
        return this.validator.validateAddress(address);
    }

    /**
     * Get some interesting stats about Nepal's postal system
     */
    getStatistics() {
        return {
            totalDistricts: this.districts.getTotalDistricts(),
            totalPostOffices: this.postal.getTotalPostOffices(),
            averagePostOfficesPerDistrict: this.postal.getAveragePostOfficesPerDistrict()
        };
    }

    /**
     * Get all postal codes in Nepal
     * Returns array of all valid postal codes
     */
    getAllPostalCodes() {
        return this.postal.getAllPostalCodes();
    }

    /**
     * Get districts by province/zone (useful for forms)
     * Returns districts grouped by their administrative divisions
     */
    getDistrictsByProvince() {
        const provinceMapping = {
            'Province No. 1': ['Bhojpur', 'Dhankuta', 'Ilam', 'Jhapa', 'Khotang', 'Morang', 'Okhaldhunga', 'Panchthar', 'Sankhuwasabha', 'Solukhumbu', 'Sunsari', 'Taplejung', 'Terhathum', 'Udayapur'],
            'Madhesh Province': ['Bara', 'Dhanusha', 'Mahottari', 'Parsa', 'Rautahat', 'Saptari', 'Sarlahi', 'Siraha'],
            'Bagmati Province': ['Bhaktapur', 'Chitwan', 'Dhading', 'Dolakha', 'Kathmandu', 'Kavrepalanchok', 'Lalitpur', 'Makawanpur', 'Nuwakot', 'Ramechhap', 'Rasuwa', 'Sindhuli', 'Sindhupalchok'],
            'Gandaki Province': ['Baglung', 'Gorkha', 'Kaski', 'Lamjung', 'Manang', 'Mustang', 'Myagdi', 'Nawalpur', 'Parbat', 'Syangja', 'Tanahun'],
            'Lumbini Province': ['Arghakhanchi', 'Banke', 'Bardiya', 'Dang', 'Gulmi', 'Kapilvastu', 'Palpa', 'Parasi', 'Pyuthan', 'Rolpa', 'Rupandehi'],
            'Karnali Province': ['Dailekh', 'Dolpa', 'Humla', 'Jajarkot', 'Jumla', 'Kalikot', 'Mugu', 'Rukum', 'Salyan', 'Surkhet'],
            'Sudurpashchim Province': ['Achham', 'Baitadi', 'Bajhang', 'Bajura', 'Dadeldhura', 'Darchula', 'Doti', 'Kailali', 'Kanchanpur']
        };

        const result = {};
        const allDistricts = this.getDistricts();
        
        Object.keys(provinceMapping).forEach(province => {
            result[province] = [];
            provinceMapping[province].forEach(districtName => {
                const district = allDistricts.find(d => d.name === districtName);
                if (district) {
                    result[province].push(district);
                }
            });
        });

        return result;
    }

    /**
     * Get province of a specific district
     * @param {string} districtName - Name of the district
     * @returns {string|null} Province name or null if not found
     */
    getDistrictProvince(districtName) {
        const provinceData = this.getDistrictsByProvince();
        for (const [province, districts] of Object.entries(provinceData)) {
            if (districts.some(d => d.name.toLowerCase() === districtName.toLowerCase())) {
                return province;
            }
        }
        return null;
    }

    /**
     * Get package version and info
     */
    getPackageInfo() {
        return {
            name: 'nepalgeohelper',
            version: '1.2.0',
            description: 'Nepal geographic data utilities',
            author: 'Rohan Poudel',
            lastUpdated: new Date().toISOString(),
            dataStats: this.getStatistics()
        };
    }

    /**
     * Get major districts with approximate coordinates (useful for mapping)
     * Returns districts with basic geographic coordinates
     */
    getMajorDistrictsWithCoordinates() {
        const majorDistricts = [
            { name: 'Kathmandu', lat: 27.7172, lng: 85.3240, population: 'Large', isCapital: true },
            { name: 'Lalitpur', lat: 27.6588, lng: 85.3247, population: 'Large', isCapital: false },
            { name: 'Bhaktapur', lat: 27.6710, lng: 85.4298, population: 'Medium', isCapital: false },
            { name: 'Pokhara', lat: 28.2096, lng: 83.9856, population: 'Large', isCapital: false },
            { name: 'Chitwan', lat: 27.5291, lng: 84.3542, population: 'Large', isCapital: false },
            { name: 'Jhapa', lat: 26.3469, lng: 87.9506, population: 'Large', isCapital: false },
            { name: 'Morang', lat: 26.6890, lng: 87.2718, population: 'Large', isCapital: false },
            { name: 'Sunsari', lat: 26.6341, lng: 87.1650, population: 'Medium', isCapital: false },
            { name: 'Banke', lat: 28.1082, lng: 81.6187, population: 'Medium', isCapital: false },
            { name: 'Kailali', lat: 28.7496, lng: 80.9814, population: 'Medium', isCapital: false }
        ];

        return majorDistricts.map(coord => {
            const district = this.getDistrict(coord.name);
            return district ? { ...district, ...coord } : null;
        }).filter(Boolean);
    }

    /**
     * Get districts by population category
     * @param {string} category - 'large', 'medium', 'small'
     * @returns {Array} Districts in the specified category
     */
    getDistrictsByPopulation(category = 'all') {
        const coords = this.getMajorDistrictsWithCoordinates();
        const majorDistrictNames = coords.map(d => d.name);
        const allDistricts = this.getDistricts();

        if (category === 'all') {
            return allDistricts.map(d => ({
                ...d,
                populationCategory: majorDistrictNames.includes(d.name) ? 
                    coords.find(c => c.name === d.name)?.population || 'medium' : 'small'
            }));
        }

        if (category === 'large') {
            return coords.filter(d => d.population === 'Large');
        }

        if (category === 'medium') {
            return coords.filter(d => d.population === 'Medium').concat(
                allDistricts.filter(d => !majorDistrictNames.includes(d.name) && d.postOfficeCount >= 10)
            );
        }

        if (category === 'small') {
            return allDistricts.filter(d => !majorDistrictNames.includes(d.name) && d.postOfficeCount < 10);
        }

        return allDistricts;
    }

    /**
     * Enhanced postal code validation with suggestions
     * @param {string} postalCode - Postal code to validate
     * @returns {Object} Detailed validation result with suggestions
     */
    validatePostalCodeWithSuggestions(postalCode) {
        const isValid = this.postal.isValidPostalCode(postalCode);
        const result = { isValid, postalCode };

        if (isValid) {
            result.info = this.getPostalInfo(postalCode);
            result.message = `Valid postal code for ${result.info.district}`;
        } else {
            result.suggestions = [];
            result.errors = [];

            // Check common issues
            if (!postalCode || postalCode.trim() === '') {
                result.errors.push('Postal code is required');
            } else if (!/^\d+$/.test(postalCode)) {
                result.errors.push('Postal code must contain only numbers');
                // Try to extract numbers
                const numbers = postalCode.replace(/\D/g, '');
                if (numbers.length === 5) {
                    result.suggestions.push(`Did you mean: ${numbers}?`);
                }
            } else if (postalCode.length !== 5) {
                result.errors.push(`Postal code must be 5 digits (got ${postalCode.length})`);
                
                if (postalCode.length === 4) {
                    result.suggestions.push(`Try adding a leading zero: 0${postalCode}`);
                } else if (postalCode.length > 5) {
                    result.suggestions.push(`Try removing extra digits: ${postalCode.substring(0, 5)}`);
                }
            } else {
                result.errors.push('Postal code not found in Nepal');
                
                // Find similar postal codes
                const allCodes = this.getAllPostalCodes();
                const similar = allCodes.filter(code => {
                    const distance = this.calculateStringDistance(postalCode, code);
                    return distance <= 2; // Allow up to 2 character differences
                }).slice(0, 3);
                
                if (similar.length > 0) {
                    result.suggestions = similar.map(code => {
                        const info = this.getPostalInfo(code);
                        return `${code} (${info.district})`;
                    });
                }
            }
        }

        return result;
    }

    /**
     * Calculate string distance for postal code suggestions
     * @private
     */
    calculateStringDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));
        
        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
        
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j - 1][i] + 1,     // deletion
                    matrix[j][i - 1] + 1,     // insertion
                    matrix[j - 1][i - 1] + cost // substitution
                );
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    /**
     * Get border districts of a given district
     * @param {string} districtName - Name of the district
     * @returns {Array} Array of neighboring districts (approximation based on geography)
     */
    getBorderingDistricts(districtName) {
        // Simplified bordering districts mapping for major districts
        const borderMap = {
            'Kathmandu': ['Lalitpur', 'Bhaktapur', 'Kavrepalanchok', 'Dhading', 'Nuwakot'],
            'Lalitpur': ['Kathmandu', 'Bhaktapur', 'Kavrepalanchok', 'Makawanpur'],
            'Bhaktapur': ['Kathmandu', 'Lalitpur', 'Kavrepalanchok'],
            'Pokhara': ['Kaski', 'Syangja', 'Parbat', 'Baglung', 'Myagdi'],
            'Chitwan': ['Makawanpur', 'Dhading', 'Gorkha', 'Tanahun', 'Nawalpur', 'Parsa'],
            'Jhapa': ['Morang', 'Ilam'],
            'Morang': ['Jhapa', 'Sunsari', 'Dhankuta'],
            'Sunsari': ['Morang', 'Saptari', 'Udayapur', 'Dhankuta'],
            'Banke': ['Bardiya', 'Dang', 'Salyan', 'Surkhet'],
            'Kailali': ['Kanchanpur', 'Bardiya', 'Doti', 'Achham']
        };

        const borders = borderMap[districtName] || [];
        return borders.map(name => this.getDistrict(name)).filter(Boolean);
    }

    /**
     * Get comprehensive district analytics
     * @param {string} districtName - Name of the district
     * @returns {Object} Comprehensive analytics about the district
     */
    getDistrictAnalytics(districtName) {
        const district = this.getDistrict(districtName);
        if (!district) return null;

        const province = this.getDistrictProvince(districtName);
        const borders = this.getBorderingDistricts(districtName);
        const coords = this.getMajorDistrictsWithCoordinates().find(d => d.name === districtName);
        const allDistricts = this.getDistricts();
        
        // Calculate rankings
        const sortedByPostOffices = allDistricts.sort((a, b) => b.postOfficeCount - a.postOfficeCount);
        const postOfficeRank = sortedByPostOffices.findIndex(d => d.name === districtName) + 1;
        
        return {
            ...district,
            province,
            coordinates: coords ? { lat: coords.lat, lng: coords.lng } : null,
            isCapital: coords?.isCapital || false,
            populationCategory: coords?.population || 'small',
            borderDistricts: borders.map(d => d.name),
            rankings: {
                postOfficeCount: postOfficeRank,
                totalDistricts: allDistricts.length
            },
            postalCodeRange: {
                min: Math.min(...district.postOffices.map(po => parseInt(po.postalCode))),
                max: Math.max(...district.postOffices.map(po => parseInt(po.postalCode)))
            },
            officeTypes: district.postOffices.reduce((acc, po) => {
                acc[po.type] = (acc[po.type] || 0) + 1;
                return acc;
            }, {})
        };
    }

    /**
     * Check if a postal code is valid
     * Quick validation without returning full details
     */
    isValidPostalCode(postalCode) {
        return this.postal.isValidPostalCode(postalCode);
    }

    /**
     * Get random district (useful for testing/demos)
     */
    getRandomDistrict() {
        const districts = this.getDistricts();
        return districts[Math.floor(Math.random() * districts.length)];
    }

    /**
     * Get districts with their postal code counts
     * Useful for understanding postal distribution
     */
    getDistrictsWithPostalCounts() {
        return this.districts.getAllDistricts().map(district => ({
            name: district.name,
            postalCodeCount: district.postOfficeCount,
            mainPostalCode: district.postOffices[0]?.postalCode || null
        }));
    }
}

// Make everything available for other developers to use
module.exports = NepalGeoHelper;
module.exports.NepalGeoHelper = NepalGeoHelper;
module.exports.DistrictUtils = DistrictUtils;
module.exports.PostalUtils = PostalUtils;
module.exports.LocationValidator = LocationValidator;
module.exports.GeoSearch = GeoSearch;

// Quick access functions for simple use cases
// These create a new instance each time, so use the class above for better performance
module.exports.getDistricts = () => new NepalGeoHelper().getDistricts();
module.exports.getDistrict = (name) => new NepalGeoHelper().getDistrict(name);
module.exports.getPostalInfo = (code) => new NepalGeoHelper().getPostalInfo(code);
module.exports.searchLocations = (query) => new NepalGeoHelper().searchLocations(query);
module.exports.validateAddress = (address) => new NepalGeoHelper().validateAddress(address);
