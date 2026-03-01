import mongoose from 'mongoose'

const movementSchema = new mongoose.Schema(
    {
        accountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
            index: true
        },

        destinationAccountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account'
        },

        executedBy: {
            type: String,
            required: true
        },

        movementType: {
            type: String,
            enum: [
                'DEPOSIT',
                'WITHDRAW',
                'TRANSFER_OUT',
                'TRANSFER_IN',
                'CHECK_ISSUE',
                'CHECK_CASH'
            ],
            required: true,
            index: true
        },

        status: {
            type: String,
            enum: ['PENDING', 'CONFIRMED'],
            default: 'CONFIRMED'
        },

        channel: {
            type: String,
            enum: ['CASHIER', 'ATM', 'INTERNAL_TRANSFER', 'APP'],
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0.01
        },

        description: {
            type: String
        },

        date: {
            type: Date,
            default: Date.now,
            index: true
        },

        idempotencyKey: {
            type: String,
            unique: true,
            sparse: true
        }
    },
    { timestamps: true }
)

movementSchema.index({ accountId: 1 });
movementSchema.index({ date: -1 });
movementSchema.index({ movementType: 1 });

export default mongoose.model('Movement', movementSchema)