import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Real-time notification hook for activators.
 * Subscribes to Alert entity changes and refreshes unread count.
 * Also triggers toast-style in-app notifications for new alerts.
 */
export function useActivatorNotifications({ userEmail, onNewAlert } = {}) {
  const queryClient = useQueryClient();
  const lastSeenRef = useRef(new Set());

  const handleNewAlert = useCallback((event) => {
    if (event.type === 'create' && event.data) {
      const alert = event.data;
      // Only handle alerts for this user
      if (alert.user_email !== userEmail) return;
      // Avoid duplicate notifications
      if (lastSeenRef.current.has(alert.id)) return;
      lastSeenRef.current.add(alert.id);

      // Refresh alert queries
      queryClient.invalidateQueries({ queryKey: ['alerts', userEmail] });
      queryClient.invalidateQueries({ queryKey: ['unreadAlerts', userEmail] });

      // Callback for in-app toast
      if (onNewAlert) onNewAlert(alert);
    }
  }, [userEmail, queryClient, onNewAlert]);

  useEffect(() => {
    if (!userEmail) return;
    const unsubscribe = base44.entities.Alert.subscribe(handleNewAlert);
    return () => unsubscribe();
  }, [userEmail, handleNewAlert]);
}