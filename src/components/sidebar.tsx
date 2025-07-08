'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

type Transcription = {
  id: string;
  content: string;
  createdAt: string;
  name?: string;
};

type Props = {
  transcriptions: Transcription[];
  setTranscriptionsAction: (t: Transcription[]) => void;
  selectedId: string | null;
  setSelectedIdAction: (id: string) => void;
};

export function Sidebar({
  transcriptions,
  setTranscriptionsAction,
  selectedId,
  setSelectedIdAction,
}: Props) {
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;
  }, [user]);

  const handleNewTranscription = () => {
    const newTranscription = {
      id: `temp-${Date.now()}`,
      content: '',
      createdAt: new Date().toISOString(),
      name: 'New Transcription',
    };
    setTranscriptionsAction([newTranscription, ...transcriptions]);
    setSelectedIdAction(newTranscription.id);
  };

  return (
    <div className={'w-100 flex flex-col p-4'}>
      <Card
        className={
          'flex-1 shadow-none max-h-[calc(100vh-40px)] overflow-hidden'
        }
      >
        <CardHeader className={'flex justify-between items-center'}>
          <CardTitle className={'text-2xl'}>Transcriptions</CardTitle>
          <Button
            variant={'outline'}
            onClick={handleNewTranscription}
            className={'flex items-center gap-1 text-lg'}
          >
            <PlusCircle className={'w-4 h-4'} />
            New
          </Button>
        </CardHeader>
        <CardContent className={'h-full'}>
          <ScrollArea className={'h-full overflow-y-auto'}>
            {transcriptions.length === 0 ? (
              <p className={'text-gray-500'}>No transcriptions yet.</p>
            ) : (
              transcriptions.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedIdAction(t.id)}
                  className={`p-3 rounded-md mb-2 cursor-pointer hover:bg-gray-100 ${
                    selectedId === t.id ? 'bg-blue-100' : ''
                  }`}
                >
                  <p className={'text-lg font-medium line-clamp-1'}>
                    {t.name || t.content}
                  </p>
                  <p className={'text-xs text-gray-500'}>
                    {new Date(t.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
