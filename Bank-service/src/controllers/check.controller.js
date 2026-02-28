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