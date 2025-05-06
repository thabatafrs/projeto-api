import express from "express";
import pkg from "@prisma/client";
import cors from "cors";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

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

app.put("/usuarios/:id", async (req, res) => {
  await prisma.user.update({
    where: {
      id: req.params.id,
    },
    data: {
      email: req.body.email,
      senha: req.body.senha,
    },
  });

  res.status(201).json(req.body);
});

app.delete("/usuarios/:id", async (req, res) => {
  await prisma.user.delete({
    where: { id: req.params.id },
  });

  res.status(200).json({ message: "deletado com sucesso" });
});

app.get("/usuarios", async (req, res) => {
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
