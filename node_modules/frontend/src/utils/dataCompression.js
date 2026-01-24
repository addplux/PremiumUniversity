/**
 * Data compression utilities for reducing bandwidth usage
 */

/**
 * Compress JSON data before sending to server
 * @param {object} data - Data to compress
 * @returns {string} - Compressed data
 */
export const compressData = (data) => {
    try {
        const jsonString = JSON.stringify(data);

        // Simple compression: remove whitespace and use shorter keys
        const compressed = jsonString
            .replace(/\s+/g, '') // Remove whitespace
            .replace(/"([^"]+)":/g, (match, key) => {
                // Shorten common keys
                const keyMap = {
                    'organizationId': 'oid',
                    'studentId': 'sid',
                    'courseId': 'cid',
                    'assignmentId': 'aid',
                    'timestamp': 'ts',
                    'createdAt': 'ca',
                    'updatedAt': 'ua'
                };
                return `"${keyMap[key] || key}":`;
            });

        return compressed;
    } catch (error) {
        console.error('Compression error:', error);
        return JSON.stringify(data);
    }
};

/**
 * Decompress data received from server
 * @param {string} compressed - Compressed data
 * @returns {object} - Decompressed data
 */
export const decompressData = (compressed) => {
    try {
        // Reverse the key mapping
        const decompressed = compressed.replace(/"([^"]+)":/g, (match, key) => {
            const reverseKeyMap = {
                'oid': 'organizationId',
                'sid': 'studentId',
                'cid': 'courseId',
                'aid': 'assignmentId',
                'ts': 'timestamp',
                'ca': 'createdAt',
                'ua': 'updatedAt'
            };
            return `"${reverseKeyMap[key] || key}":`;
        });

        return JSON.parse(decompressed);
    } catch (error) {
        console.error('Decompression error:', error);
        return JSON.parse(compressed);
    }
};

/**
 * Optimize image for low bandwidth
 * @param {string} imageUrl - Original image URL
 * @param {object} options - Optimization options
 * @returns {string} - Optimized image URL
 */
export const optimizeImage = (imageUrl, options = {}) => {
    const {
        width = 800,
        quality = 75,
        format = 'webp'
    } = options;

    // If using a CDN or image optimization service
    // Example: Cloudinary, imgix, etc.
    if (imageUrl.includes('cloudinary.com')) {
        return imageUrl.replace('/upload/', `/upload/w_${width},q_${quality},f_${format}/`);
    }

    // For local images, return as-is (would need server-side optimization)
    return imageUrl;
};

/**
 * Batch API requests to reduce network calls
 */
export class RequestBatcher {
    constructor(batchDelay = 100) {
        this.batchDelay = batchDelay;
        this.queue = [];
        this.timer = null;
    }

    add(request) {
        return new Promise((resolve, reject) => {
            this.queue.push({ request, resolve, reject });

            if (this.timer) {
                clearTimeout(this.timer);
            }

            this.timer = setTimeout(() => {
                this.flush();
            }, this.batchDelay);
        });
    }

    async flush() {
        if (this.queue.length === 0) return;

        const batch = [...this.queue];
        this.queue = [];

        try {
            // Send batched request
            const requests = batch.map(item => item.request);
            const response = await fetch('/api/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requests })
            });

            const results = await response.json();

            // Resolve individual promises
            batch.forEach((item, index) => {
                item.resolve(results[index]);
            });
        } catch (error) {
            // Reject all promises
            batch.forEach(item => {
                item.reject(error);
            });
        }
    }
}

/**
 * Debounce function to reduce API calls
 * @param {function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {function} - Debounced function
 */
export const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function to limit API calls
 * @param {function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {function} - Throttled function
 */
export const throttle = (func, limit = 1000) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

/**
 * Calculate data usage
 */
export const calculateDataUsage = (data) => {
    const jsonString = JSON.stringify(data);
    const bytes = new Blob([jsonString]).size;

    return {
        bytes,
        kb: (bytes / 1024).toFixed(2),
        mb: (bytes / (1024 * 1024)).toFixed(2)
    };
};

/**
 * Low bandwidth mode detector
 */
export const isLowBandwidth = () => {
    if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

        // Effective type: slow-2g, 2g, 3g, 4g
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            return true;
        }

        // Save data mode enabled
        if (connection.saveData) {
            return true;
        }
    }

    return false;
};

/**
 * Adaptive loading based on network conditions
 */
export const getAdaptiveQuality = () => {
    if (!('connection' in navigator)) {
        return 'high';
    }

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection.saveData) {
        return 'low';
    }

    switch (connection.effectiveType) {
        case 'slow-2g':
        case '2g':
            return 'low';
        case '3g':
            return 'medium';
        case '4g':
        default:
            return 'high';
    }
};

export default {
    compressData,
    decompressData,
    optimizeImage,
    RequestBatcher,
    debounce,
    throttle,
    calculateDataUsage,
    isLowBandwidth,
    getAdaptiveQuality
};
