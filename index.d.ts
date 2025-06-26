// Type definitions for nepalgeohelper
// Project: https://github.com/RohanPoudel2024/nepalgeohelper
// Definitions by: Rohan Poudel <yitsmerohan@gmail.com>

export interface District {
    name: string;
    postOfficeCount: number;
    postOffices: PostOffice[];
}

export interface PostOffice {
    name: string;
    postalCode: string;
    type: 'D.P.O.' | 'A.P.O.' | 'F.W.R.P.D.' | 'G.P.O.' | 'W.R.P.D.' | 'E.R.P.D.' | 'M.W.R.P.D.';
    district: string;
}

export interface PostalInfo {
    postalCode: string;
    postOffice: string;
    district: string;
    type: string;
}

export interface Address {
    district?: string;
    postOffice?: string;
    postalCode?: string;
    municipality?: string;
    ward?: number;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    suggestions?: string[];
}

export interface Statistics {
    totalDistricts: number;
    totalPostOffices: number;
    averagePostOfficesPerDistrict: number;
}

export interface SearchResult {
    type: 'district' | 'postOffice';
    name: string;
    district?: string;
    postalCode?: string;
    relevance: number;
}

export declare class DistrictUtils {
    getAllDistricts(): District[];
    getDistrictByName(name: string): District | null;
    getTotalDistricts(): number;
    getDistrictNames(): string[];
    searchDistricts(query: string): District[];
}

export declare class PostalUtils {
    getPostalInfo(postalCode: string): PostalInfo | null;
    getPostOfficesByDistrict(district: string): PostOffice[];
    getTotalPostOffices(): number;
    getAveragePostOfficesPerDistrict(): number;
    searchPostalCodes(query: string): PostOffice[];
}

export declare class LocationValidator {
    validateAddress(address: Address): ValidationResult;
    validateDistrict(district: string): boolean;
    validatePostalCode(postalCode: string): boolean;
    validatePostOffice(postOffice: string, district?: string): boolean;
}

export declare class GeoSearch {
    searchByQuery(query: string): SearchResult[];
    searchDistricts(query: string): SearchResult[];
    searchPostOffices(query: string): SearchResult[];
}

export declare class NepalGeoHelper {
    constructor();
    
    getDistricts(): District[];
    getDistrict(name: string): District | null;
    getPostalInfo(postalCode: string): PostalInfo | null;
    searchLocations(query: string): SearchResult[];
    validateAddress(address: Address): ValidationResult;
    getStatistics(): Statistics;
    
    districts: DistrictUtils;
    postal: PostalUtils;
    validator: LocationValidator;
    search: GeoSearch;
}

// Static methods
export declare function getDistricts(): District[];
export declare function getDistrict(name: string): District | null;
export declare function getPostalInfo(code: string): PostalInfo | null;
export declare function searchLocations(query: string): SearchResult[];
export declare function validateAddress(address: Address): ValidationResult;

declare const nepalgeohelper: NepalGeoHelper;
export = nepalgeohelper;
