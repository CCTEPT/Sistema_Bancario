import Account from "../models/account.model.js";
import { randomUUID } from "crypto";

class AccountService {

    // Generar número de cuenta único
    generateAccountNumber() {

        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(1000 + Math.random() * 9000);

        return `NB${timestamp}${random}`;
    }


    // Crear cuenta bancaria
    async createAccount({ idUsuario, tipoCuenta, divisa }) {

        // Verificar si ya tiene una cuenta del mismo tipo y divisa
        const existingAccount = await Account.findOne({
            idUsuario,
            tipoCuenta,
            divisa,
            estado: "ACTIVE"
        });

        if (existingAccount) {
            throw new Error(
                `El usuario ya tiene una cuenta ${tipoCuenta} en ${divisa}`
            );
        }

        // Generar número único
        let numeroCuenta;
        let exists = true;

        while (exists) {

            numeroCuenta = this.generateAccountNumber();

            exists = await Account.exists({ numeroCuenta });
        }

        // Crear cuenta
        const account = await Account.create({
            idCuenta: randomUUID(),
            numeroCuenta,
            saldo: 0,
            tipoCuenta,
            divisa,
            idUsuario,
            estado: "ACTIVE"
        });

        return account;
    }


    // Obtener cuentas por usuario
    async getAccountsByUser(idUsuario) {

        return await Account.find({
            idUsuario,
            estado: "ACTIVE"
        });
    }


    // Obtener cuenta por número
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


    // Obtener cuenta por ID
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

    async getAccounts() {
        return await Account.find({ estado: "ACTIVE" });
    }

}

export default new AccountService();