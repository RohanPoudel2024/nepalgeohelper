class PostalUtils {
    constructor(geoData) {
        this.geoData = geoData;
    }

    /**
     * Look up details about a postal code
     * Give it a 5-digit postal code and get back the post office info
     * @param {string} postalCode - Postal/PIN code (like "44600")
     * @returns {Object|null} Postal code information or null if not found
     */
    getPostalInfo(postalCode) {
        if (!postalCode || typeof postalCode !== 'string') {
            return null;
        }

        const postOffice = this.geoData.getPostOfficeByCode(postalCode.trim());
        if (!postOffice) {
            return null;
        }

        return {
            postalCode: postOffice.postalCode,
            postOffice: postOffice.name,
            district: postOffice.district,
            type: postOffice.type,
            isMainOffice: postOffice.type === 'D.P.O.' || postOffice.type === 'G.P.O.'
        };
    }

    /**
     * Get all post offices in a district
     * @param {string} district - District name
     * @returns {Array<Object>} Array of post offices
     */
    getPostOfficesByDistrict(district) {
        if (!district || typeof district !== 'string') {
            return [];
        }

        const districtData = this.geoData.getDistrictByName(district);
        return districtData ? districtData.postOffices : [];
    }

    /**
     * Get total number of post offices
     * @returns {number} Total post offices count
     */
    getTotalPostOffices() {
        return this.geoData.getStatistics().totalPostOffices;
    }

    /**
     * Get average post offices per district
     * @returns {number} Average post offices per district
     */
    getAveragePostOfficesPerDistrict() {
        return this.geoData.getStatistics().averagePostOfficesPerDistrict;
    }

    /**
     * Search postal codes by query
     * @param {string} query - Search query
     * @returns {Array<Object>} Array of matching post offices
     */
    searchPostalCodes(query) {
        if (!query || typeof query !== 'string') {
            return [];
        }

        const results = this.geoData.search(query, 'postOffice');
        return results.map(result => ({
            name: result.name,
            district: result.district,
            postalCode: result.postalCode,
            relevance: result.relevance
        }));
    }

    /**
     * Validate postal code format
     * @param {string} postalCode - Postal code to validate
     * @returns {Object} Validation result
     */
    validatePostalCode(postalCode) {
        if (!postalCode || typeof postalCode !== 'string') {
            return {
                isValid: false,
                error: 'Postal code is required and must be a string'
            };
        }

        const trimmed = postalCode.trim();
        
        // Nepal postal codes are typically 5 digits
        if (!/^\d{5}$/.test(trimmed)) {
            return {
                isValid: false,
                error: 'Nepal postal codes must be exactly 5 digits'
            };
        }

        const exists = this.getPostalInfo(trimmed) !== null;
        
        return {
            isValid: exists,
            error: exists ? null : 'Postal code does not exist in Nepal',
            postalCode: trimmed
        };
    }

    /**
     * Get post offices by type
     * @param {string} type - Post office type
     * @returns {Array<Object>} Array of post offices of specified type
     */
    getPostOfficesByType(type) {
        if (!type || typeof type !== 'string') {
            return [];
        }

        return this.geoData.getAllPostOffices().filter(po => po.type === type);
    }

    /**
     * Get main post offices (D.P.O. and G.P.O.)
     * @returns {Array<Object>} Array of main post offices
     */
    getMainPostOffices() {
        return this.geoData.getAllPostOffices().filter(po => 
            po.type === 'D.P.O.' || po.type === 'G.P.O.'
        );
    }

    /**
     * Get postal code statistics
     * @returns {Object} Statistics about postal codes
     */
    getPostalStatistics() {
        const allPostOffices = this.geoData.getAllPostOffices();
        const typeCount = {};
        const codeRanges = {};

        allPostOffices.forEach(po => {
            // Count by type
            typeCount[po.type] = (typeCount[po.type] || 0) + 1;

            // Group by code prefix (first 2 digits)
            const prefix = po.postalCode.substring(0, 2);
            if (!codeRanges[prefix]) {
                codeRanges[prefix] = {
                    count: 0,
                    districts: new Set()
                };
            }
            codeRanges[prefix].count++;
            codeRanges[prefix].districts.add(po.district);
        });

        // Convert districts sets to arrays
        Object.keys(codeRanges).forEach(prefix => {
            codeRanges[prefix].districts = Array.from(codeRanges[prefix].districts);
        });

        return {
            totalPostOffices: allPostOffices.length,
            postOfficeTypes: typeCount,
            codeRanges: codeRanges,
            uniqueDistricts: [...new Set(allPostOffices.map(po => po.district))].length
        };
    }

    /**
     * Get postal codes in range
     * @param {string} startCode - Start postal code
     * @param {string} endCode - End postal code
     * @returns {Array<Object>} Array of post offices in range
     */
    getPostalCodesInRange(startCode, endCode) {
        if (!startCode || !endCode) {
            return [];
        }

        const start = parseInt(startCode);
        const end = parseInt(endCode);

        if (isNaN(start) || isNaN(end) || start > end) {
            return [];
        }

        return this.geoData.getAllPostOffices().filter(po => {
            const code = parseInt(po.postalCode);
            return code >= start && code <= end;
        });
    }

    /**
     * Find nearest postal codes (by numeric value)
     * @param {string} postalCode - Reference postal code
     * @param {number} limit - Number of nearest codes to return (default: 5)
     * @returns {Array<Object>} Array of nearest post offices
     */
    getNearestPostalCodes(postalCode, limit = 5) {
        if (!postalCode) {
            return [];
        }

        const refCode = parseInt(postalCode);
        if (isNaN(refCode)) {
            return [];
        }

        const allPostOffices = this.geoData.getAllPostOffices();
        
        return allPostOffices
            .map(po => ({
                ...po,
                distance: Math.abs(parseInt(po.postalCode) - refCode)
            }))
            .filter(po => po.distance > 0) // Exclude the reference code itself
            .sort((a, b) => a.distance - b.distance)
            .slice(0, limit);
    }

    /**
     * Export postal data to various formats
     * @param {string} format - Export format ('json', 'csv')
     * @param {Object} options - Export options
     * @returns {string} Formatted data
     */
    exportData(format = 'json', options = {}) {
        const { district, type } = options;
        let postOffices = this.geoData.getAllPostOffices();

        // Apply filters
        if (district) {
            postOffices = postOffices.filter(po => 
                po.district.toLowerCase() === district.toLowerCase()
            );
        }

        if (type) {
            postOffices = postOffices.filter(po => po.type === type);
        }

        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(postOffices, null, 2);
            
            case 'csv':
                let csv = 'Post Office,Postal Code,District,Type\n';
                postOffices.forEach(po => {
                    csv += `"${po.name}","${po.postalCode}","${po.district}","${po.type}"\n`;
                });
                return csv;
            
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    /**
     * Get all postal codes as an array
     * @returns {Array<string>} Array of all postal codes
     */
    getAllPostalCodes() {
        return this.geoData.getAllPostOffices().map(po => po.postalCode);
    }

    /**
     * Check if postal code is valid (simple boolean check)
     * @param {string} postalCode - Postal code to validate
     * @returns {boolean} True if valid
     */
    isValidPostalCode(postalCode) {
        return this.validatePostalCode(postalCode).isValid;
    }
}

module.exports = PostalUtils;
