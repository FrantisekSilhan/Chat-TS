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

const MAX_CONNECTIONS_PER_USER = 3;

export enum PayloadType {
  SERVER_CLOSE = 0,
  CLIENT_MESSAGE = 1,
  SERVER_MESSAGE = 2,
  CLIENT_PRIVATE_MESSAGE = 3,
  SERVER_PRIVATE_MESSAGE = 4,
  CLIENT_USER_DATA = 5,
  SERVER_USER_DATA = 6,
  WELCOME = 7,
  SERVER_SUCCESSFUL_MESSAGE = 8,
  SERVER_ERROR_CLOSE = 9,
  SERVER_ERROR = 10,
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
  [PayloadType.SERVER_SUCCESSFUL_MESSAGE]: [string];
  [PayloadType.SERVER_ERROR_CLOSE]: [string];
  [PayloadType.SERVER_ERROR]: [string];
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

const clients = new Map<ExecuteResult, CustomWebSocket[]>();

const closeConnection = (ws: CustomWebSocket, message?: string) => {
  if (message) {
    ws.send(JSON.stringify([PayloadType.SERVER_ERROR_CLOSE, message]));
  } else {
    ws.send(JSON.stringify([PayloadType.SERVER_CLOSE]));
  }
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

    const existing = clients.get(userId);

    if (existing) {
      if (existing.length >= MAX_CONNECTIONS_PER_USER) {
        closeConnection(existing.shift()!, "Too Many Connections From User, Closing Oldest Connection");
      }
      existing.push(ws);
      clients.set(userId, existing);
    } else {
      clients.set(userId, [ws]);
    }

    sendMessageWS(PayloadType.WELCOME, [userId, user.displayname!, user.color!], ws);

    ws.on("message", (message: string) => {
      const result = messageHandler(ws, message);
      if (isIError(result)) {
        logger.error(JSON.stringify(result));
        sendMessageWS(PayloadType.SERVER_ERROR, [result.message], ws);
      }
    });

    ws.on("error", (err) => {
      logger.error(JSON.stringify(err));

      closeConnection(ws);
    });

    ws.on("close", () => {
      const userConnections = clients.get(userId);
      if (!userConnections) return;

      const index = userConnections.indexOf(ws);

      if (index < 0) return;

      userConnections.splice(index, 1);

      if (userConnections.length === 0) {
        clients.delete(userId);
        return;
      };
      
      clients.set(userId, userConnections);
    });
  });

  return wss;
};

const isPayloadOfType = <T extends PayloadType>(type: T, payload: any[]): payload is PayloadTypeParams[T] => {
  const isBigInt = (value: any): value is bigint => (typeof value === "bigint" || typeof value === "number");
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

const messageHandler = (ws: CustomWebSocket, message: string): (boolean | IError) => {
  const data = JSON.parse(message) as [PayloadType, ...any[]];
  const [type, ...payload] = data;

  if (!isPayloadOfType(type, payload)) {
    logger.error(JSON.stringify(["Invalid Payload", message]));
    return { message: "Invalid Payload" };
  }
  
  switch (type) {
    case PayloadType.CLIENT_MESSAGE: {
      const result = handleRequestClientMessage(ws, payload as PayloadTypeParams[PayloadType.CLIENT_MESSAGE]);
      if (isIError(result)) {
        return {...result, additional: type};
      }
      break;
    }
    case PayloadType.CLIENT_PRIVATE_MESSAGE: {
      const result = handleRequestClientPrivateMessage(ws, payload as PayloadTypeParams[PayloadType.CLIENT_PRIVATE_MESSAGE]);
      if (isIError(result)) {
        return {...result, additional: type};
      }
      break;
    }
    case PayloadType.CLIENT_USER_DATA: {
      const result = handleRequestClientUserData(ws, payload as PayloadTypeParams[PayloadType.CLIENT_USER_DATA])
      if (isIError(result)) {
        return {...result, additional: type};
      }
      break;
    }
    default: {
      return { message: "Invalid Payload" };
    }
  }

  return true;
};

const handleRequestClientMessage = (ws: CustomWebSocket, payload: PayloadTypeParams[PayloadType.CLIENT_MESSAGE]): (boolean | IError) => {
  const [ message ] = payload;
  const userId = ws.userId;

  const snowflake = timestamp(userId);

  if (!executeInsertSafe("INSERT INTO messages (content, sender, timestamp) VALUES (?, ?, ?)", [message, userId, snowflake])) {
    return { message: "Error Sending Message" };
  }

  sendMessage(PayloadType.SERVER_MESSAGE, [userId, message, snowflake], undefined, userId);

  if (!sendMessageWS(PayloadType.SERVER_SUCCESSFUL_MESSAGE, [snowflake], ws)) {
    return { message: "Error Replying To Sender" };
  }

  return true;
};

const handleRequestClientPrivateMessage = (ws: CustomWebSocket, payload: PayloadTypeParams[PayloadType.CLIENT_PRIVATE_MESSAGE]): (boolean | IError) => {
  const [ receiverId, message ] = payload;
  const userId = ws.userId;

  const snowflake = timestamp(userId);

  const receiverExists = querySingle<IUser>("SELECT id FROM users WHERE id = ?", [receiverId]) !== undefined;

  if (!receiverExists) {
    return { message: "Invalid Receiver" };
  }

  if (!executeInsertSafe("INSERT INTO privateMessages (content, sender, receiver, timestamp) VALUES (?, ?, ?, ?)", [message, userId, receiverId, snowflake])) {
    return { message: "Error Sending Message" };
  }

  sendMessage(PayloadType.SERVER_PRIVATE_MESSAGE, [userId, message, snowflake], receiverId)

  if (!sendMessageWS(PayloadType.SERVER_SUCCESSFUL_MESSAGE, [snowflake], ws)) {
    return { message: "Error Replying To Sender" };
  }

  return true;
};

const handleRequestClientUserData = (ws: CustomWebSocket, payload: PayloadTypeParams[PayloadType.CLIENT_USER_DATA]): (boolean | IError) => {
  const [ payloadUserId ] = payload;
  const userId = ws.userId;

  const user = querySingle<IUser>("SELECT displayname, color FROM users WHERE id = ?", [payloadUserId]);

  if (!user) {
    return { message: "Invalid User" };
  }

  if (!sendMessageWS(PayloadType.SERVER_USER_DATA, [payloadUserId, user.displayname!, user.color!, timestamp(userId)], ws)) {
    return { message: "Error Sending User Data" };
  }

  return true;
};

export function sendMessage<T extends PayloadType>(type: T, params: PayloadTypeParams[T], userId?: ExecuteResult, broadCastExceptId?: ExecuteResult): boolean {
  if (broadCastExceptId) {
    for (const [id, clientConnections] of clients) {
      if (id === broadCastExceptId) continue;
      for (const client of clientConnections) {
        client.send(JSON.stringify([type, ...params]));
      }
    }
    return true;
  }

  if (!userId) {
    for (const [, clientConnections] of clients) {
      for (const client of clientConnections) {
        client.send(JSON.stringify([type, ...params]));
      }
    }
    return true;
  }
  const clientConnections = clients.get(userId);
  if (!clientConnections) return false;

  for (const client of clientConnections) {
    client.send(JSON.stringify([type, ...params]));
  }
  return true;
}

export function sendMessageWS<T extends PayloadType>(type: T, params: PayloadTypeParams[T], ws: CustomWebSocket): boolean {
  ws.send(JSON.stringify([type, ...params]));
  return true;
}