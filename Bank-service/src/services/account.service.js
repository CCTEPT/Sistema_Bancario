import mongoose from "mongoose";
import Account from "../models/account.model.js";
import AccountRequest from "../models/account-request.model.js";
import { randomUUID } from "crypto";
import axios from "axios";
import authClient from "./authServiceClient.service.js";

const FINANCIAL_CONFIG_URL = process.env.FINANCIAL_CONFIG_URL || "http://localhost:4000/api";

async function getValidCurrencyCodes() {
    try {
        const { data } = await axios.get(`${FINANCIAL_CONFIG_URL}/currencies`);
        if (!data || data.length === 0) {
            return ["GTQ", "USD", "EUR"];
        }
        return data.map((c) => c.code.toUpperCase());
    } catch {
        return ["GTQ", "USD", "EUR"];
    }
}

class AccountService {
    generateAccountNumber() {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(1000 + Math.random() * 9000);

        return `NB${timestamp}${random}`;
    }

    async validateCurrency(divisa) {
        const validCodes = await getValidCurrencyCodes();
        const divisaUpper = (divisa || "GTQ").toUpperCase();

        if (!validCodes.includes(divisaUpper)) {
            throw new Error(
                `La divisa '${divisaUpper}' no esta configurada. Divisas disponibles: ${validCodes.join(", ")}`
            );
        }

        return divisaUpper;
    }

    async ensureAccountCanBeCreated({ idUsuario, tipoCuenta, divisa, ignorePendingRequestId = null }) {
        const divisaUpper = await this.validateCurrency(divisa);

        const pendingFilter = {
            idUsuario,
            tipoCuenta,
            divisa: divisaUpper,
            estado: "PENDING"
        };

        if (ignorePendingRequestId) {
            pendingFilter.idSolicitud = { $ne: ignorePendingRequestId };
        }

        const existingPending = await AccountRequest.findOne(pendingFilter);

        if (existingPending) {
            throw new Error(
                `Ya existe una solicitud pendiente para una cuenta ${tipoCuenta} en ${divisaUpper}`
            );
        }

        return divisaUpper;
    }

    async createAccount({ idUsuario, tipoCuenta, divisa, ignorePendingRequestId = null }) {
        const divisaUpper = await this.ensureAccountCanBeCreated({
            idUsuario,
            tipoCuenta,
            divisa,
            ignorePendingRequestId
        });

        let numeroCuenta;
        let exists = true;

        while (exists) {
            numeroCuenta = this.generateAccountNumber();
            exists = await Account.exists({ numeroCuenta });
        }

        return await Account.create({
            idCuenta: randomUUID(),
            numeroCuenta,
            saldo: 0,
            tipoCuenta,
            divisa: divisaUpper,
            idUsuario,
            estado: "ACTIVE"
        });
    }

    async createAccountRequest({ idUsuario, tipoCuenta, divisa, requestedByRole }) {
        const divisaUpper = await this.ensureAccountCanBeCreated({ idUsuario, tipoCuenta, divisa });

        return await AccountRequest.create({
            idUsuario,
            tipoCuenta,
            divisa: divisaUpper,
            requestedByRole,
            estado: "PENDING"
        });
    }

    async getAccountRequests({ role, userId }) {
        const filter = role === "ADMIN_ROLE" || role === "EMPLOYEE_ROLE"
            ? { estado: "PENDING" }
            : { idUsuario: userId, estado: "PENDING" };

        return await AccountRequest.find(filter).sort({ createdAt: -1 });
    }

    buildAccountRequestQuery(requestId) {
        const query = { $or: [{ idSolicitud: requestId }] };
        if (mongoose.isValidObjectId(requestId)) {
            query.$or.push({ _id: requestId });
        }
        return query;
    }

    async approveAccountRequest({ requestId, reviewerId }) {
        const query = this.buildAccountRequestQuery(requestId);
        const accountRequest = await AccountRequest.findOne({
            ...query,
            estado: "PENDING"
        });

        if (!accountRequest) {
            throw new Error("Solicitud pendiente no encontrada");
        }

        const account = await this.createAccount({
            idUsuario: accountRequest.idUsuario,
            tipoCuenta: accountRequest.tipoCuenta,
            divisa: accountRequest.divisa,
            ignorePendingRequestId: accountRequest.idSolicitud
        });

        accountRequest.estado = "APPROVED";
        accountRequest.reviewedBy = reviewerId;
        accountRequest.accountId = account.idCuenta;
        await accountRequest.save();

        return { request: accountRequest, account };
    }

    async rejectAccountRequest({ requestId, reviewerId, reason }) {
        const query = this.buildAccountRequestQuery(requestId);
        const accountRequest = await AccountRequest.findOne({
            ...query,
            estado: "PENDING"
        });

        if (!accountRequest) {
            throw new Error("Solicitud pendiente no encontrada");
        }

        accountRequest.estado = "REJECTED";
        accountRequest.reviewedBy = reviewerId;
        accountRequest.rejectionReason = reason || null;
        await accountRequest.save();

        return accountRequest;
    }

    async getAccountsByUser(idUsuario) {
        return await Account.find({
            idUsuario
        });
    }

    async getAccountByNumber(numeroCuenta) {
        const account = await Account.findOne({
            numeroCuenta,
            estado: "ACTIVE"
        });

        if (!account) {
            throw new Error("Cuenta no encontrada");
        }

        return account;
    }

    async getAccountById(idCuenta) {
        const account = await Account.findOne({
            idCuenta,
            estado: "ACTIVE"
        });

        if (!account) {
            throw new Error("Cuenta no encontrada");
        }

        return account;
    }

    async updateAccountStatus({ accountId, estado, userId, userRole }) {
        const normalizedStatus = String(estado || "").toUpperCase();
        if (!["ACTIVE", "INACTIVE"].includes(normalizedStatus)) {
            throw new Error("Estado de cuenta invalido");
        }

        const account = await Account.findOne({
            $or: [{ idCuenta: accountId }, { _id: accountId }]
        });

        if (!account) {
            throw new Error("Cuenta no encontrada");
        }

        if (userRole === "USER_ROLE") {
            const accountOwnerId = String(account.idUsuario || account.idUsuario?._id || account.idUsuario);
            if (!userId || accountOwnerId !== String(userId)) {
                throw new Error("No tiene permiso para actualizar esta cuenta");
            }
        }

        account.estado = normalizedStatus;
        await account.save();
        return account;
    }

    async getAccounts({ token } = {}) {
        // 1. Traer todas las cuentas del banco
        const accounts = await Account.find().lean();

        if (!token || accounts.length === 0) return accounts;

        try {
            // 2. Obtener todos los usuarios con rol USER_ROLE desde el AuthService
            const users = await authClient.getUsersByRole("USER_ROLE", token);

            // 3. Construir un mapa id → nombre para búsqueda O(1)
            const userMap = {};
            for (const u of users) {
                const id = u.id || u.Id;
                if (id) {
                    userMap[id] = `${u.name || u.Name || ""} ${u.surname || u.Surname || ""}`.trim()
                        || u.username || u.Username
                        || u.email || u.Email
                        || "Sin nombre";
                }
            }

            // 4. Enriquecer cada cuenta con el nombre del propietario
            return accounts.map((account) => ({
                ...account,
                ownerName: userMap[account.idUsuario] || null,
            }));
        } catch (err) {
            
            console.error("No se pudo enriquecer cuentas con nombres de usuario:", err.message);
            return accounts;
        }
    }
}

export default new AccountService();
