import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/init';
import { collection, addDoc, serverTimestamp, query, getDocs, limit } from 'firebase/firestore';
import { extractInspectionDateFromImage } from '@/ai/flows/extract-inspection-date-from-image-flow';
import crypto from 'crypto';

const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;

function verifySignature(body: string, signature: string | null): boolean {
  if (!CHANNEL_SECRET || !signature) return false;
  const hash = crypto
    .createHmac('SHA256', CHANNEL_SECRET)
    .update(body)
    .digest('base64');
  return hash === signature;
}

async function getLineImage(messageId: string): Promise<string> {
  if (!CHANNEL_ACCESS_TOKEN) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not configured');
  }

  const response = await fetch(`https://api-data.line.me/v2/bot/message/${messageId}/content`, {
    headers: {
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('LINE Content API Error:', errorText);
    throw new Error('Failed to fetch image from LINE');
  }
  
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const contentType = response.headers.get('content-type') || 'image/jpeg';
  return `data:${contentType};base64,${base64}`;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-line-signature');

    if (!verifySignature(rawBody, signature)) {
      console.error('Invalid LINE signature');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const events = body.events || [];
    const { firestore } = initializeFirebase();

    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'image') {
        const lineUserId = event.source.userId;
        const messageId = event.message.id;

        try {
          const imageDataUri = await getLineImage(messageId);
          const aiResult = await extractInspectionDateFromImage({ imageDataUri });

          if (aiResult.inspectionDate) {
            const merchantsRef = collection(firestore, 'merchants');
            const merchantSnap = await getDocs(query(merchantsRef, limit(1)));
            
            if (!merchantSnap.empty) {
              const merchantDoc = merchantSnap.docs[0];
              const merchantData = merchantDoc.data();

              const vehiclesRef = collection(firestore, 'merchants', merchantDoc.id, 'vehicles');
              await addDoc(vehiclesRef, {
                id: `v_${Date.now()}`,
                merchantId: merchantDoc.id,
                merchantOwnerId: merchantData.ownerId,
                lineUserId: lineUserId,
                inspectionDate: aiResult.inspectionDate,
                status: 'Upcoming',
                plateNumber: 'Pending Verification',
                modelName: aiResult.isCertificate ? 'Vehicle Certificate' : 'Inspection Sticker',
                createdAt: serverTimestamp(),
              });
            }
          }
        } catch (procError: any) {
          console.error(`Error processing message ${messageId}:`, procError.message);
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Webhook Global Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
