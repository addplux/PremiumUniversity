/**
 * Notification Service
 * Handles sending real-time alerts via Socket.io
 */

class NotificationService {
    constructor() {
        this.io = null;
    }

    /**
     * Initialize service with io instance from server.js
     * @param {Object} io - Socket.io instance
     */
    init(io) {
        this.io = io;
    }

    /**
     * Send notification to a specific user
     * @param {string} userId - Target user ID
     * @param {Object} notification - Notification object { title, message, type }
     */
    sendToUser(userId, notification) {
        if (!this.io) {
            console.warn('⚠️ NotificationService not initialized with io instance');
            return;
        }

        this.io.to(userId.toString()).emit('notification', {
            ...notification,
            timestamp: new Date()
        });
    }

    /**
     * Broadcast notification to all connected users in an organization
     * @param {string} organizationId - Target organization ID
     * @param {Object} notification - Notification object
     */
    broadcast(organizationId, notification) {
        // This assumes users join a room named by their organizationId
        // We'll need to update server.js to handle organization-level rooms
        if (this.io && organizationId) {
            this.io.to(`org_${organizationId}`).emit('notification', notification);
        }
    }
}

module.exports = new NotificationService();
