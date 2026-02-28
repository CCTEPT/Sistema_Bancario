import mongoose from "mongoose";
import Check from "../models/check.model.js";
import Account from "../models/account.model.js";
import Movement from "../models/movement.model.js";
import { generateCheckNumber } from "../utils/checkNumberGenerator.js";

export const emitCheck = async (request, reply) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { issuingAccountId, amount } = request.body;
        const userId = request.user.id;

        if (!amount || amount <= 0) {
            throw new Error("Amount must be greater than zero");
        }

        const account = await Account.findOne({
            _id: issuingAccountId,
            status: "ACTIVE"
        }).session(session);

        if (!account) {
            throw new Error("Active account not found");
        }

        const check = await Check.create([{
            checkNumber: generateCheckNumber(),
            issuingAccount: account._id,
            amount,
            issuerUser: userId
        }], { session });

        await Movement.create([{
            account: account._id,
            type: "CHECK_EMITTED",
            amount
        }], { session });

        await session.commitTransaction();
        session.endSession();

        return reply.status(201).send({
            message: "Check emitted successfully",
            checkId: check[0]._id
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        return reply.status(400).send({
            error: error.message
        });
    }
};


export const cashCheck = async (request, reply) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = request.params;

        const check = await Check.findById(id).session(session);

        if (!check) {
            throw new Error("Check not found");
        }

        if (check.status !== "EMITIDO") {
            throw new Error("Check cannot be cashed");
        }

        const account = await Account.findOne({
            _id: check.issuingAccount,
            status: "ACTIVE"
        }).session(session);

        if (!account) {
            throw new Error("Issuing account not active");
        }

        if (account.balance < check.amount) {
            throw new Error("Insufficient funds");
        }

        account.balance -= check.amount;
        await account.save({ session });

        await Movement.create([{
            account: account._id,
            type: "CHECK_CASHED",
            amount: check.amount
        }], { session });

        check.status = "COBRADO";
        check.cashDate = new Date();
        await check.save({ session });

        await session.commitTransaction();
        session.endSession();

        return reply.send({
            message: "Check cashed successfully"
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        return reply.status(400).send({
            error: error.message
        });
    }
};