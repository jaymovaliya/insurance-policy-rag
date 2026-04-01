'use client';

import { useState } from 'react';
import { UploadDropzone } from '@/components/UploadDropzone';
import { ChatInterface } from '@/components/ChatInterface';
import { motion } from 'framer-motion';
import { FileText, ArrowRight } from 'lucide-react';

export default function Home() {
  const [activePolicy, setActivePolicy] = useState<{ id: string; name: string } | null>(null);

  const handleUploadSuccess = (policyId: string, fileName: string) => {
    setActivePolicy({ id: policyId, name: fileName });
  };

  return (
    <div className="flex flex-col h-full items-center justify-center py-10 w-full max-w-5xl mx-auto flex-1">
      {!activePolicy ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full flex flex-col items-center gap-8"
        >
          <div className="text-center space-y-4 max-w-2xl">
            <div className="inline-flex items-center justify-center p-3 bg-brand-50 rounded-2xl mb-2">
              <FileText className="w-8 h-8 text-brand-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
              Understand policies instantly.
            </h1>
            <p className="text-lg text-neutral-500">
              Upload any insurance policy PDF and our AI will extract the context to answer your coverage questions with exact source citations.
            </p>
          </div>

          <UploadDropzone onSuccess={handleUploadSuccess} />
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-center">
            <div className="p-6 rounded-2xl bg-white border border-neutral-100 shadow-sm">
              <h3 className="font-semibold text-neutral-900 mb-2">1. Upload PDF</h3>
              <p className="text-sm text-neutral-500">Securely ingest your document into the pgvector database.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-neutral-100 shadow-sm">
              <h3 className="font-semibold text-neutral-900 mb-2">2. Intelligent Chunking</h3>
              <p className="text-sm text-neutral-500">Text is parsed and turned into OpenAI embeddings natively.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-neutral-100 shadow-sm">
              <h3 className="font-semibold text-neutral-900 mb-2">3. Ask Questions</h3>
              <p className="text-sm text-neutral-500">Semantic RAG retrieves exact context to combat hallucinations.</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full h-[85vh] md:h-[80vh] flex flex-col"
        >
          <button 
            onClick={() => setActivePolicy(null)}
            className="mb-4 text-sm font-medium text-neutral-500 hover:text-neutral-900 flex items-center transition-colors self-start"
          >
            <ArrowRight size={16} className="mr-1 rotate-180" />
            Upload a different policy
          </button>
          
          <ChatInterface policyId={activePolicy.id} fileName={activePolicy.name} />
        </motion.div>
      )}
    </div>
  );
}
