import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectDB() {

    try {

        const mongoUri = process.env.URI_MONGODB || process.env.MONGO_URI;

        if (!mongoUri) {
            throw new Error("No se encontró la variable de entorno URI_MONGODB o MONGO_URI");
        }

        await mongoose.connect(mongoUri);

        console.log("MongoDB conectado correctamente");

    } catch (error) {

        console.error("Error conectando a MongoDB:", error);
        process.exit(1);

    }

}