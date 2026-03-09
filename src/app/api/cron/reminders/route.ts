import { NextRequest, NextResponse } from "next/server";
import { initializeFirebase } from "@/firebase/init";
import { collection, query, getDocs, where, Timestamp } from "firebase/firestore";
import { addDays, format, parseISO } from "date-fns";

export const dynamic = "force-dynamic";

/**
 * Endpoint to be triggered by an external scheduler (e.g., Cloud Scheduler).
 * It scans all vehicles across all merchants and sends LINE reminders.
 */
export async function GET(req: NextRequest) {
  // Simple security check for cron (In production, use a secret header or OIDC)
  const authHeader = req.headers.get("authorization");
  const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!CHANNEL_ACCESS_TOKEN) {
    return NextResponse.json({ error: "LINE configuration missing" }, { status: 500 });
  }

  const { firestore } = initializeFirebase();
  if (!firestore) return NextResponse.json({ error: "No DB" }, { status: 500 });

  const results = { sent: 0, skipped: 0, errors: 0 };
  const today = new Date();
  
  // Targets: 30 days and 90 days from now
  const targetDates = [
    format(addDays(today, 30), "yyyy-MM-dd"),
    format(addDays(today, 90), "yyyy-MM-dd")
  ];

  try {
    const merchantsSnap = await getDocs(collection(firestore, "merchants"));
    
    for (const merchantDoc of merchantsSnap.docs) {
      const merchantData = merchantDoc.data();
      const shopName = merchantData.name || "当ショップ";
      
      const vehiclesRef = collection(firestore, "merchants", merchantDoc.id, "vehicles");
      // Find vehicles expiring on our target dates
      const q = query(vehiclesRef, where("inspectionDate", "in", targetDates));
      const vehiclesSnap = await getDocs(q);

      for (const vehicleDoc of vehiclesSnap.docs) {
        const vehicle = vehicleDoc.data();
        if (!vehicle.lineUserId) continue;

        const daysRemaining = targetDates[0] === vehicle.inspectionDate ? 30 : 90;
        
        const message = 
          `【${shopName}】より大切なお知らせです。\n\n` +
          `ご登録いただいているお車の車検満了日（${vehicle.inspectionDate}）まで、残り約${daysRemaining}日となりました。\n\n` +
          `お早めのご予約をお勧めしております。本メッセージへの返信、またはお電話にてお気軽にご相談ください！`;

        try {
          const response = await fetch("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
              to: vehicle.lineUserId,
              messages: [{ type: "text", text: message }],
            }),
          });

          if (response.ok) {
            results.sent++;
          } else {
            console.error("Failed to send push:", await response.text());
            results.errors++;
          }
        } catch (e) {
          console.error("Push Error:", e);
          results.errors++;
        }
      }
    }

    return NextResponse.json({ message: "Reminder process completed", results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
