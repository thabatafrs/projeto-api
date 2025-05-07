import express from "express";
import pkg from "@prisma/client";
import cors from "cors";
import jwt from "jsonwebtoken";
import { autenticarToken } from "./authMiddleware.js";

const { PrismaClient } = pkg;

const prisma = new PrismaClient();
const JWT_SECRET = "sua_chave_secreta_super_segura"; // ideal: use dotenv depois

const app = express();
app.use(express.json());
app.use(cors());

app.post("/usuarios", async (req, res) => {
  await prisma.user.create({
    data: {
      email: req.body.email,
      senha: req.body.senha,
    },
  });

  res.status(201).json(req.body);
});

app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  const usuario = await prisma.user.findUnique({
    where: { email },
  });

  if (!usuario || usuario.senha !== senha) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ token });
});

// app.put("/usuarios/:id", async (req, res) => {
//   await prisma.user.update({
//     where: {
//       id: req.params.id,
//     },
//     data: {
//       email: req.body.email,
//       senha: req.body.senha,
//     },
//   });

//   res.status(201).json(req.body);
// });

// app.delete("/usuarios/:id", async (req, res) => {
//   await prisma.user.delete({
//     where: { id: req.params.id },
//   });

//   res.status(200).json({ message: "deletado com sucesso" });
// });

app.get("/usuarios", autenticarToken, async (req, res) => {
  try {
    const { email, senha } = req.query;

    let users;

    if (email && senha) {
      users = await prisma.user.findMany({
        where: {
          email: String(email),
          senha: String(senha),
        },
      });
    } else {
      users = await prisma.user.findMany();
    }

    res.status(200).json(users);
  } catch (err) {
    console.error("Erro ao buscar usuários:", err);
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

app.listen(3000);
