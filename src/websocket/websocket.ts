import WebSocket from "ws";

import shared from "../shared";
import logger from "../utils/logger";

import type { Server } from "http";
import type { Request } from "express";

import type { IUser, ExecuteResult } from "../utils/database";
import { querySingle, executeUpdateSafe } from "../utils/database";

/*interface PendingRequest {
  [key: string]: CallableFunction;
}*/

export interface CustomWebSocket extends WebSocket {
  userId?: ExecuteResult;
  user?: IUser;
  /*pendingRequests?: PendingRequest;*/
}

enum PayloadType {
  CLIENT_MESSAGE = 1,
  SERVER_MESSAGE = 2,
  CLIENT_PRIVATE_MESSAGE = 3,
  SERVER_PRIVATE_MESSAGE = 4,
  CLIENT_USER_DATA = 5,
  SERVER_USER_DATA = 6,
}

interface ClientMessage {
  type: PayloadType.CLIENT_MESSAGE;
  message: string;
}

interface ServerMessage {
  type: PayloadType.SERVER_MESSAGE;
  userId: ExecuteResult;
  message: string;
  timestamp: string;
}

interface ClientPrivateMessage {
  type: PayloadType.CLIENT_PRIVATE_MESSAGE;
  receiverId: ExecuteResult;
  message: string;
}

interface ServerPrivateMessage {
  type: PayloadType.SERVER_PRIVATE_MESSAGE;
  senderId: ExecuteResult;
  message: string;
  timestamp: string;
}

interface ClientUserData {
  type: PayloadType.CLIENT_USER_DATA;
  userId: ExecuteResult;
}

interface ServerUserData {
  type: PayloadType.SERVER_USER_DATA;
  userId: ExecuteResult;
  displayname: string;
  color: string;
  timestamp: string;
}

const clients = new Map<ExecuteResult, CustomWebSocket>();

export const initializeWebSocket = (server: Server, sessionMiddleware: any) => {
  const wss = new WebSocket.Server({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    sessionMiddleware(request, {}, () => {
      wss.handleUpgrade(request, socket, head, (ws: CustomWebSocket) => {
        wss.emit("connection", ws, request);
      });
    });
  });

  wss.on("connection", (ws: CustomWebSocket, req: Request) => {
    const userId = req.session.userId;
    if (!userId) {
      return ws.close();
    }

    const user = querySingle<IUser>("SELECT id, displayname, color FROM users WHERE id = ?", [userId]);
    if (!user) {
      return ws.close();
    }

    if (user.isOnline || !executeUpdateSafe("UPDATE users SET isOnline = 1 WHERE id = ?", [userId])) {
      return ws.close();
    }

    ws.userId = userId;
    ws.user = user;

    clients.set(userId, ws);

    ws.on("close", () => {
      if (!executeUpdateSafe("UPDATE users SET isOnline = 0 WHERE id = ?", [userId])) {
        logger.error(`Failed to set user ${userId} offline`);
      }

      clients.delete(userId);
    });
  });

  return wss;
};