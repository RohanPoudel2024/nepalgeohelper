const fs = require('fs');
const path = require('path');

class NepalGeoData {
    constructor() {
        this.data = null;
        this.districts = null;
        this.postOffices = null;
        this.loadData();
    }

    /**
     * Load the postal data from our JSON file
     * This runs automatically when you create a new instance
     */
    loadData() {
        try {
            const dataPath = path.join(__dirname, '../data/postal-data.json');
            
            // If JSON file doesn't exist, create it from CSV
            if (!fs.existsSync(dataPath)) {
                this.createDataFromCSV();
            }
            
            const rawData = fs.readFileSync(dataPath, 'utf8');
            this.data = JSON.parse(rawData);
            this.processData();
        } catch (error) {
            // Fallback to CSV if JSON fails
            this.createDataFromCSV();
        }
    }

    /**
     * Create JSON data from CSV source
     */
    createDataFromCSV() {
        try {
            const csvPath = path.join(__dirname, '../npm.txt');
            const csvData = fs.readFileSync(csvPath, 'utf8');
            const parsedData = this.parseCSV(csvData);
            
            const jsonData = {
                postal_data: parsedData,
                metadata: {
                    totalRecords: parsedData.length,
                    lastUpdated: new Date().toISOString(),
                    source: 'Nepal Postal Service'
                }
            };
            
            // Save to JSON file
            const dataPath = path.join(__dirname, '../data/postal-data.json');
            fs.writeFileSync(dataPath, JSON.stringify(jsonData, null, 2));
            
            this.data = jsonData;
            this.processData();
        } catch (error) {
            throw new Error('Failed to load Nepal geo data: ' + error.message);
        }
    }

    /**
     * Parse CSV data
     */
    parseCSV(csvData) {
        const lines = csvData.trim().split('\n');
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const fields = this.parseCSVLine(lines[i]);
            
            if (fields.length >= 4) {
                data.push({
                    District: fields[0],
                    'Post Office': fields[1],
                    'Postal/Pin Code': fields[2],
                    'Post Office Type': fields[3]
                });
            }
        }
        
        return data;
    }

    /**
     * Parse a single CSV line handling quoted fields
     */
    parseCSVLine(line) {
        const fields = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                fields.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        fields.push(current.trim());
        
        return fields;
    }

    /**
     * Process raw data into useful structures
     */
    processData() {
        if (!this.data || !this.data.postal_data) {
            throw new Error('Invalid postal data structure');
        }

        // Group by districts
        this.districts = {};
        this.postOffices = [];

        this.data.postal_data.forEach(entry => {
            // Normalize district name to fix inconsistencies in the data
            const originalDistrict = entry.District;
            const district = this.normalizeDistrictName(originalDistrict);
            
            const postOffice = {
                name: entry['Post Office'],
                postalCode: entry['Postal/Pin Code'],
                type: entry['Post Office Type'],
                district: district
            };

            this.postOffices.push(postOffice);

            if (!this.districts[district]) {
                this.districts[district] = {
                    name: district,
                    postOfficeCount: 0,
                    postOffices: []
                };
            }

            this.districts[district].postOfficeCount++;
            this.districts[district].postOffices.push(postOffice);
        });
    }

    /**
     * Normalizing district names to fix common inconsistencies in the data
     */
    normalizeDistrictName(district) {
        const normalized = district.trim();
        
        // Fix known inconsistencies in the postal data
        const corrections = {
            'Chitawan': 'Chitwan',
            'Kaverpalanchok': 'Kavrepalanchok',
            'Makabanpur': 'Makawanpur',
            'Taplajung': 'Taplejung',
            'Kailal': 'Kailali',  
            'Syanja': 'Syangja'   
        };
        
        return corrections[normalized] || normalized;
    }

    /**
     * Get all districts data
     */
    getAllDistricts() {
        return Object.values(this.districts);
    }

    /**
     * Get district by name
     */
    getDistrictByName(name) {
        const normalizedName = name.toLowerCase().trim();
        const districtKey = Object.keys(this.districts).find(
            key => key.toLowerCase() === normalizedName
        );
        return districtKey ? this.districts[districtKey] : null;
    }

    /**
     * Get all post offices
     */
    getAllPostOffices() {
        return this.postOffices;
    }

    /**
     * Get post office by postal code
     */
    getPostOfficeByCode(postalCode) {
        return this.postOffices.find(po => po.postalCode === postalCode);
    }

    /**
     * Search functionality with enhanced fuzzy matching
     */
    search(query, type = 'all') {
        const normalizedQuery = query.toLowerCase().trim();
        const results = [];

        if (type === 'all' || type === 'district') {
            Object.values(this.districts).forEach(district => {
                const relevance = this.calculateRelevance(district.name, normalizedQuery);
                if (relevance > 0) {
                    results.push({
                        type: 'district',
                        name: district.name,
                        relevance: relevance
                    });
                }
            });
        }

        if (type === 'all' || type === 'postOffice') {
            this.postOffices.forEach(po => {
                const nameRelevance = this.calculateRelevance(po.name, normalizedQuery);
                const postalRelevance = po.postalCode.includes(query) ? 90 : 0;
                const maxRelevance = Math.max(nameRelevance, postalRelevance);
                
                if (maxRelevance > 0) {
                    results.push({
                        type: 'postOffice',
                        name: po.name,
                        district: po.district,
                        postalCode: po.postalCode,
                        relevance: maxRelevance
                    });
                }
            });
        }

        return results
            .filter(r => r.relevance > 20) // Lower threshold for fuzzy matches
            .sort((a, b) => b.relevance - a.relevance);
    }

    /**
     * Calculate search relevance score with fuzzy matching
     */
    calculateRelevance(text, query) {
        const normalizedText = text.toLowerCase();
        const normalizedQuery = query.toLowerCase();
        
        // Exact match
        if (normalizedText === normalizedQuery) return 100;
        
        // Starts with query
        if (normalizedText.startsWith(normalizedQuery)) return 80;
        
        // Contains query
        if (normalizedText.includes(normalizedQuery)) return 60;
        
        // Fuzzy abbreviation matching (like "ktm" -> "Kathmandu")
        const fuzzyScore = this.calculateFuzzyScore(normalizedText, normalizedQuery);
        if (fuzzyScore > 0) return fuzzyScore;
        
        // Calculate partial match score
        let score = 0;
        const queryWords = normalizedQuery.split(' ');
        queryWords.forEach(word => {
            if (normalizedText.includes(word)) {
                score += 20;
            }
        });
        
        return score;
    }

    /**
     * Calculate fuzzy matching score for abbreviations and typos
     */
    calculateFuzzyScore(text, query) {
        // Handle common abbreviations
        const abbreviations = {
            'ktm': 'kathmandu',
            'pok': 'pokhara',
            'pokhra': 'pokhara',
            'lalitpurr': 'lalitpur',
            'bhkt': 'bhaktapur',
            'bkt': 'bhaktapur',
            'chitawan': 'chitwan',
            'chit': 'chitwan'
        };
        
        // Check if query is a known abbreviation
        if (abbreviations[query] && text.includes(abbreviations[query])) {
            return 75;
        }
        
        // Check if text contains the full form of query
        for (const [abbrev, full] of Object.entries(abbreviations)) {
            if (query === full && text.includes(abbrev)) {
                return 75;
            }
        }
        
        // Acronym matching (first letters)
        if (query.length >= 2 && query.length <= 4) {
            const words = text.split(/[\s-]/);
            if (words.length >= query.length) {
                const acronym = words.slice(0, query.length).map(w => w.charAt(0)).join('');
                if (acronym === query) {
                    return 70;
                }
            }
        }
        
        // Levenshtein distance for typos
        const distance = this.levenshteinDistance(text, query);
        const maxLength = Math.max(text.length, query.length);
        const similarity = 1 - (distance / maxLength);
        
        if (similarity > 0.6) {
            return Math.round(similarity * 50);
        }
        
        return 0;
    }

    /**
     * Calculate Levenshtein distance between two strings
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    /**
     * Get statistics
     */
    getStatistics() {
        return {
            totalDistricts: Object.keys(this.districts).length,
            totalPostOffices: this.postOffices.length,
            averagePostOfficesPerDistrict: Math.round(
                (this.postOffices.length / Object.keys(this.districts).length) * 100
            ) / 100
        };
    }
}

module.exports = NepalGeoData;
