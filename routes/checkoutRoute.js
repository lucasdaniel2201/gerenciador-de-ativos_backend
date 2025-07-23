import express from "express";
import stripe from "stripe";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
const stripeClient = stripe(
  "sk_test_51Ro7eaAzyiCrPFPqP462OGaPirAAsHUHUDUKRbtpVr15tfauNWgeIDIoiiQV9PYBG6ADif8k6TgNcdVXbeIHN8SR00lh196dn8"
);
const YOUR_DOMAIN = "http://localhost:5173";

export const tempUserData = {}; // Exportar para uso no webhook

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { username, email, password, isPremium } = req.body;

    const tempUserId = uuidv4();
    tempUserData[tempUserId] = { username, email, password };

    const session = await stripeClient.checkout.sessions.create({
      line_items: [
        {
          price: "price_1Ro7g4AzyiCrPFPqAw97mRf9",
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer_email: email,
      metadata: {
        tempUserId,
      },
      success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/canceled`,
    });

    console.log("Checkout session created:", session.id);
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Erro ao criar sessão de checkout:", error);
    res
      .status(500)
      .json({ message: "Erro ao criar sessão de pagamento. Tente novamente." });
  }
});

export default router;
