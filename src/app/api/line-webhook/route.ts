
// src/app/api/line-webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { initializeFirebase } from "@/firebase/init";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  getDocs,
  where,
  limit,
  getCountFromServer,
} from "firebase/firestore";
import { extractInspectionDateFromImage } from "@/ai/flows/extract-inspection-date-from-image-flow";
import crypto from "crypto";

export const dynamic = "force-dynamic";

async function replyToLine(replyToken: string, text: string, accessToken: string | undefined) {
  if (!accessToken) return;
  try {
    await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        replyToken,
        messages: [{ type: "text", text }],
      }),
    });
  } catch (error) {
    console.error("LINE Reply Error:", error);
  }
}

async function pushToLine(to: string, text: string, accessToken: string | undefined) {
  if (!accessToken || !to) return;
  try {
    await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        to,
        messages: [{ type: "text", text }],
      }),
    });
  } catch (error) {
    console.error("LINE Push Error:", error);
  }
}

function verifySignature(body: string, signature: string | null, secret: string | undefined): boolean {
  if (!secret || !signature) return false;
  const hash = crypto.createHmac("SHA256", secret).update(body).digest("base64");
  return hash === signature;
}

async function getLineImage(messageId: string, accessToken: string | undefined): Promise<string> {
  if (!accessToken) throw new Error("LINE Access Token missing");
  const response = await fetch(`https://api-data.line.me/v2/bot/message/${messageId}/content`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(new Uint8Array(arrayBuffer)).toString("base64");
  const contentType = response.headers.get("content-type") || "image/jpeg";
  return `data:${contentType};base64,${base64}`;
}

export async function POST(req: NextRequest) {
  const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-line-signature");

    if (!CHANNEL_SECRET || !CHANNEL_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
    }

    if (!verifySignature(rawBody, signature, CHANNEL_SECRET)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const events = body.events || [];
    if (events.length === 0) return NextResponse.json({ status: "ok" });

    const { firestore } = initializeFirebase();
    if (!firestore) return NextResponse.json({ error: "No DB" }, { status: 500 });

    for (const event of events) {
      const lineUserId = event.source.userId;
      
      // Paywall Check: Ensure at least one merchant is active (simplified for prototype)
      const merchantsRef = collection(firestore, "merchants");
      const merchantSnap = await getDocs(query(merchantsRef, limit(1)));
      const merchantData = !merchantSnap.empty ? merchantSnap.docs[0].data() : null;
      const merchantId = !merchantSnap.empty ? merchantSnap.docs[0].id : null;
      
      const isSubscribed = merchantData?.subscriptionStatus === "active";

      if (event.type === "message" && event.message.type === "image") {
        if (!isSubscribed) {
          await replyToLine(event.replyToken, "【お知らせ】現在、当ショップのサービスがメンテナンス中、または利用制限されています。管理者へお問い合わせください。", CHANNEL_ACCESS_TOKEN);
          continue;
        }

        try {
          const imageDataUri = await getLineImage(event.message.id, CHANNEL_ACCESS_TOKEN);
          const aiResult = await extractInspectionDateFromImage({ imageDataUri });

          if (aiResult.inspectionDate && merchantId) {
            const vehiclesRef = collection(firestore, "merchants", merchantId, "vehicles");
            await addDoc(vehiclesRef, {
              merchantId,
              merchantOwnerId: merchantData.ownerId,
              lineUserId,
              inspectionDate: aiResult.inspectionDate,
              status: "Upcoming",
              createdAt: serverTimestamp(),
            });
            await replyToLine(event.replyToken, `登録完了しました！満了日は【${aiResult.inspectionDate}】です。`, CHANNEL_ACCESS_TOKEN);
          }
        } catch (e) {
          await replyToLine(event.replyToken, "画像の解析に失敗しました。", CHANNEL_ACCESS_TOKEN);
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
