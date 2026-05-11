import Check from "../models/check.model.js";
import Account from "../models/account.model.js";
import { generateCheckNumber } from "../utils/checkNumberGenerator.js";
import { registrarMovimiento } from "../services/movement.service.js";

const CHECK_VALIDITY_DAYS = 90;

const canUseAccount = (request, account) =>
    request.user.role !== "USER_ROLE" || account.idUsuario === request.user.sub;

export const listChecks = async (request, reply) => {
    try {
        const accountFilter = request.user.role === "USER_ROLE"
            ? { idUsuario: request.user.sub, estado: "ACTIVE" }
            : { estado: "ACTIVE" };

        const accounts = await Account.find(accountFilter).lean();
        const accountIds = accounts.map((account) => account._id);

        const checks = await Check.find({
            $or: [
                { issuingAccount: { $in: accountIds } },
                { receivingAccount: { $in: accountIds } }
            ]
        })
            .sort({ createdAt: -1 })
            .lean();

        return reply.send({
            status: "Success",
            data: checks
        });
    } catch (error) {
        return reply.code(400).send({
            status: "Error",
            message: error.message
        });
    }
};

export const emitCheck = async (request, reply) => {
    try {
        const { issuingAccountId, amount } = request.body;
        const userId = request.user.sub;

        if (!amount || amount <= 0) {
            throw new Error("El monto debe ser mayor a 0");
        }

        const account = await Account.findById(issuingAccountId);

        if (!account || account.estado !== "ACTIVE") {
            throw new Error("Cuenta emisora activa no encontrada");
        }

        if (!canUseAccount(request, account)) {
            throw new Error("No tienes permiso para emitir cheques desde esta cuenta");
        }

        if (account.saldo < amount) {
            throw new Error("Saldo insuficiente para emitir el cheque");
        }

        const issueDate = new Date();
        const expiryDate = new Date(issueDate);
        expiryDate.setDate(expiryDate.getDate() + CHECK_VALIDITY_DAYS);

        const check = await Check.create({
            checkNumber: generateCheckNumber(),
            issuingAccount: account._id,
            amount,
            issuerUser: userId,
            issueDate,
            expiryDate
        });

        const movement = await registrarMovimiento({
            accountId: account._id,
            movementType: "CHECK_ISSUE",
            amount,
            executedBy: userId,
            description: `Cheque emitido ${check.checkNumber}`,
            channel: "APP",
            balanceBefore: account.saldo,
            balanceAfter: account.saldo
        });

        return reply.code(201).send({
            status: "Success",
            message: "Cheque emitido correctamente",
            data: {
                check,
                movement
            }
        });

    } catch (error) {
        return reply.code(400).send({
            status: "Error",
            message: error.message
        });
    }
};

export const cashCheck = async (request, reply) => {
    try {
        const { id } = request.params;
        const { receivingAccountId, checkNumber } = request.body;

        if (!receivingAccountId) {
            throw new Error("Selecciona una cuenta receptora");
        }

        const checkQuery = id
            ? { _id: id }
            : { checkNumber: checkNumber?.trim() };

        const check = await Check.findOne(checkQuery);

        if (!check) {
            throw new Error("Cheque no encontrado");
        }

        if (check.status !== "EMITIDO") {
            throw new Error("El cheque no puede cobrarse");
        }

        if (check.expiryDate && check.expiryDate < new Date()) {
            check.status = "RECHAZADO";
            await check.save();
            throw new Error("El cheque esta vencido");
        }

        const issuingAccount = await Account.findById(check.issuingAccount);
        const receivingAccount = await Account.findById(receivingAccountId);

        if (!issuingAccount || issuingAccount.estado !== "ACTIVE") {
            throw new Error("Cuenta emisora activa no encontrada");
        }

        if (!receivingAccount || receivingAccount.estado !== "ACTIVE") {
            throw new Error("Cuenta receptora activa no encontrada");
        }

        if (!canUseAccount(request, receivingAccount)) {
            throw new Error("No tienes permiso para cobrar cheques en esta cuenta");
        }

        if (issuingAccount.idUsuario === receivingAccount.idUsuario) {
            throw new Error("No puedes cobrar un cheque emitido por tus propias cuentas");
        }

        if (issuingAccount.divisa !== receivingAccount.divisa) {
            throw new Error("La cuenta receptora debe usar la misma divisa del cheque");
        }

        if (issuingAccount.saldo < check.amount) {
            throw new Error("Saldo insuficiente en la cuenta emisora");
        }

        const issuerBefore = issuingAccount.saldo;
        const receiverBefore = receivingAccount.saldo;

        issuingAccount.saldo -= check.amount;
        receivingAccount.saldo += check.amount;

        const issuerAfter = issuingAccount.saldo;
        const receiverAfter = receivingAccount.saldo;

        await issuingAccount.save();
        await receivingAccount.save();

        const issuerMovement = await registrarMovimiento({
            accountId: issuingAccount._id,
            destinationAccountId: receivingAccount._id,
            movementType: "CHECK_CASH",
            amount: check.amount,
            executedBy: request.user.sub,
            description: `Cheque cobrado ${check.checkNumber}`,
            channel: "APP",
            balanceBefore: issuerBefore,
            balanceAfter: issuerAfter
        });

        const receiverMovement = await registrarMovimiento({
            accountId: receivingAccount._id,
            destinationAccountId: issuingAccount._id,
            movementType: "CHECK_CASH",
            amount: check.amount,
            executedBy: request.user.sub,
            description: `Cheque recibido ${check.checkNumber}`,
            channel: "APP",
            balanceBefore: receiverBefore,
            balanceAfter: receiverAfter
        });

        check.status = "COBRADO";
        check.cashDate = new Date();
        check.receivingAccount = receivingAccount._id;
        await check.save();

        return reply.send({
            status: "Success",
            message: "Cheque cobrado correctamente",
            data: {
                check,
                issuerMovement,
                receiverMovement
            }
        });

    } catch (error) {
        return reply.code(400).send({
            status: "Error",
            message: error.message
        });
    }
};
