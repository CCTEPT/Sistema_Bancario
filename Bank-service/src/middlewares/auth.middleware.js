// En auth.middleware.js
export default async function authMiddleware(request, reply) {
  try {
    // verifica y lo pone en request.user
    await request.jwtVerify()

    // opcionalmente expose el token para quien lo necesite
    const authHeader = request.headers.authorization || ""
    if (authHeader.startsWith("Bearer ")) {
      request.token = authHeader.slice(7)
    }
  } catch (err) {
    console.error("Detalle del error JWT:", err.message); // <--- ESTO TE DIRÁ SI ES POR ISSUER, EXPIRED, etc.
    return reply.code(401).send({
      error: "Token inválido",
      message: err.message
    })
  }
}