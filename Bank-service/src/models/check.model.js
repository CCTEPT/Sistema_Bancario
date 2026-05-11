import mongoose from "mongoose";

const checkSchema = new mongoose.Schema(
    {
        checkNumber: {
            type: String,
            required: true,
            unique: true,
            maxlength: 30
        },
        issuingAccount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
            required: true,
            index: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        status: {
            type: String,
            enum: ["EMITIDO", "COBRADO", "ANULADO", "RECHAZADO"],
            default: "EMITIDO",
            index: true
        },
        issueDate: {
            type: Date,
            default: Date.now,
            required: true
        },
        expiryDate: {
            type: Date,
            required: true
        },
        cashDate: {
            type: Date,
            default: null
        },
        receivingAccount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
            default: null
        },
        issuerUser: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("Check", checkSchema);
