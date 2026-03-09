
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { initializeFirebase } from "@/firebase/init";
import { doc, updateDoc } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const { firestore } = initializeFirebase();
  if (!firestore) return NextResponse.json({ error: "No DB" }, { status: 500 });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const merchantId = session.metadata?.merchantId;
        const customerId = session.customer as string;

        if (merchantId) {
          const merchantRef = doc(firestore, "merchants", merchantId);
          await updateDoc(merchantRef, {
            stripeCustomerId: customerId,
            subscriptionStatus: "active",
          });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status;

        // Note: Real production apps would query the merchant by stripeCustomerId
        // For prototype, we log or find the merchant if possible.
        console.log(`Subscription for ${customerId} changed to ${status}`);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook Handler Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
