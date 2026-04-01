'use client';

import { useState } from 'react';
import { UploadCloud, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

interface UploadDropzoneProps {
  onSuccess: (policyId: string, fileName: string) => void;
}

export function UploadDropzone({ onSuccess }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  async function processFile(file: File) {
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const response = await api.uploadPolicy(file);
      setIsUploading(false);
      onSuccess(response.id, file.name);
    } catch (err: unknown) {
      setIsUploading(false);
      setError(err instanceof Error ? err.message : 'Error uploading file.');
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            className="mb-4 p-4 rounded-xl bg-red-50 text-red-600 flex items-center gap-3 border border-red-100"
          >
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`relative group overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ${
          isDragging ? 'border-brand-500 bg-brand-50' : 'border-neutral-200 bg-white hover:border-brand-300 hover:bg-neutral-50/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="application/pdf"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        
        <div className="p-10 flex flex-col items-center justify-center text-center gap-4">
          <div className={`p-4 rounded-full transition-colors duration-300 ${isDragging ? 'bg-brand-100 text-brand-600' : 'bg-neutral-100 text-neutral-500 group-hover:bg-brand-50 group-hover:text-brand-500'}`}>
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-neutral-900">
              {isUploading ? 'Processing Document...' : 'Upload your Insurance Policy'}
            </h3>
            <p className="text-sm text-neutral-500 max-w-sm">
              {isUploading 
                ? 'Extracting text and generating semantic embeddings. This might take a moment.' 
                : 'Drag and drop your PDF here, or click to browse files. Max size 10MB.'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
