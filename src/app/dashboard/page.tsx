'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserButton } from '@clerk/nextjs';
import { Sidebar } from '@/components/sidebar';
import { TranscriptionArea } from '@/components/transcription-area';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

type Transcription = {
  id: string;
  content: string;
  createdAt: string;
  name?: string;
};

export default function Dashboard() {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchTranscriptions = useCallback(async () => {
    const res = await fetch('/api/transcriptions');
    const data = await res.json();
    const sorted = data.sort(
      (a: Transcription, b: Transcription) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    setTranscriptions(sorted);
    if (sorted.length > 0 && !selectedId) setSelectedId(sorted[0].id);
  }, [selectedId]);

  useEffect(() => {
    fetchTranscriptions().then();
  }, [fetchTranscriptions]);

  return (
    <div className={"flex min-h-screen bg-gray-50"}>
      <Sidebar
        transcriptions={transcriptions}
        setTranscriptionsAction={setTranscriptions}
        selectedId={selectedId}
        setSelectedIdAction={setSelectedId}
      />
      <div className={"flex-1 flex flex-col p-4"}>
        <Card className={"border-b "}>
          <CardHeader className={"flex justify-between items-center"}>
            <CardTitle className={"text-2xl"}>Voice-to-Text Dashboard</CardTitle>
            <UserButton />
          </CardHeader>
        </Card>
        <TranscriptionArea
          transcriptions={transcriptions}
          setTranscriptionsAction={setTranscriptions}
          selectedId={selectedId}
          setSelectedIdAction={setSelectedId}
        />
      </div>
    </div>
  );
}
