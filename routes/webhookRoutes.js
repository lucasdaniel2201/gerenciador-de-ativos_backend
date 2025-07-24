import express from "express";
import stripe from "stripe";
import axios from "axios";
import { tempUserData } from "./checkoutRoute.js";

const router = express.Router();
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripeClient.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_REGISTER_WEBHOOK_SECRET // Substitua pela chave de assinatura correta
      );
    } catch (err) {
      console.error("Erro ao verificar webhook:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { tempUserId } = session.metadata;

      const userData = tempUserData[tempUserId];
      if (userData) {
        const { username, email, password } = userData;
        try {
          console.log("Tentando registrar usuário:", {
            username,
            email,
            isPremium: true,
          });
          const response = await axios.post(
            "http://localhost:3000/api/auth/register",
            {
              username,
              email,
              password,
              isPremium: true,
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
            }
          );
          console.log(
            "Usuário registrado com plano premium:",
            username,
            email,
            response.data
          );
          delete tempUserData[tempUserId];
        } catch (error) {
          console.error(
            "Erro ao registrar usuário após pagamento:",
            error.response?.data || error.message
          );
        }
      } else {
        console.error(
          "Dados do usuário não encontrados para tempUserId:",
          tempUserId
        );
      }
    }

    res.json({ received: true });
  }
);

export default router;
