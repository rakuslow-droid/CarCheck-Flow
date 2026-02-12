
import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { extractInspectionDateFromImage } from '@/ai/flows/extract-inspection-date-from-image-flow';

const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

async function getLineImage(messageId: string): Promise<string> {
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

    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'image') {
        const lineUserId = event.source.userId;
        const messageId = event.message.id;

        // 1. Get image data from LINE
        const imageDataUri = await getLineImage(messageId);

        // 2. Extract date using Genkit AI Flow
        const aiResult = await extractInspectionDateFromImage({ imageDataUri });

        if (aiResult.inspectionDate) {
          // 3. Save to Firestore
          const { firestore } = initializeFirebase();
          await addDoc(collection(firestore, 'vehicles'), {
            lineUserId,
            inspectionDate: aiResult.inspectionDate,
            createdAt: serverTimestamp(),
            status: 'Healthy', // Default status
            source: 'LINE_IMAGE_EXTRACTION'
          });
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
