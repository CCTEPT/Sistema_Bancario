import mongoose from "mongoose"
import Account from "../models/Account.js"
import { registrarMovimiento } from "./movement.service.js"

export const perfomTransfer = async (dataTransfer, userId) => {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const { sourceAccount, destinationAccount, amount } = dataTransfer

        if (!amount || amount <= 0) {
            throw new Error("Invalid transfer amount")
        }

        const source = await Account.findById(sourceAccount).session(session)
        const destination = await Account.findById(destinationAccount).session(session)

        if (!source || !destination) {
            throw new Error("Account not found")
        }

        if (source.saldo < amount) {
            throw new Error("Insufficient funds")
        }

        // Actualizar balances
        source.saldo -= amount
        destination.saldo += amount

        await source.save({ session })
        await destination.save({ session })

        // Registrar movimientos
        await registrarMovimiento({
            accountId: source._id,
            destinationAccountId: destination._id,
            movementType: "TRANSFER_OUT",
            amount,
            executedBy: userId,
            description: "Transferencia enviada",
            channel: "INTERNAL_TRANSFER",
            session
        })

        await registrarMovimiento({
            accountId: destination._id,
            destinationAccountId: source._id,
            movementType: "TRANSFER_IN",
            amount,
            executedBy: userId,
            description: "Transferencia recibida",
            channel: "INTERNAL_TRANSFER",
            session
        })

        await session.commitTransaction()
        session.endSession()

        return { message: "Transfer successful" }

    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error
    }
}