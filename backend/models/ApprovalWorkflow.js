const mongoose = require('mongoose');

const approvalLevelSchema = new mongoose.Schema({
    level: {
        type: Number,
        required: true
    },
    name: String,
    approverRole: {
        type: String,
        enum: ['Department Head', 'Procurement Officer', 'Finance Officer', 'CFO', 'CEO', 'Custom'],
        required: true
    },
    approverUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    conditions: {
        minAmount: Number,
        maxAmount: Number,
        departments: [String],
        categories: [String]
    },
    required: {
        type: Boolean,
        default: true
    },
    timeoutDays: Number // Auto-approve after X days if no action
});

const approvalWorkflowSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    type: {
        type: String,
        enum: ['Purchase Requisition', 'Purchase Order', 'Payment', 'Contract', 'Other'],
        required: true
    },
    approvalLevels: [approvalLevelSchema],
    conditions: {
        minAmount: Number,
        maxAmount: Number,
        departments: [String],
        categories: [String],
        priority: [String]
    },
    parallelApproval: {
        type: Boolean,
        default: false // If true, all approvers at same level can approve simultaneously
    },
    notificationSettings: {
        emailOnSubmission: { type: Boolean, default: true },
        emailOnApproval: { type: Boolean, default: true },
        emailOnRejection: { type: Boolean, default: true },
        reminderDays: { type: Number, default: 3 }
    },
    escalationRules: {
        enabled: { type: Boolean, default: false },
        escalateAfterDays: Number,
        escalateTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    active: {
        type: Boolean,
        default: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes
approvalWorkflowSchema.index({ organizationId: 1, type: 1 });
approvalWorkflowSchema.index({ organizationId: 1, active: 1 });
approvalWorkflowSchema.index({ organizationId: 1, isDefault: 1 });

// Method to get applicable workflow based on conditions
approvalWorkflowSchema.statics.getApplicableWorkflow = async function (organizationId, type, amount, department, category) {
    const workflows = await this.find({
        organizationId,
        type,
        active: true,
        $or: [
            { 'conditions.minAmount': { $lte: amount }, 'conditions.maxAmount': { $gte: amount } },
            { 'conditions.minAmount': { $exists: false }, 'conditions.maxAmount': { $exists: false } }
        ]
    }).sort({ isDefault: 1 });

    for (const workflow of workflows) {
        // Check department condition
        if (workflow.conditions.departments && workflow.conditions.departments.length > 0) {
            if (!workflow.conditions.departments.includes(department)) continue;
        }

        // Check category condition
        if (workflow.conditions.categories && workflow.conditions.categories.length > 0) {
            if (!workflow.conditions.categories.includes(category)) continue;
        }

        return workflow;
    }

    // Return default workflow if no specific match
    return workflows.find(w => w.isDefault);
};

module.exports = mongoose.model('ApprovalWorkflow', approvalWorkflowSchema);
