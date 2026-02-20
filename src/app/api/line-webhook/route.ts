import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/init';
import { collection, addDoc, serverTimestamp, query, getDocs, limit } from 'firebase/firestore';
import { extractInspectionDateFromImage } from '@/ai/flows/extract-inspection-date-from-image-flow';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;

function verifySignature(body: string, signature: string | null): boolean {
  if (!CHANNEL_SECRET || !signature) {
    console.error('Missing CHANNEL_SECRET or signature for verification');
    return false;
  }
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

    if (!verifySignature(rawBody, signature)) {
      console.error('Invalid LINE signature or verification failed');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const events = body.events || [];
    
    // Initialize Firebase only if we have events to process
    if (events.length === 0) {
      return NextResponse.json({ status: 'no events' });
    }

    const { firestore } = initializeFirebase();
    if (!firestore || !firestore.type) {
       console.error('Firestore failed to initialize in webhook');
       return new NextResponse('Internal Server Error: Database Unavailable', { status: 500 });
    }

    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'image') {
        const lineUserId = event.source.userId;
        const messageId = event.message.id;

        try {
          const imageDataUri = await getLineImage(messageId);
          const aiResult = await extractInspectionDateFromImage({ imageDataUri });

          if (aiResult.inspectionDate) {
            const merchantsRef = collection(firestore, 'merchants');
            // In a real app, we'd look up the merchant by LINE Channel ID or similar.
            // For this prototype, we'll use the first merchant found.
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
              console.log(`Successfully processed vehicle for user ${lineUserId}`);
            } else {
              console.warn('No merchant found to associate vehicle data with.');
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
    return new NextResponse(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
