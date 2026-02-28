import express from "express";
import { emitCheck, cashCheck } from "../controllers/check.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/", authenticateJWT, authorizeRole("CLIENT"), emitCheck);

router.post("/:id/cash",
    authenticateJWT,
    authorizeRole("EMPLOYEE"),
    cashCheck
);

export default router;