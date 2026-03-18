import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bell, TrendingUp, Crown, X, CheckCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useActivatorNotifications } from '@/hooks/useActivatorNotifications';
import { motion, AnimatePresence } from 'framer-motion';

export default function ActivatorNotificationBell({ user }) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const queryClient = useQueryClient();

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts', user?.email],
    queryFn: () => base44.entities.Alert.filter({ user_email: user?.email }, '-created_date', 30),
    enabled: !!user?.email,
    refetchInterval: 20000,
  });

  const unread = alerts.filter(a => !a.is_read);

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Alert.update(id, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', user?.email] });
      queryClient.invalidateQueries({ queryKey: ['unreadAlerts', user?.email] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      for (const a of unread) {
        await base44.entities.Alert.update(a.id, { is_read: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', user?.email] });
      queryClient.invalidateQueries({ queryKey: ['unreadAlerts', user?.email] });
    },
  });

  const handleNewAlert = useCallback((alert) => {
    setToast(alert);
    setTimeout(() => setToast(null), 5000);
  }, []);

  useActivatorNotifications({ userEmail: user?.email, onNewAlert: handleNewAlert });

  const recentAlerts = alerts.filter(a =>
    a.type === 'opportunity' || a.is_vip
  );

  return (
    <>
      {/* Bell Button */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="relative p-2.5 rounded-xl transition-all"
          style={{
            color: open ? '#fbbf24' : '#64748b',
            background: open ? 'rgba(245,158,11,0.1)' : 'transparent',
          }}
        >
          <Bell className="w-5 h-5" />
          {unread.length > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] text-white flex items-center justify-center font-black"
              style={{ background: '#ef4444', border: '2px solid #060c18' }}
            >
              {unread.length > 9 ? '9+' : unread.length}
            </span>
          )}
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden"
              style={{ background: '#0f1a2e', border: '1px solid rgba(245,158,11,0.2)' }}
            >
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="font-bold text-white text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4 text-orange-400" /> Notifications
                  {unread.length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">{unread.length}</span>
                  )}
                </p>
                <div className="flex items-center gap-1">
                  {unread.length > 0 && (
                    <button onClick={() => markAllReadMutation.mutate()} className="text-[10px] text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 flex items-center gap-1">
                      <CheckCheck className="w-3 h-3" /> Tout lire
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/5">
                    <X className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {recentAlerts.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    <Bell className="w-6 h-6 mx-auto mb-2 opacity-30" />
                    Aucune notification
                  </div>
                ) : (
                  recentAlerts.map(alert => (
                    <div
                      key={alert.id}
                      className="px-4 py-3 hover:bg-white/4 transition-colors cursor-pointer"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: !alert.is_read ? 'rgba(245,158,11,0.05)' : 'transparent' }}
                      onClick={() => !alert.is_read && markReadMutation.mutate(alert.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: alert.is_vip ? 'rgba(251,146,60,0.2)' : 'rgba(16,185,129,0.15)' }}>
                          {alert.is_vip ? <Crown className="w-4 h-4 text-orange-400" /> : <TrendingUp className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white leading-tight">{alert.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{alert.message}</p>
                          <p className="text-[10px] text-slate-600 mt-1">{format(new Date(alert.created_date), 'dd/MM · HH:mm')}</p>
                        </div>
                        {!alert.is_read && <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0 mt-1" />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-24 right-4 z-50 max-w-xs rounded-2xl shadow-2xl p-4"
            style={{ background: '#0f1a2e', border: '1px solid rgba(245,158,11,0.3)' }}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: toast.is_vip ? 'rgba(251,146,60,0.2)' : 'rgba(16,185,129,0.15)' }}>
                {toast.is_vip ? <Crown className="w-4 h-4 text-orange-400" /> : <TrendingUp className="w-4 h-4 text-emerald-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white leading-tight">{toast.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="p-0.5 hover:bg-white/5 rounded">
                <X className="w-3 h-3 text-slate-500" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}