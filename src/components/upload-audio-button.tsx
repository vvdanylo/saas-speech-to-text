'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export default function UploadAudioButton({
  onFileSelectAction,
}: {
  onFileSelectAction: (file: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    onFileSelectAction(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsProcessing(false);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type={"file"}
        accept={"audio/*"}
        onChange={handleUpload}
        disabled={isProcessing}
        className={"hidden"}
        id={"audio-upload"}
      />
      <Button
        asChild
        variant={"outline"}
        disabled={isProcessing}
        className={'text-lg mt-auto'}
      >
        <label htmlFor={"audio-upload"}>
          <Upload />
          {isProcessing ? 'Processing...' : 'Upload Audio'}
        </label>
      </Button>
    </div>
  );
}
