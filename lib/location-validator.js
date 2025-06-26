/**
 * Validates Nepal addresses and location data
 * Helps you check if districts exist, postal codes are valid, and more
 */
class LocationValidator {
    constructor(geoData) {
        this.geoData = geoData;
    }

    /**
     * Check if an address is valid
     * Validates districts, postal codes, and suggests corrections
     * @param {Object} address - Address object with district, postalCode, etc.
     * @returns {Object} Validation result with errors and suggestions
     */
    validateAddress(address) {
        const errors = [];
        const warnings = [];
        const suggestions = [];

        if (!address || typeof address !== 'object') {
            return {
                isValid: false,
                errors: ['Address must be a valid object'],
                warnings: [],
                suggestions: []
            };
        }

        // Validate district
        if (address.district) {
            const districtResult = this.validateDistrict(address.district);
            if (!districtResult.isValid) {
                errors.push(`Invalid district: ${address.district}`);
                if (districtResult.suggestions.length > 0) {
                    suggestions.push(`Did you mean: ${districtResult.suggestions.join(', ')}?`);
                }
            }
        } else {
            warnings.push('District not specified');
        }

        // Validate postal code
        if (address.postalCode) {
            const postalResult = this.validatePostalCode(address.postalCode);
            if (!postalResult.isValid) {
                errors.push(`Invalid postal code: ${address.postalCode}`);
            } else {
                // Cross-validate postal code with district
                if (address.district) {
                    const postalInfo = this.geoData.getPostOfficeByCode(address.postalCode);
                    if (postalInfo && postalInfo.district.toLowerCase() !== address.district.toLowerCase()) {
                        errors.push(`Postal code ${address.postalCode} does not belong to district ${address.district}`);
                        suggestions.push(`Postal code ${address.postalCode} belongs to ${postalInfo.district}`);
                    }
                }
            }
        }

        // Validate post office
        if (address.postOffice) {
            const postOfficeResult = this.validatePostOffice(address.postOffice, address.district);
            if (!postOfficeResult.isValid) {
                errors.push(`Invalid post office: ${address.postOffice}`);
                if (postOfficeResult.suggestions.length > 0) {
                    suggestions.push(`Similar post offices: ${postOfficeResult.suggestions.join(', ')}`);
                }
            }
        }

        // Validate ward number
        if (address.ward !== undefined) {
            if (!Number.isInteger(address.ward) || address.ward < 1 || address.ward > 35) {
                errors.push('Ward number must be an integer between 1 and 35');
            }
        }

        // Validate municipality (basic check)
        if (address.municipality) {
            if (typeof address.municipality !== 'string' || address.municipality.trim().length < 2) {
                errors.push('Municipality name must be a valid string');
            }
        }

        const isValid = errors.length === 0;

        return {
            isValid,
            errors,
            warnings,
            suggestions,
            completeness: this.calculateCompleteness(address),
            recommendation: this.getRecommendation(address, errors, warnings)
        };
    }

    /**
     * Validate district name
     * @param {string} district - District name
     * @returns {Object} Validation result
     */
    validateDistrict(district) {
        if (!district || typeof district !== 'string') {
            return {
                isValid: false,
                error: 'District name is required and must be a string',
                suggestions: []
            };
        }

        const districtData = this.geoData.getDistrictByName(district);
        
        if (districtData) {
            return {
                isValid: true,
                district: districtData,
                suggestions: []
            };
        }

        // Find similar districts
        const suggestions = this.findSimilarDistricts(district);

        return {
            isValid: false,
            error: `District '${district}' not found`,
            suggestions
        };
    }

    /**
     * Validate postal code
     * @param {string} postalCode - Postal code
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
        
        // Check format
        if (!/^\d{5}$/.test(trimmed)) {
            return {
                isValid: false,
                error: 'Nepal postal codes must be exactly 5 digits'
            };
        }

        // Check if exists
        const postalInfo = this.geoData.getPostOfficeByCode(trimmed);
        
        return {
            isValid: postalInfo !== null,
            error: postalInfo ? null : 'Postal code does not exist',
            postalInfo
        };
    }

    /**
     * Validate post office
     * @param {string} postOffice - Post office name
     * @param {string} district - District name (optional)
     * @returns {Object} Validation result
     */
    validatePostOffice(postOffice, district = null) {
        if (!postOffice || typeof postOffice !== 'string') {
            return {
                isValid: false,
                error: 'Post office name is required and must be a string',
                suggestions: []
            };
        }

        const allPostOffices = this.geoData.getAllPostOffices();
        let postOffices = allPostOffices;

        // Filter by district if provided
        if (district) {
            postOffices = allPostOffices.filter(po => 
                po.district.toLowerCase() === district.toLowerCase()
            );
        }

        // Find exact match
        const exactMatch = postOffices.find(po => 
            po.name.toLowerCase() === postOffice.toLowerCase()
        );

        if (exactMatch) {
            return {
                isValid: true,
                postOffice: exactMatch,
                suggestions: []
            };
        }

        // Find similar post offices
        const suggestions = this.findSimilarPostOffices(postOffice, postOffices);

        return {
            isValid: false,
            error: `Post office '${postOffice}' not found${district ? ` in ${district}` : ''}`,
            suggestions: suggestions.slice(0, 3).map(po => po.name)
        };
    }

    /**
     * Find similar districts using fuzzy matching
     * @param {string} input - Input district name
     * @returns {Array<string>} Array of similar district names
     */
    findSimilarDistricts(input) {
        const districts = this.geoData.getAllDistricts();
        const similarities = districts.map(district => ({
            name: district.name,
            similarity: this.calculateSimilarity(input.toLowerCase(), district.name.toLowerCase())
        }))
        .filter(item => item.similarity > 0.3)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3);

        return similarities.map(item => item.name);
    }

    /**
     * Find similar post offices using fuzzy matching
     * @param {string} input - Input post office name
     * @param {Array} postOffices - Array of post offices to search
     * @returns {Array<Object>} Array of similar post offices
     */
    findSimilarPostOffices(input, postOffices) {
        const similarities = postOffices.map(po => ({
            ...po,
            similarity: this.calculateSimilarity(input.toLowerCase(), po.name.toLowerCase())
        }))
        .filter(item => item.similarity > 0.3)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);

        return similarities;
    }

    /**
     * Calculate string similarity using Levenshtein distance
     * @param {string} str1 - First string
     * @param {string} str2 - Second string
     * @returns {number} Similarity score between 0 and 1
     */
    calculateSimilarity(str1, str2) {
        const len1 = str1.length;
        const len2 = str2.length;
        const matrix = [];

        // Create matrix
        for (let i = 0; i <= len2; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= len1; j++) {
            matrix[0][j] = j;
        }

        // Calculate distances
        for (let i = 1; i <= len2; i++) {
            for (let j = 1; j <= len1; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // deletion
                    );
                }
            }
        }

        const maxLength = Math.max(len1, len2);
        return maxLength === 0 ? 1 : (maxLength - matrix[len2][len1]) / maxLength;
    }

    /**
     * Calculate address completeness score
     * @param {Object} address - Address object
     * @returns {Object} Completeness information
     */
    calculateCompleteness(address) {
        const fields = ['district', 'municipality', 'ward', 'postOffice', 'postalCode'];
        const weights = { district: 0.3, municipality: 0.2, ward: 0.2, postOffice: 0.15, postalCode: 0.15 };
        
        let score = 0;
        const missing = [];
        const present = [];

        fields.forEach(field => {
            if (address[field] !== undefined && address[field] !== null && address[field] !== '') {
                score += weights[field];
                present.push(field);
            } else {
                missing.push(field);
            }
        });

        return {
            score: Math.round(score * 100),
            percentage: `${Math.round(score * 100)}%`,
            present,
            missing,
            isComplete: score >= 0.8
        };
    }

    /**
     * Get address improvement recommendations
     * @param {Object} address - Address object
     * @param {Array} errors - Validation errors
     * @param {Array} warnings - Validation warnings
     * @returns {Array<string>} Array of recommendations
     */
    getRecommendation(address, errors, warnings) {
        const recommendations = [];

        if (errors.length > 0) {
            recommendations.push('Fix validation errors before using this address');
        }

        if (!address.district) {
            recommendations.push('Add district name for better address identification');
        }

        if (!address.postalCode) {
            recommendations.push('Include postal code for accurate mail delivery');
        }

        if (!address.municipality && !address.postOffice) {
            recommendations.push('Add municipality or post office for precise location');
        }

        if (!address.ward) {
            recommendations.push('Include ward number for local administrative purposes');
        }

        if (warnings.length > 0 && errors.length === 0) {
            recommendations.push('Address is valid but could be more complete');
        }

        if (recommendations.length === 0) {
            recommendations.push('Address is complete and valid');
        }

        return recommendations;
    }

    /**
     * Batch validate multiple addresses
     * @param {Array<Object>} addresses - Array of address objects
     * @returns {Array<Object>} Array of validation results
     */
    batchValidate(addresses) {
        if (!Array.isArray(addresses)) {
            throw new Error('Addresses must be an array');
        }

        return addresses.map((address, index) => ({
            index,
            address,
            validation: this.validateAddress(address)
        }));
    }
}

module.exports = LocationValidator;
