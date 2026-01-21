export interface PendingConnection {
  type: 'create' | 'join';
  roomName: string;
  name: string; // hostName or playerName
}

export const PendingConnections: Record<string, PendingConnection> = {};
