import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      transcriptions: true,
      payments: { where: { status: 'completed' } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.transcriptions.length >= 2 && user.payments.length === 0) {
    return NextResponse.json({ error: 'Payment required' }, { status: 402 });
  }

  const formData = await request.formData();
  const audio = formData.get('audio') as File;

  if (!audio) {
    return NextResponse.json(
      { error: 'No audio file provided' },
      { status: 400 },
    );
  }

  try {
    const audioBuffer = await audio.arrayBuffer();

    const response = await fetch(
      'https://api-inference.huggingface.co/models/openai/whisper-large-v3',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
          'Content-Type': audio.type || 'audio/wav',
        },
        body: audioBuffer,
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Hugging Face API error: ${response.status} - ${errorText}` },
        { status: 503 },
      );
    }

    const transcription = await response.json();
    const transcriptionText =
      transcription.text || 'No transcription available';

    const newTranscription = await prisma.transcription.create({
      data: {
        content: transcriptionText,
        userId: user.id,
      },
    });

    return NextResponse.json(newTranscription);
  } catch (error) {
    return NextResponse.json(
      { error: `Transcription failed: ${error}` },
      { status: 500 },
    );
  }
}
