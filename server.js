import express from "express";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

const app = express();
app.use(express.json());

app.post("/usuarios", async (req, res) => {
  await prisma.user.create({
    data: {
      email: req.body.email,
      name: req.body.name,
      age: req.body.age,
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
      name: req.body.name,
      age: req.body.age,
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
  console.log(req);
  let users = [];
  if (req.query) {
    users = await prisma.user.findMany({
      where: {
        name: req.query.name,
        age: req.query.age,
        email: req.query.email,
      },
    });
  } else {
    const users = await prisma.user.findMany();
  }
  res.status(200).json(users);
});

app.listen(3000);
