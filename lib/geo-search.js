/**
 * Smart search for Nepal locations
 * Finds districts, post offices, and postal codes with fuzzy matching
 */
class GeoSearch {
    constructor(geoData) {
        this.geoData = geoData;
    }

    /**
     * Search for places in Nepal by any query
     * Smart enough to detect postal codes, district names, or post offices
     * @param {string} query - What you're looking for
     * @param {Object} options - Search options (limit, relevance threshold, etc.)
     * @returns {Array<Object>} Array of search results with relevance scores
     */
    searchByQuery(query, options = {}) {
        if (!query || typeof query !== 'string') {
            return [];
        }

        const {
            limit = 10,
            minRelevance = 0.3,
            includeType = 'all', // 'all', 'district', 'postOffice'
            sortBy = 'relevance' // 'relevance', 'name', 'district'
        } = options;

        let results = [];

        // Auto-detect if query is a postal code
        if (/^\d{5}$/.test(query.trim())) {
            const postalResult = this.searchByPostalCode(query.trim());
            if (postalResult) {
                results.push({
                    type: 'postOffice',
                    name: postalResult.name,
                    district: postalResult.district,
                    postalCode: postalResult.postalCode,
                    relevance: 100,
                    matchType: 'exact_postal'
                });
            }
        }

        // Search districts and post offices
        const searchResults = this.geoData.search(query, includeType);
        
        searchResults.forEach(result => {
            if (result.relevance >= minRelevance) {
                results.push({
                    ...result,
                    matchType: this.determineMatchType(query, result)
                });
            }
        });

        // Remove duplicates and sort
        results = this.removeDuplicates(results);
        results = this.sortResults(results, sortBy);

        return results.slice(0, limit);
    }

    /**
     * Search districts specifically
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @returns {Array<Object>} Array of district search results
     */
    searchDistricts(query, options = {}) {
        const { limit = 5, includeStats = false } = options;

        const results = this.geoData.search(query, 'district');
        
        return results.slice(0, limit).map(result => {
            const district = this.geoData.getDistrictByName(result.name);
            const searchResult = {
                type: 'district',
                name: result.name,
                relevance: result.relevance,
                matchType: this.determineMatchType(query, result)
            };

            if (includeStats && district) {
                searchResult.stats = {
                    postOfficeCount: district.postOfficeCount,
                    hasMainOffice: district.postOffices.some(po => 
                        po.type === 'D.P.O.' || po.type === 'G.P.O.'
                    )
                };
            }

            return searchResult;
        });
    }

    /**
     * Search post offices specifically
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @returns {Array<Object>} Array of post office search results
     */
    searchPostOffices(query, options = {}) {
        const { 
            limit = 10, 
            district = null, 
            type = null,
            includeDetails = false 
        } = options;

        let results = this.geoData.search(query, 'postOffice');

        // Filter by district if specified
        if (district) {
            results = results.filter(result => 
                result.district && result.district.toLowerCase() === district.toLowerCase()
            );
        }

        // Filter by post office type if specified
        if (type) {
            const allPostOffices = this.geoData.getAllPostOffices();
            results = results.filter(result => {
                const po = allPostOffices.find(p => 
                    p.name === result.name && p.district === result.district
                );
                return po && po.type === type;
            });
        }

        return results.slice(0, limit).map(result => {
            const searchResult = {
                type: 'postOffice',
                name: result.name,
                district: result.district,
                postalCode: result.postalCode,
                relevance: result.relevance,
                matchType: this.determineMatchType(query, result)
            };

            if (includeDetails) {
                const allPostOffices = this.geoData.getAllPostOffices();
                const po = allPostOffices.find(p => 
                    p.name === result.name && p.district === result.district
                );
                if (po) {
                    searchResult.officeType = po.type;
                    searchResult.isMainOffice = po.type === 'D.P.O.' || po.type === 'G.P.O.';
                }
            }

            return searchResult;
        });
    }

    /**
     * Search by postal code
     * @param {string} postalCode - Postal code
     * @returns {Object|null} Post office information or null
     */
    searchByPostalCode(postalCode) {
        return this.geoData.getPostOfficeByCode(postalCode);
    }

    /**
     * Advanced search with multiple criteria
     * @param {Object} criteria - Search criteria
     * @returns {Array<Object>} Array of search results
     */
    advancedSearch(criteria) {
        const {
            query,
            district,
            postalCodeRange,
            postOfficeType,
            limit = 20
        } = criteria;

        let results = [];

        // Start with all post offices
        let postOffices = this.geoData.getAllPostOffices();

        // Apply filters
        if (district) {
            postOffices = postOffices.filter(po => 
                po.district.toLowerCase().includes(district.toLowerCase())
            );
        }

        if (postOfficeType) {
            postOffices = postOffices.filter(po => po.type === postOfficeType);
        }

        if (postalCodeRange && postalCodeRange.start && postalCodeRange.end) {
            const start = parseInt(postalCodeRange.start);
            const end = parseInt(postalCodeRange.end);
            postOffices = postOffices.filter(po => {
                const code = parseInt(po.postalCode);
                return code >= start && code <= end;
            });
        }

        // Apply text search if query provided
        if (query) {
            const normalizedQuery = query.toLowerCase();
            postOffices = postOffices.filter(po =>
                po.name.toLowerCase().includes(normalizedQuery) ||
                po.district.toLowerCase().includes(normalizedQuery) ||
                po.postalCode.includes(query)
            );
        }

        // Convert to search results format
        results = postOffices.map(po => ({
            type: 'postOffice',
            name: po.name,
            district: po.district,
            postalCode: po.postalCode,
            officeType: po.type,
            relevance: query ? this.geoData.calculateRelevance(po.name, query) : 100,
            matchType: 'advanced_search'
        }));

        // Sort by relevance
        results.sort((a, b) => b.relevance - a.relevance);

        return results.slice(0, limit);
    }

    /**
     * Get search suggestions as user types
     * @param {string} partialQuery - Partial search query
     * @param {Object} options - Options
     * @returns {Array<string>} Array of suggestions
     */
    getSuggestions(partialQuery, options = {}) {
        if (!partialQuery || partialQuery.length < 2) {
            return [];
        }

        const { limit = 5, type = 'all' } = options;
        const normalizedQuery = partialQuery.toLowerCase();
        const suggestions = new Set();

        // Get district suggestions
        if (type === 'all' || type === 'district') {
            this.geoData.getAllDistricts().forEach(district => {
                if (district.name.toLowerCase().startsWith(normalizedQuery)) {
                    suggestions.add(district.name);
                }
            });
        }

        // Get post office suggestions
        if (type === 'all' || type === 'postOffice') {
            this.geoData.getAllPostOffices().forEach(po => {
                if (po.name.toLowerCase().startsWith(normalizedQuery)) {
                    suggestions.add(po.name);
                }
            });
        }

        return Array.from(suggestions).slice(0, limit);
    }

    /**
     * Determine the type of match
     * @param {string} query - Original query
     * @param {Object} result - Search result
     * @returns {string} Match type
     */
    determineMatchType(query, result) {
        const normalizedQuery = query.toLowerCase();
        const normalizedName = result.name.toLowerCase();

        if (normalizedName === normalizedQuery) {
            return 'exact';
        } else if (normalizedName.startsWith(normalizedQuery)) {
            return 'prefix';
        } else if (normalizedName.includes(normalizedQuery)) {
            return 'contains';
        } else if (result.postalCode && result.postalCode.includes(query)) {
            return 'postal_code';
        } else {
            return 'fuzzy';
        }
    }

    /**
     * Remove duplicate results
     * @param {Array} results - Search results
     * @returns {Array} Deduplicated results
     */
    removeDuplicates(results) {
        const seen = new Set();
        return results.filter(result => {
            const key = `${result.type}-${result.name}-${result.district || ''}-${result.postalCode || ''}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    /**
     * Sort search results
     * @param {Array} results - Search results
     * @param {string} sortBy - Sort criteria
     * @returns {Array} Sorted results
     */
    sortResults(results, sortBy) {
        switch (sortBy) {
            case 'name':
                return results.sort((a, b) => a.name.localeCompare(b.name));
            
            case 'district':
                return results.sort((a, b) => {
                    const districtCompare = (a.district || '').localeCompare(b.district || '');
                    return districtCompare !== 0 ? districtCompare : a.name.localeCompare(b.name);
                });
            
            case 'relevance':
            default:
                return results.sort((a, b) => {
                    // First sort by match type priority
                    const matchTypePriority = {
                        'exact': 5,
                        'exact_postal': 5,
                        'prefix': 4,
                        'contains': 3,
                        'postal_code': 2,
                        'fuzzy': 1,
                        'advanced_search': 1
                    };
                    
                    const aPriority = matchTypePriority[a.matchType] || 0;
                    const bPriority = matchTypePriority[b.matchType] || 0;
                    
                    if (aPriority !== bPriority) {
                        return bPriority - aPriority;
                    }
                    
                    // Then by relevance score
                    return b.relevance - a.relevance;
                });
        }
    }

    /**
     * Export search results
     * @param {Array} results - Search results
     * @param {string} format - Export format
     * @returns {string} Formatted results
     */
    exportResults(results, format = 'json') {
        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(results, null, 2);
            
            case 'csv':
                let csv = 'Type,Name,District,Postal Code,Relevance,Match Type\n';
                results.forEach(result => {
                    csv += `"${result.type}","${result.name}","${result.district || ''}","${result.postalCode || ''}","${result.relevance}","${result.matchType}"\n`;
                });
                return csv;
            
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
}

module.exports = GeoSearch;
