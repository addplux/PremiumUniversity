import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'user_created', 'user_updated', 'user_deleted', 'role_changed',
            'payment_recorded', 'payment_updated', 'payment_deleted',
            'assignment_created', 'assignment_updated', 'assignment_deleted',
            'grade_posted', 'grade_updated',
            'schedule_created', 'schedule_updated', 'schedule_deleted',
            'online_class_created', 'online_class_updated', 'online_class_cancelled',
            'login', 'logout', 'failed_login'
        ]
    },
    targetModel: {
        type: String,
        enum: ['User', 'Payment', 'Assignment', 'Grade', 'Schedule', 'OnlineClass', 'Auth']
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    ipAddress: String,
    userAgent: String
}, {
    timestamps: true
});

// Index for efficient querying
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ targetModel: 1, targetId: 1 });

export default mongoose.model('AuditLog', auditLogSchema);
