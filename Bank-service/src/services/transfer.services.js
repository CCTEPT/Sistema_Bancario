import mongoose from "mongoose"
import Account from "../models/account.model.js"
import { registrarMovimiento } from "./movement.service.js"

export const perfomTransfer = async (dataTransfer, userId) => {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const { sourceAccount, destinationAccount, amount } = dataTransfer

        // validaciones básicas
        if (!amount || typeof amount !== 'number' || amount <= 0) {
            throw new Error("El monto de transferencia debe ser un número positivo")
        }
        if (!sourceAccount || !destinationAccount) {
            throw new Error("Se requieren cuentas origen y destino")
        }
        if (sourceAccount === destinationAccount) {
            throw new Error("No se puede transferir a la misma cuenta")
        }

        const source = await Account.findById(sourceAccount).session(session)
        const destination = await Account.findById(destinationAccount).session(session)

        if (!source) {
            throw new Error("Cuenta origen no encontrada")
        }
        if (!destination) {
            throw new Error("Cuenta destino no encontrada")
        }

        // verificar estados
        if (source.estado !== 'ACTIVE') {
            throw new Error("Cuenta origen no está activa")
        }
        if (destination.estado !== 'ACTIVE') {
            throw new Error("Cuenta destino no está activa")
        }

        if (source.saldo < amount) {
            throw new Error("Fondos insuficientes en la cuenta origen")
        }

        // Actualizar balances
        const sourceBefore = source.saldo
        const destinationBefore = destination.saldo

        source.saldo -= amount
        destination.saldo += amount

        const sourceAfter = source.saldo
        const destinationAfter = destination.saldo

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
            session,
            balanceBefore: sourceBefore,
            balanceAfter: sourceAfter
        })

        await registrarMovimiento({
            accountId: destination._id,
            destinationAccountId: source._id,
            movementType: "TRANSFER_IN",
            amount,
            executedBy: userId,
            description: "Transferencia recibida",
            channel: "INTERNAL_TRANSFER",
            session,
            balanceBefore: destinationBefore,
            balanceAfter: destinationAfter
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