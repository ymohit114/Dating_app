// Real-time communication abstraction (Event emitter & client WebSocket sync)

type SocketEventListener = (data: any) => void;

class SocketManager {
  private listeners: Map<string, Set<SocketEventListener>> = new Map();

  subscribe(event: string, callback: SocketEventListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (e) {
          console.error(`Socket event error for "${event}":`, e);
        }
      });
    }

    // Also dispatch on window in browser environment for cross-component sync
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(`socket:${event}`, { detail: data }));
    }
  }
}

export const socketManager = new SocketManager();
export default socketManager;
