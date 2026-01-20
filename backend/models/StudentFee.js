const mongoose = require('mongoose');

const studentFeeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Student is required']
    },
    rollNo: {
        type: String,
        required: [true, 'Roll number is required']
    },
    studentName: {
        type: String,
        required: true
    },
    parentName: {
        type: String,
        required: [true, 'Parent name is required']
    },
    course: {
        type: String,
        required: [true, 'Course is required']
    },
    branch: {
        type: String,
        required: [true, 'Branch is required']
    },
    semester: {
        type: Number,
        required: [true, 'Semester is required'],
        min: 1,
        max: 6
    },
    academicYear: {
        type: String,
        required: [true, 'Academic year is required']
    },
    totalSemesterFee: {
        type: Number,
        required: [true, 'Total semester fee is required'],
        min: 0
    },
    previousSemesterDue: {
        type: Number,
        default: 0,
        min: 0
    },
    totalDue: {
        type: Number,
        required: true,
        min: 0
    },
    amountPaid: {
        type: Number,
        required: [true, 'Amount paid is required'],
        min: 0
    },
    remainingBalance: {
        type: Number,
        required: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'bank_transfer', 'card', 'cheque', 'online'],
        default: 'cash'
    },
    transactionId: {
        type: String,
        trim: true
    },
    remarks: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['paid', 'partial', 'pending', 'overdue'],
        default: 'pending'
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Calculate total due and remaining balance before saving
studentFeeSchema.pre('save', function (next) {
    this.totalDue = this.totalSemesterFee + this.previousSemesterDue;
    this.remainingBalance = this.totalDue - this.amountPaid;

    // Update status based on payment
    if (this.remainingBalance === 0) {
        this.status = 'paid';
    } else if (this.amountPaid > 0) {
        this.status = 'partial';
    } else {
        this.status = 'pending';
    }

    next();
});

export default mongoose.model('StudentFee', studentFeeSchema);
