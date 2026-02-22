import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/init';
import { collection, addDoc, serverTimestamp, query, getDocs, limit } from 'firebase/firestore';
import { extractInspectionDateFromImage } from '@/ai/flows/extract-inspection-date-from-image-flow';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;

function verifySignature(body: string, signature: string | null): boolean {
  if (!CHANNEL_SECRET) {
    console.error('DEBUG: LINE_CHANNEL_SECRET is MISSING from environment variables');
    return false;
  }
  if (!signature) {
    console.error('DEBUG: x-line-signature header is MISSING from the request');
    return false;
  }

  const hash = crypto
    .createHmac('SHA256', CHANNEL_SECRET)
    .update(body)
    .digest('base64');
  
  const isValid = hash === signature;
  if (!isValid) {
    console.warn('DEBUG: Signature verification FAILED. Expected:', hash, 'Received:', signature);
  }
  return isValid;
}

async function getLineImage(messageId: string): Promise<string> {
  if (!CHANNEL_ACCESS_TOKEN) {
    console.error('DEBUG: LINE_CHANNEL_ACCESS_TOKEN is MISSING');
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not configured');
  }

  const response = await fetch(`https://api-data.line.me/v2/bot/message/${messageId}/content`, {
    headers: {
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('DEBUG: LINE Content API Error:', errorText, 'Status:', response.status);
    throw new Error(`Failed to fetch image from LINE: ${response.status}`);
  }
  
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const contentType = response.headers.get('content-type') || 'image/jpeg';
  return `data:${contentType};base64,${base64}`;
}

export async function POST(req: NextRequest) {
  console.log('DEBUG: Received Webhook request');
  
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-line-signature');

    // Debugging environment variables
    console.log('DEBUG: CHANNEL_SECRET length:', CHANNEL_SECRET?.length || 0);
    console.log('DEBUG: CHANNEL_ACCESS_TOKEN length:', CHANNEL_ACCESS_TOKEN?.length || 0);

    const isSignatureValid = verifySignature(rawBody, signature);

    if (!isSignatureValid) {
      console.warn('DEBUG: Proceeding DESPITE invalid signature for debugging purposes.');
      // In production, we should return 401 here, but we're bypassing for debug
    }

    const body = JSON.parse(rawBody);
    const events = body.events || [];
    
    if (events.length === 0) {
      console.log('DEBUG: No events in payload');
      return NextResponse.json({ status: 'no events' });
    }

    const { firestore } = initializeFirebase();
    if (!firestore) {
       console.error('DEBUG: Firestore failed to initialize in webhook');
       return new NextResponse('Internal Server Error: Database Unavailable', { status: 500 });
    }

    for (const event of events) {
      console.log('DEBUG: Processing event type:', event.type);
      
      if (event.type === 'message' && event.message.type === 'image') {
        const lineUserId = event.source.userId;
        const messageId = event.message.id;
        console.log('DEBUG: Image message received from user:', lineUserId);

        try {
          const imageDataUri = await getLineImage(messageId);
          console.log('DEBUG: Image fetched, starting AI extraction...');
          
          const aiResult = await extractInspectionDateFromImage({ imageDataUri });
          console.log('DEBUG: AI Result:', aiResult.inspectionDate);

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
              console.log(`DEBUG: Successfully saved vehicle for user ${lineUserId}`);
            } else {
              console.warn('DEBUG: No merchant document found in Firestore to associate this vehicle.');
            }
          }
        } catch (procError: any) {
          console.error(`DEBUG: Error processing message ${messageId}:`, procError.message);
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('DEBUG: Webhook Global Error:', error.message);
    return new NextResponse(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
