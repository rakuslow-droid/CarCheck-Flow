
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { initializeFirebase } from "@/firebase/init";
import { doc, getDoc } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req: NextRequest) {
  try {
    const { merchantId, ownerId } = await req.json();

    if (!merchantId || !ownerId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const { firestore } = initializeFirebase();
    if (!firestore) return NextResponse.json({ error: "No DB" }, { status: 500 });

    const merchantDoc = await getDoc(doc(firestore, "merchants", merchantId));
    if (!merchantDoc.exists()) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
    }

    const merchantData = merchantDoc.data();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: {
              name: "CarCheck Flow Pro Plan",
              description: "Automated LINE vehicle inspection reminders",
            },
            unit_amount: 5000,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.nextUrl.origin}/dashboard/billing?success=true`,
      cancel_url: `${req.nextUrl.origin}/dashboard/billing?canceled=true`,
      customer_email: merchantData.email || undefined,
      metadata: {
        merchantId,
        ownerId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Checkout Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
