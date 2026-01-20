const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Please add a payment amount']
    },
    date: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        required: [true, 'Please specify payment method'],
        enum: ['Mobile Money', 'Bank Transfer', 'Cash', 'Online', 'Other']
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    },
    reference: {
        type: String,
        unique: true,
        sparse: true
    },
    description: {
        type: String
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

export default mongoose.model('Payment', paymentSchema);
