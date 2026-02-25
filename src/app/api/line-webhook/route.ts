import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/init';
import { collection, addDoc, serverTimestamp, query, getDocs, limit } from 'firebase/firestore';
import { extractInspectionDateFromImage } from '@/ai/flows/extract-inspection-date-from-image-flow';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * Verifies the signature of the request from LINE to ensure it's authentic.
 */
function verifySignature(body: string, signature: string | null, secret: string | undefined): boolean {
  if (!secret) {
    console.error('DEBUG: CHANNEL_SECRET is missing or undefined.');
    return false;
  }
  
  if (!signature) {
    console.error('DEBUG: x-line-signature header is missing.');
    return false;
  }

  const hash = crypto
    .createHmac('SHA256', secret)
    .update(body)
    .digest('base64');
  
  console.log(`DEBUG: Incoming Signature: ${signature}`);
  console.log(`DEBUG: Generated Hash: ${hash}`);
  
  return hash === signature;
}

/**
 * Fetches the image content from LINE Messaging API.
 */
async function getLineImage(messageId: string, accessToken: string | undefined): Promise<string> {
  if (!accessToken) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not configured');
  }

  const response = await fetch(`https://api-data.line.me/v2/bot/message/${messageId}/content`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
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
  const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;

  // Debug: Log variable availability with extra detail for troubleshooting
  console.log(`DEBUG: Final Check - Secret Length: ${CHANNEL_SECRET?.length || 0}, Prefix: ${CHANNEL_SECRET?.substring(0, 2) || 'XX'}...`);
  console.log(`DEBUG: Token Status - Length: ${CHANNEL_ACCESS_TOKEN?.length || 0}, Prefix: ${CHANNEL_ACCESS_TOKEN?.substring(0, 2) || 'XX'}...`);

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-line-signature');

    // Strict signature verification
    if (!verifySignature(rawBody, signature, CHANNEL_SECRET)) {
      console.warn('DEBUG: Signature verification failed. Returning 401.');
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
          const imageDataUri = await getLineImage(messageId, CHANNEL_ACCESS_TOKEN);
          
          // Extract date using Genkit AI flow
          const aiResult = await extractInspectionDateFromImage({ imageDataUri });

          if (aiResult.inspectionDate) {
            // Find the first merchant to associate the vehicle
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
              console.log(`DEBUG: Successfully added vehicle for User: ${lineUserId}`);
            } else {
              console.warn('DEBUG: No merchant found to associate vehicle with.');
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
