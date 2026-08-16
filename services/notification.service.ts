import { INotification } from '@/types';
import socketManager from '@/lib/socket';

class NotificationService {
  private notifications: Map<string, INotification[]> = new Map();

  send(notification: Omit<INotification, 'id' | 'createdAt' | 'read'>): INotification {
    const fullNotification: INotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };

    if (!this.notifications.has(notification.userId)) {
      this.notifications.set(notification.userId, []);
    }

    this.notifications.get(notification.userId)!.unshift(fullNotification);
    socketManager.emit(`notification:${notification.userId}`, fullNotification);

    return fullNotification;
  }

  getUserNotifications(userId: string): INotification[] {
    return this.notifications.get(userId) || [];
  }

  markAsRead(userId: string, notificationId: string): void {
    const list = this.notifications.get(userId);
    if (list) {
      const found = list.find((n) => n.id === notificationId);
      if (found) found.read = true;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
