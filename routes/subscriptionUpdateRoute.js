import express from "express";
import stripe from "stripe";
import User from "../models/User.js";

const router = express.Router();
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_UPDATE_WEBHOOK_SECRET;

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
        endpointSecret
      );
      console.log("✅ Webhook recebido:", event.type);
    } catch (err) {
      console.log(`❌ Webhook signature verification failed:`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        const subscription = event.data.object;
        console.log(
          "📋 Processing subscription:",
          subscription.id,
          "Status:",
          subscription.status
        );

        try {
          await updateSubscriptionInDatabase(subscription);
          console.log("✅ Database updated successfully");
        } catch (error) {
          console.log("❌ Error updating database:", error);
          return res.status(500).json({ error: "Database update failed" });
        }
        break;

      default:
        console.log(`⚠️ Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);

async function updateSubscriptionInDatabase(subscription) {
  console.log("🔄 Updating subscription in database...");

  // ✅ AGORA VAI FUNCIONAR porque o model terá stripeCustomerId
  const user = await User.findOne({
    where: { stripeCustomerId: subscription.customer },
  });

  if (!user) {
    console.log("❌ User not found for customer:", subscription.customer);
    throw new Error("User not found");
  }

  const isPremium = subscription.status === "active";

  await User.update(
    {
      isPremium: isPremium,
      subscriptionStatus: subscription.status,
      stripeSubscriptionId: subscription.id,
    },
    {
      where: { stripeCustomerId: subscription.customer },
    }
  );

  console.log(
    `✅ User ${user.id} updated: isPremium=${isPremium}, status=${subscription.status}`
  );
}

export default router;
