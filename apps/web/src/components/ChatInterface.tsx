'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { Send, User, Bot, Loader2, Info, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { content: string; similarity: number; page?: number; section?: string }[];
}

interface ChatInterfaceProps {
  policyId: string;
  fileName: string;
}

export function ChatInterface({ policyId, fileName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [selectedSource, setSelectedSource] = useState<NonNullable<Message['sources']>[number] | null>(null);

  // Load from API on mount or policyId change
  useEffect(() => {
    let isMounted = true;
    
    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const history = await api.getPolicyMessages(policyId);
        if (isMounted) {
          if (history.length === 0) {
            setMessages([
              {
                id: 'greeting',
                role: 'assistant',
                content: `Hello! I'm ready to answer questions about your policy **${fileName}**. What would you like to know?`,
              }
            ]);
          } else {
            setMessages(history);
          }
        }
      } catch (e) {
        console.error('Failed to load chat history', e);
        if (isMounted) {
          setMessages([
            {
              id: 'greeting',
              role: 'assistant',
              content: `Hello! I'm ready to answer questions about your policy **${fileName}**. What would you like to know?`,
            }
          ]);
        }
      } finally {
        if (isMounted) setIsLoadingHistory(false);
      }
    };
    
    fetchHistory();

    return () => { isMounted = false; };
  }, [policyId, fileName]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: userMsg };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await api.queryRag({
        question: userMsg,
        policyId: policyId,
      });

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.answer,
          sources: response.sources,
        }
      ]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get a response.';
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `⚠️ Error: ${errorMessage}`,
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* Chat header */}
      <div className="bg-neutral-50 border-b border-neutral-100 p-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-neutral-900">Policy Chat</h2>
          <p className="text-xs text-neutral-500">Asking context from {fileName}</p>
        </div>
        <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex gap-1.5 items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Ready
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 bg-neutral-50/30">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                msg.role === 'user' ? 'bg-brand-600 text-white' : 'bg-neutral-800 text-white'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              
              <div className={`flex flex-col gap-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-brand-600 text-white rounded-tr-sm' 
                    : 'bg-white border border-neutral-200 text-neutral-800 rounded-tl-sm shadow-sm'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Sources Accordion/List for Assistant */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 text-left w-full">
                    <div className="text-xs font-semibold text-neutral-500 mb-2 flex items-center gap-1">
                      <Info size={12} /> Sources Referenced
                    </div>
                    <div className="flex flex-col gap-2">
                      {msg.sources.slice(0, 3).map((source, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedSource(source)}
                          className="bg-white border border-neutral-200 rounded-lg p-3 text-xs shadow-sm hover:border-brand-300 hover:shadow-md transition-all text-left group"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="font-medium text-brand-600">
                              Page {source.page || '?'} {source.section && `• ${source.section}`}
                              <span className="text-neutral-400 font-normal ml-2">Match: {(source.similarity * 100).toFixed(1)}%</span>
                            </div>
                            <ExternalLink size={10} className="text-neutral-300 group-hover:text-brand-400" />
                          </div>
                          <p className="text-neutral-600 line-clamp-2 italic">&quot;{source.content}&quot;</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
            <div className="shrink-0 w-8 h-8 rounded-full bg-neutral-800 text-white flex items-center justify-center shadow-sm">
              <Bot size={16} />
            </div>
            <div className="bg-white border border-neutral-200 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-neutral-400 animate-spin" />
              <span className="text-sm text-neutral-500">Analyzing policy context...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-neutral-100">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative max-w-4xl mx-auto flex items-center gap-3"
        >
          <div className="flex-1 flex items-center bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-1.5 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all min-h-[56px]">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask a question about the policy..."
              className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 resize-none py-2 text-sm max-h-[160px] leading-relaxed"
              rows={1}
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="shrink-0 h-14 px-6 bg-brand-600 text-white rounded-2xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium shadow-sm transition-all active:scale-[0.98]"
          >
            <Send size={18} className="mr-2" />
            Send
          </button>
        </form>
        <p className="text-center text-[10px] text-neutral-400 mt-3 font-medium">
          Insurance Policy AI can make mistakes. Verify critical coverage details.
        </p>
      </div>

      {/* Source Detail Modal */}
      <AnimatePresence>
        {selectedSource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-neutral-200 w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
                <div>
                  <h3 className="font-semibold text-neutral-900">Source Context</h3>
                  <div className="text-xs text-neutral-500 flex gap-2 items-center mt-1">
                    <span className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded-md font-medium">Page {selectedSource.page || '?'}</span>
                    <span>•</span>
                    <span>Match Probability: {(selectedSource.similarity * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedSource(null)}
                  className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-100">
                  <p className="text-neutral-800 text-sm leading-relaxed whitespace-pre-wrap italic">
                    &quot;{selectedSource.content}&quot;
                  </p>
                </div>
                {selectedSource.section && (
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Section</h4>
                    <p className="text-sm text-neutral-700 font-medium">{selectedSource.section}</p>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-neutral-100 flex justify-end bg-neutral-50">
                <button
                  onClick={() => setSelectedSource(null)}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
