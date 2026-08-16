'use client';

import { useState, useEffect, useCallback } from 'react';
import { IMessage, IMatch, IMessageReaction } from '@/types';
import { api } from '@/lib/api-client';
import { useSocketEvent } from './useSocket';

export function useChat(activeMatchId?: string) {
  const [matches, setMatches] = useState<IMatch[]>([]);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Load real matches from MongoDB
  const fetchMatches = useCallback(async () => {
    try {
      const data = await api.get('/api/matches');
      if (data && data.matches) {
        setMatches(data.matches);
      }
    } catch {
      // Ignore network hiccup
    }
  }, []);

  // Load real messages for current match
  const fetchMessages = useCallback(async (matchId: string) => {
    try {
      const data = await api.get(`/api/messages?matchId=${matchId}`);
      if (data && data.messages) {
        setMessages(data.messages);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Periodic match list refresh (every 5s)
  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 5000);
    return () => clearInterval(interval);
  }, [fetchMatches]);

  // Live real-time polling synchronization for active chat (every 1.2s)
  useEffect(() => {
    if (!activeMatchId) return;

    setIsLoading(true);
    fetchMessages(activeMatchId).finally(() => setIsLoading(false));

    const pollInterval = setInterval(() => {
      api.get(`/api/messages?matchId=${activeMatchId}`)
        .then((data) => {
          if (data && data.messages) {
            setMessages((prev) => {
              // Deep compare messages to avoid unnecessary state triggers
              const isDifferent =
                prev.length !== data.messages.length ||
                JSON.stringify(prev.map(m => ({ id: m._id, text: m.text, del: m.isDeleted, react: m.reactions }))) !==
                JSON.stringify(data.messages.map((m: any) => ({ id: m._id, text: m.text, del: m.isDeleted, react: m.reactions })));
              return isDifferent ? data.messages : prev;
            });
          }
        })
        .catch(() => {});
    }, 1200);

    return () => clearInterval(pollInterval);
  }, [activeMatchId, fetchMessages]);

  // Listen for real-time socket events
  useSocketEvent<IMessage>(`chat:${activeMatchId}`, (newMsg) => {
    if (newMsg && newMsg.matchId === activeMatchId) {
      setMessages((prev) => {
        if (prev.some((m) => m._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });
    }
  });

  useSocketEvent<{ messageId: string; reactions: IMessageReaction[] }>('chat:reaction', (payload) => {
    if (payload?.messageId) {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === payload.messageId ? { ...m, reactions: payload.reactions } : m
        )
      );
    }
  });

  useSocketEvent<{ messageId: string }>('chat:deleted', (payload) => {
    if (payload?.messageId) {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === payload.messageId
            ? { ...m, isDeleted: true, text: 'This message was deleted', mediaUrl: undefined, reactions: [] }
            : m
        )
      );
    }
  });

  useSocketEvent<{ match: IMatch }>('match:created', (data) => {
    if (data?.match) {
      setMatches((prev) => [data.match, ...prev]);
    }
  });

  const sendMessage = async (
    text: string,
    mediaUrl?: string,
    senderId: string = '',
    receiverId: string = ''
  ) => {
    if (!activeMatchId || !text.trim()) return;

    const tempMessage: IMessage = {
      _id: `temp_${Date.now()}`,
      matchId: activeMatchId,
      senderId,
      receiverId,
      text: text.trim(),
      mediaUrl,
      type: mediaUrl ? 'image' : 'text',
      read: false,
      isDeleted: false,
      reactions: [],
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    setMatches((prev) =>
      prev.map((m) =>
        m._id === activeMatchId
          ? { ...m, lastMessage: text, lastMessageAt: new Date().toISOString() }
          : m
      )
    );

    try {
      const data = await api.post('/api/messages', {
        matchId: activeMatchId,
        receiverId,
        text: text.trim(),
        mediaUrl,
      });

      if (data && data.message) {
        setMessages((prev) =>
          prev.map((m) => (m._id === tempMessage._id ? data.message : m))
        );
      }
    } catch (e) {
      console.error('Failed to send message:', e);
    }
  };

  const deleteMessage = async (messageId: string) => {
    // Optimistic delete
    setMessages((prev) =>
      prev.map((m) =>
        m._id === messageId
          ? { ...m, isDeleted: true, text: 'This message was deleted', mediaUrl: undefined, reactions: [] }
          : m
      )
    );

    try {
      await api.delete(`/api/messages?messageId=${messageId}`);
    } catch (e) {
      console.error('Failed to delete message:', e);
    }
  };

  const reactToMessage = async (messageId: string, emoji: string, userId: string = '') => {
    // Optimistic reaction toggle
    setMessages((prev) =>
      prev.map((m) => {
        if (m._id !== messageId) return m;
        const currentReactions = m.reactions || [];
        const existing = currentReactions.findIndex((r) => r.userId === userId && r.emoji === emoji);
        let updated: IMessageReaction[];
        if (existing > -1) {
          updated = currentReactions.filter((_, idx) => idx !== existing);
        } else {
          updated = [...currentReactions.filter((r) => r.userId !== userId), { userId, emoji }];
        }
        return { ...m, reactions: updated };
      })
    );

    try {
      const res = await api.post('/api/messages/react', { messageId, emoji });
      if (res && res.reactions) {
        setMessages((prev) =>
          prev.map((m) => (m._id === messageId ? { ...m, reactions: res.reactions } : m))
        );
      }
    } catch (e) {
      console.error('Failed to react to message:', e);
    }
  };

  return {
    matches,
    messages,
    isLoading,
    isTyping,
    sendMessage,
    deleteMessage,
    reactToMessage,
    refreshMatches: fetchMatches,
  };
}

export default useChat;
