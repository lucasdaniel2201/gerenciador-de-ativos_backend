import express from "express";
import Stripe from "stripe";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

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

router.post("/cancel-subscription", authenticateToken, async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        error: "subscriptionId é obrigatório",
      });
    }

    const canceledSubscription = await stripe.subscriptions.cancel(
      subscriptionId
    );

    await User.update(
      {
        stripeSubscriptionId: null,
        subscriptionStatus: "canceled",
        isPremium: false,
      },
      {
        where: { id: req.user.id },
      }
    );

    res.json({
      success: true,
      message: "Assinatura cancelada com sucesso!",
      subscription: {
        id: canceledSubscription.id,
        status: canceledSubscription.status,
        canceled_at: canceledSubscription.canceled_at,
      },
    });
  } catch (error) {
    console.error("Erro ao cancelar:", error);
    res.status(400).json({
      success: false,
      error: "Erro ao cancelar assinatura",
    });
  }
});

export default router;
