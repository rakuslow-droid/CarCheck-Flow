import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { extractInspectionDateFromImage } from '@/ai/flows/extract-inspection-date-from-image-flow';

const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

async function getLineImage(messageId: string): Promise<string> {
  if (!CHANNEL_ACCESS_TOKEN) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not configured');
  }

  const response = await fetch(`https://api-data.line.me/v2/bot/message/${messageId}/content`, {
    headers: {
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
  });

  if (!response.ok) throw new Error('Failed to fetch image from LINE');
  
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const contentType = response.headers.get('content-type') || 'image/jpeg';
  return `data:${contentType};base64,${base64}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const events = body.events || [];
    const { firestore } = initializeFirebase();

    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'image') {
        const lineUserId = event.source.userId;
        const messageId = event.message.id;

        // 1. Get image from LINE
        const imageDataUri = await getLineImage(messageId);

        // 2. Extract inspection data via AI
        const aiResult = await extractInspectionDateFromImage({ imageDataUri });

        if (aiResult.inspectionDate) {
          // Find the merchant this user is interacting with (mock logic for demo: using a default or finding first)
          // In a real app, you'd map the LINE Bot ID to a Merchant in Firestore
          const merchantsRef = collection(firestore, 'merchants');
          const merchantSnap = await getDocs(query(merchantsRef, limit(1)));
          
          if (!merchantSnap.empty) {
            const merchantDoc = merchantSnap.docs[0];
            const merchantData = merchantDoc.data();

            // 3. Save to the merchant's vehicles sub-collection
            const vehiclesRef = collection(firestore, 'merchants', merchantDoc.id, 'vehicles');
            await addDoc(vehiclesRef, {
              id: `v_${Date.now()}`,
              merchantId: merchantDoc.id,
              merchantOwnerId: merchantData.ownerId,
              lineUserId,
              inspectionDate: aiResult.inspectionDate,
              status: 'Healthy',
              plateNumber: 'Pending Analysis',
              modelName: aiResult.isCertificate ? 'Extracted from Certificate' : 'Extracted from Sticker',
              createdAt: serverTimestamp(),
            });
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    // Note: In production, use errorEmitter or logging service. 
    // Console log is used here for basic webhook debugging visibility.
    console.error('Webhook Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}