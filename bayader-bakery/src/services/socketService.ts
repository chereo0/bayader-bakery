import { io, Socket } from 'socket.io-client';

// Socket.IO connects to the root URL, not the API path
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_URL.replace('/api', '');

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('[SocketService] Already connected');
      return;
    }

    console.log('[SocketService] Connecting to', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      auth: {
        token
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts
    });

    this.socket.on('connect', () => {
      console.log('[SocketService] Connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('connected', (data) => {
      console.log('[SocketService] Connection confirmed:', data);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[SocketService] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[SocketService] Connection error:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[SocketService] Max reconnection attempts reached');
      }
    });

    this.socket.on('error', (error) => {
      console.error('[SocketService] Socket error:', error);
    });

    // Set up forwarding for registered listeners
    this.socket.onAny((event, ...args) => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.forEach(callback => {
          try {
            callback(...args);
          } catch (error) {
            console.error(`[SocketService] Error in listener for ${event}:`, error);
          }
        });
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      console.log('[SocketService] Disconnecting');
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    console.log(`[SocketService] Listener added for: ${event}`);
  }

  off(event: string, callback?: Function): void {
    if (!callback) {
      // Remove all listeners for this event
      this.listeners.delete(event);
      console.log(`[SocketService] All listeners removed for: ${event}`);
    } else {
      // Remove specific listener
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          this.listeners.delete(event);
        }
      }
      console.log(`[SocketService] Listener removed for: ${event}`);
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
      console.log(`[SocketService] Emitted: ${event}`, data);
    } else {
      console.warn('[SocketService] Cannot emit, socket not connected');
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  ping(): void {
    if (this.socket?.connected) {
      this.socket.emit('ping');
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();
