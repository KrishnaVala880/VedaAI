import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';

interface Client {
  id: string;
  ws: WebSocket;
  assignmentId?: string;
}

export class WebSocketManager {
  private static instance: WebSocketManager;
  private wss: WebSocketServer;
  private clients: Map<string, Client> = new Map();

  private constructor(server: http.Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws) => {
      const id = uuidv4();
      this.clients.set(id, { id, ws });

      ws.on('message', (raw) => {
        try {
          const msg = JSON.parse(raw.toString());
          if (msg.type === 'subscribe' && msg.assignmentId) {
            const client = this.clients.get(id);
            if (client) {
              client.assignmentId = msg.assignmentId;
            }
          }
        } catch (e) {
          // ignore bad messages
        }
      });

      ws.on('close', () => {
        this.clients.delete(id);
      });

      ws.on('error', () => {
        this.clients.delete(id);
      });

      // Send confirmation
      ws.send(JSON.stringify({ type: 'connected', clientId: id }));
    });
  }

  static getInstance(server?: http.Server): WebSocketManager {
    if (!WebSocketManager.instance) {
      if (!server) throw new Error('Server needed for first init');
      WebSocketManager.instance = new WebSocketManager(server);
    }
    return WebSocketManager.instance;
  }

  // Send message to all clients watching a specific assignment
  sendToAssignment(assignmentId: string, data: any) {
    this.clients.forEach((client) => {
      if (
        client.assignmentId === assignmentId &&
        client.ws.readyState === WebSocket.OPEN
      ) {
        client.ws.send(JSON.stringify(data));
      }
    });
  }
}