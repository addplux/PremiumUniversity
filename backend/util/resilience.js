/**
 * Resilience Utilities
 * Implements basic Retry and Circuit Breaker patterns
 */

/**
 * Executes a function with retry logic
 * @param {Function} fn - Function to execute
 * @param {Object} options - Retry options
 * @param {number} options.retries - Max retries (default 3)
 * @param {number} options.delay - Delay between retries in ms (default 1000)
 */
async function withRetry(fn, options = { retries: 3, delay: 1000 }) {
    let lastError;
    const { retries, delay } = options;

    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < retries) {
                console.warn(`⚠️ Operation failed (attempt ${i + 1}/${retries + 1}). Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}

/**
 * Simple Circuit Breaker Implementation
 */
class CircuitBreaker {
    constructor(fn, options = {}) {
        this.fn = fn;
        this.failureThreshold = options.failureThreshold || 5;
        this.resetTimeout = options.resetTimeout || 30000; // 30 seconds

        this.state = 'CLOSED'; // CLOSED, OPEN, HALF-OPEN
        this.failureCount = 0;
        this.nextAttempt = Date.now();
    }

    async fire(...args) {
        if (this.state === 'OPEN') {
            if (Date.now() > this.nextAttempt) {
                this.state = 'HALF-OPEN';
            } else {
                throw new Error('🚫 Circuit Breaker is OPEN. Request rejected.');
            }
        }

        try {
            const result = await this.fn(...args);
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    onSuccess() {
        this.failureCount = 0;
        this.state = 'CLOSED';
    }

    onFailure() {
        this.failureCount++;
        if (this.failureCount >= this.failureThreshold || this.state === 'HALF-OPEN') {
            this.state = 'OPEN';
            this.nextAttempt = Date.now() + this.resetTimeout;
            console.error(`🔥 Circuit Breaker OPENED (Failures: ${this.failureCount})`);
        }
    }
}

module.exports = {
    withRetry,
    CircuitBreaker
};
