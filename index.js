/**
 * Nepal Geo Helper - Making Nepal location data easy for developers
 * 
 * This package helps you work with Nepal's geographic data including districts,
 * postal codes, and addresses. Perfect for building forms, validation, and 
 * location-based features in your applications.
 * 
 * @author Rohan Poudel <yitsmerohan@gmail.com>
 * @version 1.0.0
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
