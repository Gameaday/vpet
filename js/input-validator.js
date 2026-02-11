/**
 * Input Validation Module
 * Provides comprehensive input validation for security and UX
 */

class InputValidator {
    /**
     * Validate pet name
     * @param {string} name - Pet name to validate
     * @returns {object} {valid: boolean, sanitized: string, error: string}
     */
    static validatePetName(name) {
        if (!name || typeof name !== 'string') {
            return {
                valid: false,
                sanitized: '',
                error: 'Pet name is required'
            };
        }

        // Trim whitespace
        name = name.trim();

        // Check length
        if (name.length === 0) {
            return {
                valid: false,
                sanitized: '',
                error: 'Pet name cannot be empty'
            };
        }

        if (name.length > 50) {
            return {
                valid: false,
                sanitized: name.substring(0, 50),
                error: 'Pet name is too long (max 50 characters)'
            };
        }

        if (name.length < 2) {
            return {
                valid: false,
                sanitized: name,
                error: 'Pet name is too short (min 2 characters)'
            };
        }

        // Sanitize HTML entities and dangerous characters
        const sanitized = name
            .replace(/[<>]/g, '') // Remove angle brackets
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();

        // Check if sanitization removed too much
        if (sanitized.length < 2) {
            return {
                valid: false,
                sanitized: sanitized,
                error: 'Pet name contains invalid characters'
            };
        }

        // Check for profanity (basic filter)
        const profanityList = ['fuck', 'shit', 'damn', 'bitch', 'ass', 'crap'];
        const lowerName = sanitized.toLowerCase();
        const containsProfanity = profanityList.some(word => lowerName.includes(word));

        if (containsProfanity) {
            return {
                valid: false,
                sanitized: sanitized,
                error: 'Pet name contains inappropriate language'
            };
        }

        return {
            valid: true,
            sanitized: sanitized,
            error: null
        };
    }

    /**
     * Validate server URL
     * @param {string} url - Server URL to validate
     * @returns {object} {valid: boolean, sanitized: string, error: string}
     */
    static validateServerUrl(url) {
        if (!url || typeof url !== 'string') {
            return {
                valid: false,
                sanitized: '',
                error: 'Server URL is required'
            };
        }

        url = url.trim();

        // Check protocol
        if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
            return {
                valid: false,
                sanitized: url,
                error: 'Server URL must start with ws:// or wss://'
            };
        }

        // Basic URL validation
        try {
            new URL(url);
        } catch (e) {
            return {
                valid: false,
                sanitized: url,
                error: 'Invalid server URL format'
            };
        }

        return {
            valid: true,
            sanitized: url,
            error: null
        };
    }

    /**
     * Validate numeric input
     * @param {any} value - Value to validate
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {object} {valid: boolean, value: number, error: string}
     */
    static validateNumber(value, min = 0, max = 100) {
        const num = Number(value);

        if (isNaN(num)) {
            return {
                valid: false,
                value: min,
                error: 'Must be a valid number'
            };
        }

        if (num < min || num > max) {
            return {
                valid: false,
                value: Math.max(min, Math.min(max, num)),
                error: `Must be between ${min} and ${max}`
            };
        }

        return {
            valid: true,
            value: num,
            error: null
        };
    }

    /**
     * Sanitize text input for display
     * @param {string} text - Text to sanitize
     * @returns {string} Sanitized text
     */
    static sanitizeText(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        return text
            .replace(/[<>]/g, '') // Remove angle brackets
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();
    }

    /**
     * Validate email (for future features)
     * @param {string} email - Email to validate
     * @returns {object} {valid: boolean, sanitized: string, error: string}
     */
    static validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return {
                valid: false,
                sanitized: '',
                error: 'Email is required'
            };
        }

        email = email.trim().toLowerCase();

        // Basic email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return {
                valid: false,
                sanitized: email,
                error: 'Invalid email format'
            };
        }

        if (email.length > 254) { // RFC 5321
            return {
                valid: false,
                sanitized: email.substring(0, 254),
                error: 'Email is too long'
            };
        }

        return {
            valid: true,
            sanitized: email,
            error: null
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputValidator;
}
