const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    password: {
        type: String,
        required: function () {
            // Password required only if not set to default
            return !this.password;
        },
        minlength: [4, 'Password must be at least 4 characters'],
        select: false,
        default: '1234' // Default password for students created by admin
    },
    role: {
        type: String,
        enum: ['student', 'admin', 'finance_admin', 'system_admin', 'academic_admin'],
        default: 'student'
    },
    // Multi-tenant support
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        index: true,
        // Not required to allow super admins without organization
        required: function () {
            return !this.isSuperAdmin;
        }
    },
    isSuperAdmin: {
        type: Boolean,
        default: false,
        // Super admins can manage all organizations
        select: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    dateOfBirth: Date,
    address: String,
    city: String,
    country: {
        type: String,
        default: 'Zambia'
    },
    // Student-specific fields
    rollNo: {
        type: String,
        sparse: true, // Allows null values while maintaining uniqueness for non-null values
        unique: true
    },
    class: String,
    course: String,
    branch: String,
    batch: String,
    parentsName: String
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
