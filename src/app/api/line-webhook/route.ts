import { NextRequest, NextResponse } from "next/server";
import { initializeFirebase } from "@/firebase/init";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  getDocs,
  limit,
} from "firebase/firestore";
import { extractInspectionDateFromImage } from "@/ai/flows/extract-inspection-date-from-image-flow";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * LINEにメッセージを返信する関数
 */
async function replyToLine(
  replyToken: string,
  text: string,
  accessToken: string | undefined,
) {
  if (!accessToken) {
    console.error("DEBUG: Cannot reply. Access Token is missing.");
    return;
  }

  try {
    const response = await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        replyToken: replyToken,
        messages: [{ type: "text", text: text }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("DEBUG: LINE Reply Error:", errorData);
    }
  } catch (error) {
    console.error("DEBUG: Fetch error during LINE reply:", error);
  }
}

/**
 * LINEのリクエスト署名を検証する
 */
function verifySignature(
  body: string,
  signature: string | null,
  secret: string | undefined,
): boolean {
  if (!secret || !signature) return false;
  const hash = crypto
    .createHmac("SHA256", secret)
    .update(body)
    .digest("base64");
  return hash === signature;
}

/**
 * LINEから画像バイナリを取得しBase64 Data URIに変換する
 */
async function getLineImage(
  messageId: string,
  accessToken: string | undefined,
): Promise<string> {
  if (!accessToken) throw new Error("LINE_CHANNEL_ACCESS_TOKEN is missing");
  const response = await fetch(
    `https://api-data.line.me/v2/bot/message/${messageId}/content`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  if (!response.ok)
    throw new Error(`Failed to fetch image: ${response.status}`);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const contentType = response.headers.get("content-type") || "image/jpeg";
  return `data:${contentType};base64,${base64}`;
}

export async function POST(req: NextRequest) {
  const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-line-signature");

    if (!verifySignature(rawBody, signature, CHANNEL_SECRET)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const events = body.events || [];
    if (events.length === 0) return NextResponse.json({ status: "no events" });

    const { firestore } = initializeFirebase();
    if (!firestore)
      return NextResponse.json({ error: "DB Unavailable" }, { status: 500 });

    for (const event of events) {
      if (event.type === "message") {
        const replyToken = event.replyToken;

        // 画像が送られてきた場合
        if (event.message.type === "image") {
          const messageId = event.message.id;
          const lineUserId = event.source.userId;

          try {
            console.log("DEBUG: Image received, fetching from LINE...");
            const imageDataUri = await getLineImage(
              messageId,
              CHANNEL_ACCESS_TOKEN,
            );

            console.log("DEBUG: Starting AI extraction...");
            const aiResult = await extractInspectionDateFromImage({
              imageDataUri,
            });

            console.log("DEBUG: AI Result:", aiResult);

            if (aiResult.inspectionDate) {
              const merchantsRef = collection(firestore, "merchants");
              const merchantSnap = await getDocs(query(merchantsRef, limit(1)));

              if (!merchantSnap.empty) {
                const merchantDoc = merchantSnap.docs[0];
                const vehiclesRef = collection(
                  firestore,
                  "merchants",
                  merchantDoc.id,
                  "vehicles",
                );
                await addDoc(vehiclesRef, {
                  id: `v_${Date.now()}`,
                  merchantId: merchantDoc.id,
                  lineUserId,
                  inspectionDate: aiResult.inspectionDate,
                  status: "Upcoming",
                  createdAt: serverTimestamp(),
                });

                await replyToLine(
                  replyToken,
                  `車検日（${aiResult.inspectionDate}）を登録しました！`,
                  CHANNEL_ACCESS_TOKEN,
                );
              }
            } else {
              await replyToLine(
                replyToken,
                "画像を解析しましたが、車検日が見つかりませんでした。",
                CHANNEL_ACCESS_TOKEN,
              );
            }
          } catch (e: any) {
            console.error("Processing Error:", e.message);
            await replyToLine(
              replyToken,
              "申し訳ありません、画像の処理中にエラーが発生しました。",
              CHANNEL_ACCESS_TOKEN,
            );
          }
        }
        // テキストが送られてきた場合（テスト用）
        else if (event.message.type === "text") {
          await replyToLine(
            replyToken,
            `「${event.message.text}」ですね！車検ステッカーの写真を送ってください。`,
            CHANNEL_ACCESS_TOKEN,
          );
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Webhook Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
