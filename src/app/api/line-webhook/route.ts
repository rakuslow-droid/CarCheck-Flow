import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, limit } from 'firebase/firestore';
import { extractInspectionDateFromImage } from '@/ai/flows/extract-inspection-date-from-image-flow';
import crypto from 'crypto';

const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;

/**
 * Verifies the signature from LINE to ensure the request is authentic.
 */
function verifySignature(body: string, signature: string | null): boolean {
  if (!CHANNEL_SECRET || !signature) return false;
  const hash = crypto
    .createHmac('SHA256', CHANNEL_SECRET)
    .update(body)
    .digest('base64');
  return hash === signature;
}

/**
 * Fetches the binary content of an image message from LINE and converts it to a Data URI.
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

    // 1. Verify Webhook Signature
    if (!verifySignature(rawBody, signature)) {
      console.error('Invalid LINE signature');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const events = body.events || [];
    const { firestore } = initializeFirebase();

    for (const event of events) {
      // We only care about image messages
      if (event.type === 'message' && event.message.type === 'image') {
        const lineUserId = event.source.userId;
        const messageId = event.message.id;

        console.log(`Processing image from user: ${lineUserId}`);

        try {
          // 2. Fetch image content from LINE
          const imageDataUri = await getLineImage(messageId);

          // 3. Analyze image with Gemini AI
          const aiResult = await extractInspectionDateFromImage({ imageDataUri });

          if (aiResult.inspectionDate) {
            // 4. Find the merchant to associate this vehicle with
            // In this prototype, we'll associate it with the first merchant found
            const merchantsRef = collection(firestore, 'merchants');
            const merchantSnap = await getDocs(query(merchantsRef, limit(1)));
            
            if (!merchantSnap.empty) {
              const merchantDoc = merchantSnap.docs[0];
              const merchantData = merchantDoc.data();

              // 5. Save to the merchant's vehicles sub-collection
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

              console.log(`Successfully saved vehicle for user ${lineUserId} with date ${aiResult.inspectionDate}`);
            } else {
              console.warn('No merchant found to associate vehicle data.');
            }
          } else {
            console.warn('AI could not extract a valid inspection date from the image.');
          }
        } catch (procError: any) {
          console.error(`Error processing event for message ${messageId}:`, procError.message);
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Webhook Global Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
