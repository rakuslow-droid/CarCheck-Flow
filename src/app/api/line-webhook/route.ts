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
} from "firebase/firestore";
import { extractInspectionDateFromImage } from "@/ai/flows/extract-inspection-date-from-image-flow";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * Helper to reply to LINE user
 */
async function replyToLine(
  replyToken: string,
  text: string,
  accessToken: string | undefined
) {
  if (!accessToken) return;
  try {
    const response = await fetch("https://api.line.me/v2/bot/message/reply", {
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
    if (!response.ok) {
      console.error("LINE API returned error:", await response.text());
    }
  } catch (error) {
    console.error("LINE Reply Error:", error);
  }
}

/**
 * Verifies the signature from LINE
 */
function verifySignature(body: string, signature: string | null, secret: string | undefined): boolean {
  if (!secret || !signature) return false;
  const hash = crypto.createHmac("SHA256", secret).update(body).digest("base64");
  return hash === signature;
}

/**
 * Fetches image binary from LINE and converts to Data URI
 */
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
      console.error("Critical: LINE environment variables are missing.");
      return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
    }

    if (!verifySignature(rawBody, signature, CHANNEL_SECRET)) {
      console.warn("Invalid LINE Signature received");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const events = body.events || [];
    if (events.length === 0) return NextResponse.json({ status: "ok" });

    const { firestore } = initializeFirebase();
    if (!firestore) {
      console.error("Firebase Firestore is not initialized.");
      return NextResponse.json({ error: "Database Unavailable" }, { status: 500 });
    }

    for (const event of events) {
      if (event.type === "message" && event.message.type === "image") {
        const { replyToken } = event;
        const lineUserId = event.source.userId;

        try {
          const imageDataUri = await getLineImage(event.message.id, CHANNEL_ACCESS_TOKEN);
          const aiResult = await extractInspectionDateFromImage({ imageDataUri });

          if (aiResult.inspectionDate) {
            // Find the merchant. In a real app, we might check a ref parameter from the follow event.
            // For this prototype, we'll fetch the first available merchant or one matching a logic.
            const merchantsRef = collection(firestore, "merchants");
            const merchantSnap = await getDocs(query(merchantsRef, limit(1)));

            if (!merchantSnap.empty) {
              const merchantDoc = merchantSnap.docs[0];
              const merchantData = merchantDoc.data();
              const shopName = merchantData.name || merchantData.displayName || "当ショップ";
              
              const vehiclesRef = collection(firestore, "merchants", merchantDoc.id, "vehicles");

              await addDoc(vehiclesRef, {
                merchantId: merchantDoc.id,
                merchantOwnerId: merchantData.ownerId,
                lineUserId,
                inspectionDate: aiResult.inspectionDate,
                status: "Upcoming",
                createdAt: serverTimestamp(),
              });

              const replyMessage = 
                `【${shopName}】公式LINEへのご登録ありがとうございます！\n\n` +
                `AI解析が完了しました！\n` +
                `車検満了日は【${aiResult.inspectionDate}】で登録されました。\n\n` +
                `時期が近づきましたら、こちらからリマインドをお送りいたします。どうぞ安心してお待ちください！\n\n` +
                `▼登録情報の確認はこちら\n` +
                `https://carcheck-flow.web.app/status/${lineUserId}`;

              await replyToLine(replyToken, replyMessage, CHANNEL_ACCESS_TOKEN);
            } else {
              await replyToLine(replyToken, "店舗情報の登録が完了していないため、車両情報を登録できませんでした。", CHANNEL_ACCESS_TOKEN);
            }
          } else {
            await replyToLine(replyToken, "申し訳ありません。画像から車検日を読み取ることができませんでした。もう一度、はっきりと写った写真を送っていただけますか？", CHANNEL_ACCESS_TOKEN);
          }
        } catch (error: any) {
          console.error("Error processing LINE image:", error);
          await replyToLine(replyToken, "画像の解析中にエラーが発生しました。しばらくしてから再度お試しください。", CHANNEL_ACCESS_TOKEN);
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Webhook critical error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
