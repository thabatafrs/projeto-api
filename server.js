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

// LOGIN E CADASTRO
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

// EVENTO
app.post("/eventos", autenticarToken, async (req, res) => {
  try {
    const { nome, data, horario } = req.body;

    const NovoEvento = await prisma.evento.create({
      data: {
        nome,
        data: new Date(data),
        horario,
        userId: req.usuario.id,
      },
    });

    res.status(201).json(NovoEvento);
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    res.status(500).json({ error: "Erro ao criar evento" });
  }
});

app.get("/eventos", autenticarToken, async (req, res) => {
  const userId = req.usuario.id;

  const eventos = await prisma.evento.findMany({
    where: { userId },
    orderBy: { horario: "asc" },
  });

  res.json(eventos);
});

app.put("/eventos/:id", autenticarToken, async (req, res) => {
  const { id } = req.params;
  const { nome, horario } = req.body;

  if (!nome || !horario) {
    return res.status(400).json({ message: "Nome e horário são obrigatórios" });
  }

  try {
    const eventoAtualizado = await prisma.evento.update({
      where: { id },
      data: {
        nome,
        horario,
      },
    });

    return res.json(eventoAtualizado);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erro ao atualizar o evento", error });
  }
});

// Excluir evento
app.delete("/eventos/:id", autenticarToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.evento.delete({ where: { id } });
    res.json({ message: "Evento excluído com sucesso!" });
  } catch (err) {
    res.status(500).json({ message: "Erro ao excluir evento." });
  }
});

// HABITO
app.post("/habito", autenticarToken, async (req, res) => {
  try {
    const { nome, dias } = req.body;

    const NovoHabito = await prisma.habito.create({
      data: {
        nome,
        dias,
        userId: req.usuario.id, // vindo do token
      },
    });

    res.status(201).json(NovoHabito);
  } catch (error) {
    console.error("Erro ao criar hábito:", error);
    res.status(500).json({ mensagem: "Erro ao criar hábito" });
  }
});

app.get("/habito", autenticarToken, async (req, res) => {
  const userId = req.usuario.id;

  const habito = await prisma.habito.findMany({ where: { userId } });

  res.json(habito);
});

app.put("/habito/:id", autenticarToken, async (req, res) => {
  const { id } = req.params;
  const { nome, dias } = req.body;

  if (!nome || !dias) {
    return res
      .status(400)
      .json({ message: "Nome e dias da semana são obrigatórios" });
  }

  try {
    const habitoAtualizado = await prisma.habito.update({
      where: { id },
      data: { nome, dias },
    });

    return res.status(200).json(habitoAtualizado);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erro ao atualizar o evento", error });
  }
});

app.delete("/habito/:id", autenticarToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.habito.delete({ where: { id } });
    res.json({ message: "Hábito excluído com sucesso!" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao excluir hábito" });
  }
});

app.listen(3000);
