/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  User, 
  Bot, 
  ChevronRight, 
  ExternalLink, 
  MessageSquare, 
  ShieldCheck, 
  Truck, 
  HelpCircle,
  ArrowLeft,
  Sparkles,
  Headphones
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { getGeminiResponse } from './services/geminiService';
import { cn } from './utils';

type Message = {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
};

const QUICK_ACTIONS = [
  { id: 'purity', label: 'Product Purity', icon: ShieldCheck, prompt: 'Tell me about the purity of your Methylene Blue.' },
  { id: 'shipping', label: 'Shipping Info', icon: Truck, prompt: 'How long does shipping take?' },
  { id: 'usage', label: 'How to Use', icon: HelpCircle, prompt: 'How do I use the Methylene Blue powder?' },
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "Hello! I'm your CZTL Assistant. How can I help you today with our Ultra High Purity Methylene Blue?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const ADVANCED_SUPPORT_URL = "https://ranchoddas.app.n8n.cloud/webhook/efaf4a6c-e1c2-479e-bbc5-c299251ef83a/chat";

  const handleOpenAdvancedSupport = () => {
    window.open(ADVANCED_SUPPORT_URL, '_blank', 'noopener,noreferrer');
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role as 'user' | 'model',
          parts: [{ text: m.text }]
        }));

      const response = await getGeminiResponse(text, history);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response || "I'm sorry, I couldn't process that. Would you like to speak with our advanced support?",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);

      // Simple heuristic to suggest advanced support
      if (
        text.toLowerCase().includes('order') || 
        text.toLowerCase().includes('track') || 
        text.toLowerCase().includes('human') ||
        text.toLowerCase().includes('refund')
      ) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 2).toString(),
          role: 'system',
          text: "It sounds like you might need advanced assistance. Would you like to connect with our specialized support agent in a new tab?",
          timestamp: new Date(),
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F9FAFB] font-sans text-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">CZTL Support</h1>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">AI Assistant</p>
          </div>
        </div>
        <button 
          onClick={handleOpenAdvancedSupport}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-all shadow-lg shadow-black/5"
        >
          <Headphones className="w-4 h-4" />
          Advanced Support
        </button>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-8 md:px-0">
        <div className="max-w-3xl mx-auto space-y-8">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4",
                  message.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                  message.role === 'user' ? "bg-gray-200" : "bg-black"
                )}>
                  {message.role === 'user' ? <User className="w-5 h-5 text-gray-600" /> : <Bot className="w-5 h-5 text-white" />}
                </div>
                
                <div className={cn(
                  "flex flex-col gap-2 max-w-[80%]",
                  message.role === 'user' ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "px-5 py-3 rounded-2xl text-sm leading-relaxed",
                    message.role === 'user' 
                      ? "bg-black text-white rounded-tr-none" 
                      : message.role === 'system'
                        ? "bg-emerald-50 border border-emerald-100 text-emerald-900 italic"
                        : "bg-white border border-gray-100 shadow-sm rounded-tl-none"
                  )}>
                    <div className="markdown-body prose prose-sm max-w-none">
                      <Markdown>{message.text}</Markdown>
                    </div>
                    {message.role === 'system' && (
                      <button 
                        onClick={handleOpenAdvancedSupport}
                        className="mt-3 flex items-center gap-1 text-xs font-bold text-emerald-700 uppercase tracking-widest hover:underline"
                      >
                        Open Advanced Support <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium px-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex gap-1 items-center px-5 py-3 bg-white border border-gray-100 rounded-2xl rounded-tl-none shadow-sm">
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Quick Actions & Input */}
      <footer className="bg-white border-t border-gray-100 p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length < 4 && (
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleSend(action.prompt)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-all whitespace-nowrap"
                >
                  <action.icon className="w-3.5 h-3.5" />
                  {action.label}
                </button>
              ))}
            </div>
          )}
          
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all text-sm"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2.5 bg-black text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-800 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] text-center text-gray-400 font-medium uppercase tracking-widest">
            Powered by CZTL AI • <a href="https://cztl.bz" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 underline">Visit Website</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
