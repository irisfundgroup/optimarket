import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { t } from '@/lib/i18n';
import { format } from 'date-fns';

export default function Messages() {
  const [selectedConv, setSelectedConv] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['myMessages', user?.email],
    queryFn: () => base44.entities.ChatMessage.filter({ sender_email: user?.email }, '-created_date', 100),
    enabled: !!user?.email,
  });

  const { data: received = [] } = useQuery({
    queryKey: ['receivedMessages', user?.email],
    queryFn: () => base44.entities.ChatMessage.filter({ receiver_email: user?.email }, '-created_date', 100),
    enabled: !!user?.email,
  });

  const allMessages = [...messages, ...received].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  // Group by conversation partner
  const conversations = {};
  allMessages.forEach(msg => {
    const partner = msg.sender_email === user?.email ? msg.receiver_email : msg.sender_email;
    const partnerName = msg.sender_email === user?.email ? (msg.receiver_email) : (msg.sender_name || msg.sender_email);
    if (!conversations[partner]) {
      conversations[partner] = { email: partner, name: partnerName, messages: [], lastMessage: msg };
    }
    conversations[partner].messages.push(msg);
  });

  const convList = Object.values(conversations).sort((a, b) => new Date(b.lastMessage.created_date) - new Date(a.lastMessage.created_date));

  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatMessage.create(data),
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['myMessages'] });
    },
  });

  const handleSend = () => {
    if (!newMessage.trim() || !selectedConv) return;
    sendMutation.mutate({
      sender_email: user.email,
      sender_name: user.full_name,
      receiver_email: selectedConv,
      message: newMessage,
      conversation_id: [user.email, selectedConv].sort().join('_'),
    });
  };

  const activeMessages = selectedConv ? (conversations[selectedConv]?.messages || []).sort((a, b) => new Date(a.created_date) - new Date(b.created_date)) : [];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-6 h-6 text-blue-500" />
        <h1 className="text-2xl font-bold text-slate-900">{t('messages')}</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex" style={{ height: '70vh' }}>
        {/* Conversations list */}
        <div className={`w-full md:w-80 border-r border-slate-200 overflow-y-auto ${selectedConv ? 'hidden md:block' : ''}`}>
          {convList.map(conv => (
            <button
              key={conv.email}
              onClick={() => setSelectedConv(conv.email)}
              className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${selectedConv === conv.email ? 'bg-orange-50' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                  {conv.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900 truncate">{conv.name}</p>
                  <p className="text-xs text-slate-500 truncate">{conv.lastMessage.message}</p>
                </div>
              </div>
            </button>
          ))}
          {convList.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">{t('no_results')}</div>
          )}
        </div>

        {/* Chat area */}
        <div className={`flex-1 flex flex-col ${!selectedConv ? 'hidden md:flex' : 'flex'}`}>
          {selectedConv ? (
            <>
              <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                <button onClick={() => setSelectedConv(null)} className="md:hidden text-slate-500 text-sm">← Retour</button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xs">
                  {selectedConv[0]?.toUpperCase()}
                </div>
                <span className="font-medium text-sm">{conversations[selectedConv]?.name || selectedConv}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender_email === user?.email ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.sender_email === user?.email
                        ? 'bg-orange-500 text-white rounded-br-md'
                        : 'bg-slate-100 text-slate-900 rounded-bl-md'
                    }`}>
                      {msg.message}
                      <span className="block text-[10px] mt-1 opacity-60">
                        {format(new Date(msg.created_date), 'HH:mm')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-slate-200 flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('type_message')}
                  className="rounded-xl"
                />
                <Button onClick={handleSend} className="bg-orange-500 hover:bg-orange-600 rounded-xl">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              <MessageCircle className="w-8 h-8 mr-2 opacity-50" />
              Sélectionnez une conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}