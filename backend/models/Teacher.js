const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: [true, 'Employee ID is required'],
        unique: true,
        trim: true
    },
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
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    department: {
        type: String,
        required: [true, 'Department is required']
    },
    qualification: {
        type: String,
        trim: true
    },
    specialization: {
        type: String,
        trim: true
    },
    dateOfJoining: {
        type: Date,
        default: Date.now
    },
    address: String,
    city: String,
    salary: {
        type: Number,
        min: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'on_leave'],
        default: 'active'
    }
}, {
    timestamps: true
});

export default mongoose.model('Teacher', teacherSchema);
