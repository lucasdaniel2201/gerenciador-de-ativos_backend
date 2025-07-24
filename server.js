import dotenv from "dotenv";
dotenv.config();

import express from "express";
import sequelize from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import usersRouter from "./routes/usersRouter.js";
import checkoutRoute from "./routes/checkoutRoute.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import subscriptionUpdateRoute from "./routes/subscriptionUpdateRoute.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// Rota do webhook deve vir antes do express.json()
app.use("/webhook", webhookRoutes);
app.use("/webhook/stripe", subscriptionUpdateRoute);

// Aplicar express.json() para outras rotas
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRouter);
app.use("/api/assets", assetRoutes);
app.use("/api/checkout", checkoutRoute);

app.get("/", (req, res) => {
  res.send("API do Gerenciador de Ativos está rodando!");
});

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Banco de dados sincronizado.");
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Acesse: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erro ao sincronizar banco de dados:", err);
  });
