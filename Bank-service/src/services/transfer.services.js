import Account from "../models/account.model.js"
import { registrarMovimiento } from "./movement.service.js"
import mongoose from "mongoose"

export const perfomTransfer = async (dataTransfer, userId) => {
    try {
        const { sourceAccount, destinationAccount, amount } = dataTransfer

        // validaciones básicas
        if (!amount || typeof amount !== 'number' || amount <= 0) {
            throw new Error("El monto de transferencia debe ser un número positivo")
        }
        if (!sourceAccount || !destinationAccount) {
            throw new Error("Se requieren cuentas origen y destino")
        }
        const source = await Account.findById(sourceAccount)
        const destinationQuery = mongoose.Types.ObjectId.isValid(destinationAccount)
            ? { $or: [{ numeroCuenta: destinationAccount }, { _id: destinationAccount }] }
            : { numeroCuenta: destinationAccount }
        const destination = await Account.findOne(destinationQuery)

        if (!source) {
            throw new Error("Cuenta origen no encontrada")
        }
        if (source.idUsuario !== userId) {
            throw new Error("No tienes permiso para transferir desde esta cuenta")
        }
        if (!destination) {
            throw new Error("Cuenta destino no encontrada")
        }
        if (source._id.equals(destination._id)) {
            throw new Error("No se puede transferir a la misma cuenta")
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

        await source.save()
        await destination.save()

        // Registrar movimientos
        const transferOut = await registrarMovimiento({
            accountId: source._id,
            destinationAccountId: destination._id,
            movementType: "TRANSFER_OUT",
            amount,
            executedBy: userId,
            description: dataTransfer.description || "Transferencia enviada",
            channel: dataTransfer.channel || "APP",
            balanceBefore: sourceBefore,
            balanceAfter: sourceAfter
        })

        const transferIn = await registrarMovimiento({
            accountId: destination._id,
            destinationAccountId: source._id,
            movementType: "TRANSFER_IN",
            amount,
            executedBy: userId,
            description: dataTransfer.description || "Transferencia recibida",
            channel: dataTransfer.channel || "APP",
            balanceBefore: destinationBefore,
            balanceAfter: destinationAfter
        })

        return { message: "Transfer successful", transferOut, transferIn }

    } catch (error) {
        throw error
    }
}
