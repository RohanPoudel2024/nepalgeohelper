class DistrictUtils {
    constructor(geoData) {
        this.geoData = geoData;
    }

    /**
     * Get all districts in Nepal
     * Returns info about each district including their post offices
     * @returns {Array<Object>} Array of district objects
     */
    getAllDistricts() {
        return this.geoData.getAllDistricts();
    }

    /**
     * Find a district by its name (case-insensitive)
     * Works with partial matches too - 'kath' will find 'Kathmandu'
     * @param {string} name - District name to search for
     * @returns {Object|null} District object or null if not found
     */
    getDistrictByName(name) {
        if (!name || typeof name !== 'string') {
            return null;
        }
        return this.geoData.getDistrictByName(name);
    }

    /**
     * Get total number of districts
     * @returns {number} Total districts count
     */
    getTotalDistricts() {
        return this.geoData.getStatistics().totalDistricts;
    }

    /**
     * Get array of district names
     * @returns {Array<string>} Array of district names
     */
    getDistrictNames() {
        return this.getAllDistricts().map(district => district.name).sort();
    }

    /**
     * Search districts by query
     * @param {string} query - Search query
     * @returns {Array<Object>} Array of matching districts
     */
    searchDistricts(query) {
        if (!query || typeof query !== 'string') {
            return [];
        }

        const results = this.geoData.search(query, 'district');
        return results.map(result => this.getDistrictByName(result.name)).filter(Boolean);
    }

    /**
     * Get districts with most post offices
     * @param {number} limit - Number of districts to return (default: 5)
     * @returns {Array<Object>} Array of districts sorted by post office count
     */
    getDistrictsWithMostPostOffices(limit = 5) {
        return this.getAllDistricts()
            .sort((a, b) => b.postOfficeCount - a.postOfficeCount)
            .slice(0, limit);
    }

    /**
     * Get districts with least post offices
     * @param {number} limit - Number of districts to return (default: 5)
     * @returns {Array<Object>} Array of districts sorted by post office count (ascending)
     */
    getDistrictsWithLeastPostOffices(limit = 5) {
        return this.getAllDistricts()
            .sort((a, b) => a.postOfficeCount - b.postOfficeCount)
            .slice(0, limit);
    }

    /**
     * Check if district exists
     * @param {string} name - District name
     * @returns {boolean} True if district exists
     */
    exists(name) {
        return this.getDistrictByName(name) !== null;
    }

    /**
     * Get district statistics
     * @param {string} districtName - District name
     * @returns {Object|null} District statistics or null if not found
     */
    getDistrictStats(districtName) {
        const district = this.getDistrictByName(districtName);
        if (!district) {
            return null;
        }

        const postOfficeTypes = {};
        district.postOffices.forEach(po => {
            postOfficeTypes[po.type] = (postOfficeTypes[po.type] || 0) + 1;
        });

        return {
            name: district.name,
            totalPostOffices: district.postOfficeCount,
            postOfficeTypes: postOfficeTypes,
            hasMainPostOffice: district.postOffices.some(po => po.type === 'D.P.O.' || po.type === 'G.P.O.'),
            postalCodeRange: this.getPostalCodeRange(district)
        };
    }

    /**
     * Get postal code range for a district
     * @param {Object} district - District object
     * @returns {Object} Postal code range
     */
    getPostalCodeRange(district) {
        const codes = district.postOffices
            .map(po => parseInt(po.postalCode))
            .filter(code => !isNaN(code))
            .sort((a, b) => a - b);

        return {
            min: codes[0] || null,
            max: codes[codes.length - 1] || null,
            count: codes.length
        };
    }

    /**
     * Get districts by post office type
     * @param {string} type - Post office type (e.g., 'D.P.O.', 'A.P.O.')
     * @returns {Array<Object>} Array of districts with specified post office type
     */
    getDistrictsByPostOfficeType(type) {
        return this.getAllDistricts().filter(district =>
            district.postOffices.some(po => po.type === type)
        );
    }

    /**
     * Get neighboring districts (placeholder - would need geographic data)
     * @param {string} districtName - District name
     * @returns {Array<string>} Array of neighboring district names
     */
    getNeighboringDistricts(districtName) {
        // This would require geographic boundary data
        // For now, return empty array with note
        console.warn('Neighboring districts feature requires geographic boundary data');
        return [];
    }

    /**
     * Export district data to various formats
     * @param {string} format - Export format ('json', 'csv')
     * @returns {string} Formatted data
     */
    exportData(format = 'json') {
        const districts = this.getAllDistricts();

        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(districts, null, 2);
            
            case 'csv':
                let csv = 'District Name,Post Office Count,Main Post Office Type\n';
                districts.forEach(district => {
                    const mainPO = district.postOffices.find(po => 
                        po.type === 'D.P.O.' || po.type === 'G.P.O.'
                    ) || district.postOffices[0];
                    
                    csv += `"${district.name}",${district.postOfficeCount},"${mainPO.type}"\n`;
                });
                return csv;
            
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
}

module.exports = DistrictUtils;
