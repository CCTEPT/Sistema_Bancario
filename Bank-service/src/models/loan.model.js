import mongoose from 'mongoose'
import { randomUUID } from 'crypto'

const loanSchema = new mongoose.Schema(
    {
        idLoan: {
            type: String,
            default: () => randomUUID(),
            unique: true
        },

        idUsuario: {
            type: String,
            required: true,
            index: true
        },

        accountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 100
        },

        termMonths: {
            type: Number,
            required: true,
            enum: [6, 12, 24, 36]
        },

        annualRate: {
            type: Number,
            default: 12 // 12% anual fijo
        },

        monthlyPayment: {
            type: Number,
            required: true
        },

        totalPayment: {
            type: Number,
            required: true
        },

        totalInterest: {
            type: Number,
            required: true
        },

        currency: {
            type: String,
            default: 'GTQ'
        },

        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'PAID'],
            default: 'PENDING',
            index: true
        },

        description: {
            type: String
        },

        reviewedBy: {
            type: String,
            default: null
        },

        amountPaid: {
            type: Number,
            default: 0
        },

        remainingBalance: {
            type: Number,
            default: null 
        },

        rejectionReason: {
            type: String,
            default: null
        },

        approvedAt: {
            type: Date,
            default: null
        },

        disbursementMovementId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movement',
            default: null
        }
    },
    { timestamps: true }
)

export default mongoose.model('Loan', loanSchema)