'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import UploadAudioButton from '@/components/upload-audio-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { showErrorToast, showSuccessToast } from '@/lib/toastsUtils';
import PaymentModal from '@/components/payment-modal';

type Transcription = {
  id: string;
  content: string;
  createdAt: string;
  name?: string;
};

interface IProps {
  transcriptions: Transcription[];
  setTranscriptionsAction: React.Dispatch<
    React.SetStateAction<Transcription[]>
  >;
  selectedId: string | null;
  setSelectedIdAction: (id: string) => void;
}

export function TranscriptionArea({
  transcriptions,
  setTranscriptionsAction,
  selectedId,
  setSelectedIdAction,
}: IProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const selected = transcriptions.find((t) => t.id === selectedId);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
  };

  const handleTranscribe = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('audio', selectedFile);

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.error) {
        if (data.error === 'Payment required') {
          setIsPaymentModalOpen(true);
        } else {
          showErrorToast({ message: data.error });
        }
      } else {
        const updated = {
          ...data,
          name:
            data.content.length > 30
              ? `${data.content.slice(0, 30)}...`
              : data.content,
        };
        setTranscriptionsAction((prev: Transcription[]) => {
          const withoutTemp = prev.filter((t) => !t.id.startsWith('temp-'));
          return [updated, ...withoutTemp];
        });
        setSelectedIdAction(updated.id);
        showSuccessToast({ message: 'Transcription completed.' });
      }
    } catch {
      showErrorToast({ message: 'Failed to process transcription' });
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
    }
  };

  const hasUploadCard = !selected || selected.id.startsWith('temp-');

  return (
    <div className={'flex-1 pt-8'}>
      <div
        className={`grid gap-4 ${hasUploadCard ? 'grid-cols-2' : 'grid-cols-1'}`}
      >
        {hasUploadCard ? (
          <Card className={'flex flex-col'}>
            <CardHeader
              className={'flex flex-row items-center justify-between'}
            >
              <CardTitle className={'text-2xl'}>Import Your Audio</CardTitle>
              <UploadAudioButton onFileSelectAction={handleFileSelect} />
            </CardHeader>
            <CardContent className={'flex flex-col flex-1'}>
              {selectedFile && (
                <div className={'mt-auto'}>
                  <Button
                    onClick={handleTranscribe}
                    disabled={isLoading}
                    className={'text-white text-lg w-full'}
                  >
                    Transcribe
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className={'text-2xl'}>Transcription</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className={'flex items-center justify-center h-20'}>
                <Loader2 className={'h-10 w-10 animate-spin text-gray-500'} />
              </div>
            ) : selected ? (
              <CardContent className={'text-xl'}>
                <p>{selected.content}</p>
              </CardContent>
            ) : (
              <p className={'text-gray-500'}>No transcription selected.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onCloseAction={() => setIsPaymentModalOpen(false)}
        onPaymentSuccessAction={() => {
          setIsPaymentModalOpen(false);
          showSuccessToast({ message: 'Payment successful' });
        }}
      />
    </div>
  );
}
