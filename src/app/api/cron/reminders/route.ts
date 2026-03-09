import { NextRequest, NextResponse } from "next/server";
import { initializeFirebase } from "@/firebase/init";
import { collection, query, getDocs, where } from "firebase/firestore";
import { addDays, format } from "date-fns";

export const dynamic = "force-dynamic";

/**
 * Endpoint to be triggered by an external scheduler.
 * Sends personalized reminders with Quick Replies for easy customer action.
 */
export async function GET(req: NextRequest) {
  const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!CHANNEL_ACCESS_TOKEN) {
    return NextResponse.json({ error: "LINE configuration missing" }, { status: 500 });
  }

  const { firestore } = initializeFirebase();
  if (!firestore) return NextResponse.json({ error: "No DB" }, { status: 500 });

  const results = { sent: 0, skipped: 0, errors: 0 };
  const today = new Date();
  
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
      const q = query(vehiclesRef, where("inspectionDate", "in", targetDates));
      const vehiclesSnap = await getDocs(q);

      for (const vehicleDoc of vehiclesSnap.docs) {
        const vehicle = vehicleDoc.data();
        if (!vehicle.lineUserId) continue;

        const daysRemaining = targetDates[0] === vehicle.inspectionDate ? 30 : 90;
        
        const messageText = 
          `【${shopName}】より大切なお知らせです。\n\n` +
          `ご登録のお車（${vehicle.plateNumber || '登録車両'}）の車検満了日まで残り${daysRemaining}日となりました。\n\n` +
          `満了日: ${vehicle.inspectionDate}\n\n` +
          `ご予約やご相談は、下のメニューから簡単に行えます。`;

        try {
          const response = await fetch("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
              to: vehicle.lineUserId,
              messages: [{
                type: "text",
                text: messageText,
                quickReply: {
                  items: [
                    {
                      type: "action",
                      action: {
                        type: "message",
                        label: "予約したい",
                        text: "車検の予約をお願いします"
                      }
                    },
                    {
                      type: "action",
                      action: {
                        type: "message",
                        label: "見積もりがほしい",
                        text: "車検の見積もりを希望します"
                      }
                    },
                    {
                      type: "action",
                      action: {
                        type: "uri",
                        label: "電話で相談",
                        uri: `tel:0000000000` // Placeholder for shop phone
                      }
                    }
                  ]
                }
              }],
            }),
          });

          if (response.ok) {
            results.sent++;
          } else {
            results.errors++;
          }
        } catch (e) {
          results.errors++;
        }
      }
    }

    return NextResponse.json({ message: "Reminder process completed", results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
