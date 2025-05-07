import jwt from "jsonwebtoken";

export function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  const JWT_SECRET = "sua_chave_secreta_super_segura"; // ideal: use dotenv depois


  if (!token) {
    return res.status(401).json({ mensagem: "Token não fornecido." });
  }

  jwt.verify(token, JWT_SECRET, (err, usuario) => {
    if (err) return res.status(403).json({ mensagem: "Token inválido." });

    req.usuario = usuario; // salva dados decodificados no request
    next(); // permite que a requisição prossiga
  });
}