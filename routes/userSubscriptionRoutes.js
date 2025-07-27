import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token de acesso requerido" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    req.user = user;
    next();
  });
};

// Endpoint para buscar subscription do usuário
router.get("/user/subscription", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Usuário não encontrado",
      });
    }

    // Se não tem subscription no banco
    if (!user.stripeSubscriptionId) {
      return res.json({
        success: true,
        subscription: null,
        message: "Usuário sem assinatura ativa",
      });
    }

    // Buscar detalhes da subscription no Stripe
    const subscription = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId
    );
    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        customer: subscription.customer,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
      },
      user: {
        isPremium: user.isPremium,
        subscriptionStatus: user.subscriptionStatus,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar subscription:", error);

    // Se a subscription não existe mais no Stripe
    if (error.code === "resource_missing") {
      // Atualizar banco para remover subscription inválida
      await User.update(
        {
          stripeSubscriptionId: null,
          subscriptionStatus: "canceled",
          isPremium: false,
        },
        { where: { id: req.user.id } }
      );

      return res.json({
        success: true,
        subscription: null,
        message: "Subscription não encontrada no Stripe",
      });
    }

    res.status(500).json({
      success: false,
      error: "Erro ao buscar assinatura",
    });
  }
});

export default router;
