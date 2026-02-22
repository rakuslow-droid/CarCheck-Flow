import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/init';
import { collection, addDoc, serverTimestamp, query, getDocs, limit } from 'firebase/firestore';
import { extractInspectionDateFromImage } from '@/ai/flows/extract-inspection-date-from-image-flow';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;

/**
 * Verifies the signature of the request from LINE to ensure it's authentic.
 */
function verifySignature(body: string, signature: string | null): boolean {
  if (!CHANNEL_SECRET || !signature) {
    return false;
  }

  const hash = crypto
    .createHmac('SHA256', CHANNEL_SECRET)
    .update(body)
    .digest('base64');
  
  return hash === signature;
}

/**
 * Fetches the image content from LINE Messaging API.
 */
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
    throw new Error(`Failed to fetch image from LINE: ${response.status}`);
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

    // Restore strict signature verification
    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const events = body.events || [];
    
    if (events.length === 0) {
      return NextResponse.json({ status: 'no events' });
    }

    const { firestore } = initializeFirebase();
    if (!firestore) {
       return NextResponse.json({ error: 'Database Unavailable' }, { status: 500 });
    }

    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'image') {
        const lineUserId = event.source.userId;
        const messageId = event.message.id;

        try {
          // Fetch image from LINE
          const imageDataUri = await getLineImage(messageId);
          
          // Extract date using Genkit AI flow
          const aiResult = await extractInspectionDateFromImage({ imageDataUri });

          if (aiResult.inspectionDate) {
            // Find the first merchant to associate the vehicle (Prototyping logic)
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
          console.error(`Error processing LINE message ${messageId}:`, procError.message);
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Webhook Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
