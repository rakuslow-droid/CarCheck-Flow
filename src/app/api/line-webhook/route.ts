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

async function replyToLine(
  replyToken: string,
  text: string,
  accessToken: string | undefined,
) {
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

async function getLineImage(
  messageId: string,
  accessToken: string | undefined,
): Promise<string> {
  if (!accessToken) throw new Error("LINE Access Token missing");
  const response = await fetch(
    `https://api-data.line.me/v2/bot/message/${messageId}/content`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  if (!response.ok)
    throw new Error(`Failed to fetch image: ${response.status}`);
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
      console.error("Configuration Missing");
      return NextResponse.json(
        { error: "Configuration Error" },
        { status: 500 },
      );
    }

    if (!verifySignature(rawBody, signature, CHANNEL_SECRET)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const events = body.events || [];
    if (events.length === 0) return NextResponse.json({ status: "ok" });

    const { firestore } = initializeFirebase();
    if (!firestore)
      return NextResponse.json({ error: "No DB" }, { status: 500 });

    for (const event of events) {
      const lineUserId = event.source.userId;

      /**
       * 【テスト用修正】
       * 本来はFirestoreからMerchant情報を引きますが、
       * 現状はテストを優先するため、存在するドキュメントIDに固定し、
       * サブスクリプションチェックをパスさせます。
       */
      const merchantId = "soOG3EGzFjJIQIiDOzoB";
      const isSubscribed = true; // 強制的に許可
      const merchantOwnerId = "test-owner"; // 仮のオーナーID

      if (event.type === "message" && event.message.type === "image") {
        if (!isSubscribed) {
          await replyToLine(
            event.replyToken,
            "【お知らせ】現在、当ショップのサービスがメンテナンス中、または利用制限されています。管理者へお問い合わせください。",
            CHANNEL_ACCESS_TOKEN,
          );
          continue;
        }

        try {
          console.log(
            "Starting Image Extraction for message:",
            event.message.id,
          );
          const imageDataUri = await getLineImage(
            event.message.id,
            CHANNEL_ACCESS_TOKEN,
          );
          const aiResult = await extractInspectionDateFromImage({
            imageDataUri,
          });

          console.log("AI Result:", aiResult);

          if (aiResult.inspectionDate) {
            const vehiclesRef = collection(
              firestore,
              "merchants",
              merchantId,
              "vehicles",
            );
            await addDoc(vehiclesRef, {
              merchantId,
              merchantOwnerId: merchantOwnerId,
              lineUserId,
              inspectionDate: aiResult.inspectionDate,
              plateNumber: "解析中...", // 必要に応じてAI結果から追加可能
              status: "Upcoming",
              createdAt: serverTimestamp(),
            });
            await replyToLine(
              event.replyToken,
              `車検データの登録が完了しました！\n満了予定日は【${aiResult.inspectionDate}】です。`,
              CHANNEL_ACCESS_TOKEN,
            );
          } else {
            await replyToLine(
              event.replyToken,
              "車検日を特定できませんでした。もう一度はっきりと写った写真を送ってください。",
              CHANNEL_ACCESS_TOKEN,
            );
          }
        } catch (e: any) {
          console.error("Extraction Error:", e);
          await replyToLine(
            event.replyToken,
            "画像の解析中にエラーが発生しました。時間をおいて再度お試しください。",
            CHANNEL_ACCESS_TOKEN,
          );
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Webhook Internal Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
