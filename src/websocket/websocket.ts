import WebSocket from "ws";

import shared from "../shared";
import logger from "../utils/logger";

import type { Server } from "http";
import type { Request } from "express";

import type { ExecuteResult, IUser } from "../utils/database";
import { querySingle, executeInsertSafe } from "../utils/database";
import type { IError } from "../app";
import { isIError } from "../app";
import { timestamp } from "../utils/timestamp";

/*interface PendingRequest {
  [key: string]: CallableFunction;
}*/

export interface CustomWebSocket extends WebSocket {
  userId: ExecuteResult;
  /*pendingRequests?: PendingRequest;*/
}

export enum PayloadType {
  SERVER_CLOSE = 0,
  CLIENT_MESSAGE = 1,
  SERVER_MESSAGE = 2,
  CLIENT_PRIVATE_MESSAGE = 3,
  SERVER_PRIVATE_MESSAGE = 4,
  CLIENT_USER_DATA = 5,
  SERVER_USER_DATA = 6,
  WELCOME = 7,
}

type PayloadTypeParams = {
  [PayloadType.SERVER_CLOSE]: [];
  [PayloadType.CLIENT_MESSAGE]: [string];
  [PayloadType.SERVER_MESSAGE]: [ExecuteResult, string, string];
  [PayloadType.CLIENT_PRIVATE_MESSAGE]: [ExecuteResult, string];
  [PayloadType.SERVER_PRIVATE_MESSAGE]: [ExecuteResult, string, string];
  [PayloadType.CLIENT_USER_DATA]: [ExecuteResult];
  [PayloadType.SERVER_USER_DATA]: [ExecuteResult, string, string, string];
  [PayloadType.WELCOME]: [ExecuteResult, string, string];
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

interface Welcome {
  type: PayloadType.WELCOME;
  userId: ExecuteResult;
  displayname: string;
  color: string;
}

const clients = new Map<ExecuteResult, CustomWebSocket>();

const closeConnection = (ws: CustomWebSocket) => {
  ws.send(JSON.stringify([PayloadType.SERVER_CLOSE]));
  ws.close();
}

export const initializeWebSocket = (server: Server, sessionMiddleware: any) => {
  const wss = new WebSocket.Server({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    sessionMiddleware(request, {}, () => {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    });
  });

  wss.on("connection", (ws: CustomWebSocket, req: Request) => {
    const userId = req.session.userId;
    if (!userId) {
      return closeConnection(ws);
    }

    const user = querySingle<IUser>("SELECT id, displayname, color FROM users WHERE id = ?", [userId]);
    if (!user) {
      return closeConnection(ws);
    }

    ws.userId = userId;

    clients.set(userId, ws);

    sendMessage(PayloadType.WELCOME, [userId, user.displayname!, user.color!], userId);

    ws.on("message", (message: string) => {
      messageHandler(ws.userId, message);
    });

    ws.on("close", () => {
      clients.delete(userId);
    });
  });

  return wss;
};

const isPayloadOfType = <T extends PayloadType>(type: T, payload: any[]): payload is PayloadTypeParams[T] => {
  const isBigInt = (value: any): value is bigint => typeof value === "bigint";
  switch (type) {
    case PayloadType.CLIENT_MESSAGE:
      return payload.length === 1 && typeof payload[0] === "string";
    case PayloadType.CLIENT_PRIVATE_MESSAGE:
      return payload.length === 2 &&
        isBigInt(payload[0]) &&
        typeof payload[1] === "string";
    case PayloadType.CLIENT_USER_DATA:
      return payload.length === 1 && isBigInt(payload[0]);
    case PayloadType.SERVER_MESSAGE:
      return payload.length === 3 &&
        isBigInt(payload[0]) &&
        typeof payload[1] === "string" &&
        typeof payload[2] === "string";
    case PayloadType.SERVER_PRIVATE_MESSAGE:
      return payload.length === 3 &&
          isBigInt(payload[0]) &&
          typeof payload[1] === "string" &&
          typeof payload[2] === "string";
    case PayloadType.SERVER_USER_DATA:
      return payload.length === 4 &&
        isBigInt(payload[0]) &&
        typeof payload[1] === "string" &&
        typeof payload[2] === "string" &&
        typeof payload[3] === "string";
    case PayloadType.WELCOME:
      return payload.length === 3 &&
        isBigInt(payload[0]) &&
        typeof payload[1] === "string" &&
        typeof payload[2] === "string";
    default:
      return false;
  }
};

const messageHandler = (userId: bigint, message: string): (boolean | IError) => {
  const data = JSON.parse(message) as [PayloadType, ...any[]];
  const [type, ...payload] = data;

  if (!isPayloadOfType(type, payload)) {
    logger.error("Invalid Payload", message);
    return { message: "Invalid Payload" };
  }
  
  switch (type) {
    case PayloadType.CLIENT_MESSAGE: {
      const result = handleRequestClientMessage(userId, payload as PayloadTypeParams[PayloadType.CLIENT_MESSAGE]);
      if (isIError(result)) {
        return result;
      }
      break;
    }
    case PayloadType.CLIENT_PRIVATE_MESSAGE: {
      const [ receiverId, message ] = payload as PayloadTypeParams[PayloadType.CLIENT_PRIVATE_MESSAGE];
      break;
    }
    case PayloadType.CLIENT_USER_DATA: {
      const typedPayload = payload as PayloadTypeParams[PayloadType.CLIENT_USER_DATA];
      break;
    }
    default: {
      return { message: "Invalid Payload" };
    }
  }

  return true;
};

const handleRequestClientMessage = (userId: ExecuteResult, payload: PayloadTypeParams[PayloadType.CLIENT_MESSAGE]): (boolean | IError) => {
  const [ message ] = payload;

  const snowflake = timestamp(userId);

  if (!executeInsertSafe("INSERT INTO messages (sender, content, timestamp) VALUES (?, ?, ?)", [userId, message, snowflake])) {
    return { message: "Error Sending Message" };
  }

  if (!sendMessage(PayloadType.SERVER_MESSAGE, [userId, message, snowflake])) {
    return { message: "Error Sending Message" };
  }

  return true;
}

export function sendMessage<T extends PayloadType>(type: T, params: PayloadTypeParams[T], userId?: ExecuteResult): boolean {
  if (!userId) {
    for (const [, client] of clients) {
      client.send(JSON.stringify([type, ...params]));
    }
    return true;
  }
  const client = clients.get(userId);
  if (!client) return false;

  client.send(JSON.stringify([type, ...params]));
  return true;
}