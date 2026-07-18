import mongoose from "mongoose";
import Currency from "../src/models/currency.model.js";
import AccountType from "../src/models/accountType.model.js";

export const connectDB = async () => {
  try {
    const mongoUri = process.env.URI_MONGODB || process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("No se encontró la variable de entorno URI_MONGODB o MONGO_URI");
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB conectado");

    // Seed default currencies
    const currencyCount = await Currency.countDocuments();
    if (currencyCount === 0) {
      console.log("Seeding default currencies...");
      await Currency.create([
        { code: "GTQ", name: "Quetzal guatemalteco", symbol: "Q" },
        { code: "USD", name: "Dolar estadounidense", symbol: "$" },
        { code: "EUR", name: "Euro", symbol: "€" }
      ]);
    }

    // Seed default account types
    const accountTypeCount = await AccountType.countDocuments();
    if (accountTypeCount === 0) {
      console.log("Seeding default account types...");
      await AccountType.create([
        { name: "ahorro", description: "Cuenta de Ahorros" },
        { name: "corriente", description: "Cuenta Corriente" }
      ]);
    }
  } catch (error) {
    console.error("Error conectando a Mongo:", error);
    process.exit(1);
  }
};