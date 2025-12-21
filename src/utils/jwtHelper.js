// utils/jwtHelper.js
import { jwtDecode } from 'jwt-decode';

/**
 * Decode a JWT token
 * @param {string} token - The JWT token to decode
 * @returns {object|null} The decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

/**
 * Get all claims from a JWT token
 * @param {string} token - The JWT token
 * @returns {object|null} Object containing all token claims
 */
export const getTokenClaims = (token) => {
    const decoded = decodeToken(token);
    if (!decoded) return null;

    return {
        email: decoded.email,
        changePassword: decoded['change password'] || decoded.changePassword, // Handle both formats
        role: decoded.role,
        userId: decoded.userId,
        subject: decoded.sub,
        issuedAt: decoded.iat,
        expiresAt: decoded.exp
    };
};

/**
 * Check if a token is expired
 * @param {string} token - The JWT token
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token) => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Date.now() / 1000; // Current time in seconds
    return decoded.exp < currentTime;
};

/**
 * Get time until token expiration in milliseconds
 * @param {string} token - The JWT token
 * @returns {number} Time until expiration in milliseconds, 0 if expired or invalid
 */
export const getTimeUntilExpiration = (token) => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return 0;

    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeLeft = expirationTime - currentTime;

    return Math.max(0, timeLeft);
};

/**
 * Check if token is expiring soon (within specified minutes)
 * @param {string} token - The JWT token
 * @param {number} minutes - Number of minutes threshold (default: 5)
 * @returns {boolean} True if token expires within the specified minutes
 */
export const isTokenExpiringSoon = (token, minutes = 5) => {
    const timeLeft = getTimeUntilExpiration(token);
    const threshold = minutes * 60 * 1000; // Convert minutes to milliseconds

    return timeLeft > 0 && timeLeft < threshold;
};

/**
 * Get a specific claim from token
 * @param {string} token - The JWT token
 * @param {string} claimName - Name of the claim to retrieve
 * @returns {any} The claim value or null if not found
 */
export const getTokenClaim = (token, claimName) => {
    const decoded = decodeToken(token);
    if (!decoded) return null;

    return decoded[claimName] || null;
};

/**
 * Get token expiration date
 * @param {string} token - The JWT token
 * @returns {Date|null} Expiration date or null if invalid
 */
export const getTokenExpirationDate = (token) => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return null;

    return new Date(decoded.exp * 1000);
};

/**
 * Format time remaining until expiration
 * @param {string} token - The JWT token
 * @returns {string} Formatted string like "5 minutes" or "2 hours"
 */
export const getFormattedTimeUntilExpiration = (token) => {
    const timeLeft = getTimeUntilExpiration(token);

    if (timeLeft <= 0) return 'Expired';

    const seconds = Math.floor(timeLeft / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    return `${seconds} second${seconds > 1 ? 's' : ''}`;
};
