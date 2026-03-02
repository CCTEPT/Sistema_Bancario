const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {

    const header = req.headers["authorization"];

    if (!header)
        return res.status(401).json({message: "Token requerido"});

    try {

        const token = header.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;
        req.token = token;

        next();

    } catch {

        return res.status(401).json({
            message: "Token inválido"
        });
    }
}

module.exports = verifyToken;