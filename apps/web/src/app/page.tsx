'use client';

import { useState, useEffect } from 'react';
import { UploadDropzone } from '@/components/UploadDropzone';
import { ChatInterface } from '@/components/ChatInterface';
import { motion } from 'framer-motion';
import { FileText, Plus, MessageSquare, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import type { PolicyMetadata } from '@repo/types';

export default function Home() {
  const [activePolicy, setActivePolicy] = useState<{ id: string; name: string } | null>(null);
  const [policies, setPolicies] = useState<PolicyMetadata[]>([]);
  const [loadingPolicies, setLoadingPolicies] = useState(true);

  const loadPolicies = async () => {
    try {
      setLoadingPolicies(true);
      const data = await api.getPolicies();
      setPolicies(data);
    } catch (error) {
      console.error('Failed to load policies:', error);
    } finally {
      setLoadingPolicies(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const handleUploadSuccess = (policyId: string, fileName: string) => {
    setActivePolicy({ id: policyId, name: fileName });
    loadPolicies();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this policy and its chat history?')) return;
    
    try {
      await api.deletePolicy(id);
      localStorage.removeItem(`chat_history_${id}`);
      if (activePolicy?.id === id) {
        setActivePolicy(null);
      }
      loadPolicies();
    } catch (error) {
      console.error('Failed to delete policy:', error);
      alert('Failed to delete policy');
    }
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] w-full gap-6">
      {/* Sidebar List */}
      <div className="w-72 hidden md:flex flex-col bg-white rounded-2xl border border-neutral-200 overflow-hidden shrink-0 shadow-sm">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900 text-sm">Chat History</h2>
          <button 
            onClick={loadPolicies}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-md hover:bg-neutral-100 transition-colors"
            title="Refresh policies"
          >
            <RefreshCw size={14} className={loadingPolicies ? 'animate-spin' : ''} />
          </button>
        </div>
        
        <div className="p-4">
          <button 
            onClick={() => setActivePolicy(null)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-xl transition-colors font-medium text-sm shadow-sm border border-brand-200/50"
          >
            <Plus size={16} />
            New Upload
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {loadingPolicies ? (
            <div className="flex justify-center p-4">
              <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
            </div>
          ) : policies.length === 0 ? (
            <div className="text-center p-4 text-xs text-neutral-500">
              No policies uploaded yet.
            </div>
          ) : (
            policies.map((policy) => (
              <div 
                key={policy.id}
                onClick={() => setActivePolicy({ id: policy.id, name: policy.fileName })}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer group transition-colors ${
                  activePolicy?.id === policy.id 
                    ? 'bg-neutral-100 text-neutral-900 border border-neutral-200/60 shadow-sm' 
                    : 'text-neutral-600 hover:bg-neutral-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare size={16} className={activePolicy?.id === policy.id ? 'text-brand-600' : 'text-neutral-400'} />
                  <div className="truncate flex flex-col">
                    <span className="text-sm font-medium truncate">{policy.fileName}</span>
                    <span className="text-[10px] text-neutral-400">{new Date(policy.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button 
                  onClick={(e) => handleDelete(policy.id, e)}
                  className={`p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${
                    activePolicy?.id === policy.id ? 'opacity-100' : ''
                  }`}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full flex flex-col bg-white rounded-2xl md:border md:border-neutral-200 md:shadow-sm overflow-hidden">
        {!activePolicy ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full flex flex-col items-center gap-8 max-w-3xl"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-3 bg-brand-50 rounded-2xl mb-2">
                  <FileText className="w-8 h-8 text-brand-600" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
                  Understand policies instantly.
                </h1>
                <p className="text-lg text-neutral-500 max-w-xl mx-auto">
                  Upload an insurance policy PDF to start a new chat, or select a previous policy from the sidebar.
                </p>
              </div>

              <UploadDropzone onSuccess={handleUploadSuccess} />
            </motion.div>
          </div>
        ) : (
          <motion.div 
            key={activePolicy.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 overflow-hidden flex flex-col"
          >
            <div className="md:hidden p-4 border-b border-neutral-100 flex items-center justify-between shrink-0">
               <button 
                  onClick={() => setActivePolicy(null)}
                  className="text-sm text-brand-600 font-medium hover:underline"
               >
                  &larr; Back to uploads
               </button>
               <span className="text-sm font-medium truncate max-w-[200px]">{activePolicy.name}</span>
            </div>
            {/* Embedded Chat Interface, but without the border since it's already wrapped if desired.
                Actually ChatInterface has its own border, let's keep it. */}
            <div className="flex-1 h-full overflow-hidden">
              <ChatInterface policyId={activePolicy.id} fileName={activePolicy.name} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
