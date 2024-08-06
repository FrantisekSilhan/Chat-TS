let ws: WebSocket;
let exit = false;

enum PayloadType {
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

type ExecuteResult = bigint;

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

const EPOCH = 1722893503219n;
const TIMESTAMP_BITS = 46;
const SEQUENCE_BITS = 12;
const ID_BITS = 26;

const USER_DATA_REFRESH = 1000 * 60;

const timestampToDate = (snowflakeString: string): [ExecuteResult, ExecuteResult, number] => {
  const snowflake = BigInt(snowflakeString);

  const timestampMask = (BigInt(1) << BigInt(TIMESTAMP_BITS)) - BigInt(1);
  const idMask = (BigInt(1) << BigInt(ID_BITS)) - BigInt(1);
  const sequenceMask = (BigInt(1) << BigInt(SEQUENCE_BITS)) - BigInt(1);

  const sequence = Number((snowflake >> BigInt(ID_BITS)) & sequenceMask);
  const timestamp = (snowflake >> BigInt(ID_BITS + SEQUENCE_BITS)) & timestampMask;
  const id = snowflake & idMask;

  const actualTimestamp = BigInt(timestamp) + EPOCH;

  return [actualTimestamp as unknown as ExecuteResult, id as ExecuteResult, sequence];
};

const connectWebSocket = () => {
  const host = window.location.host;

  ws = new WebSocket(`wss://${host}`);

  ws.onmessage = (event) => {
    messageHandler(event.data);
  };

  ws.onerror = (err) => {
    console.error(err);
  }

  ws.onclose = () => {
    if (exit) return;

    setTimeout(connectWebSocket, 3000);
  };
};

const messageHandler = (message: string) => {
  const data = JSON.parse(message) as [PayloadType, ...any[]];
  const [type, ...payload] = data;

  switch (type) {
    case PayloadType.SERVER_CLOSE:
      exit = true;
      break;
    case PayloadType.SERVER_ERROR_CLOSE:
      console.error(payload[0]);
      exit = true;
      break;
    case PayloadType.SERVER_ERROR:
      console.error(payload[0]);
      break;
    case PayloadType.SERVER_USER_DATA:
      localStorageManager.setUserData(payload as PayloadTypeParams[PayloadType.SERVER_USER_DATA]);
      break;
    case PayloadType.WELCOME:
      localStorageManager.setWelcomeData(payload as PayloadTypeParams[PayloadType.WELCOME]);
      break;
    case PayloadType.SERVER_MESSAGE:
      handleServerMessage(payload as PayloadTypeParams[PayloadType.SERVER_MESSAGE]);
      break;
    default:
      console.log(data);
      break;
  }
};

const pendingUserDataRequests: { [userId: string]: { resolve: (data: any) => void, reject: (reason?: any) => void } } = {};

const requestUserData = (userId: ExecuteResult) => {
  return new Promise((resolve, reject) => {
    pendingUserDataRequests[userId.toString()] = { resolve, reject };
    ws.send(JSON.stringify([PayloadType.CLIENT_USER_DATA, userId]));
  });
};

const handleServerMessage = async (payload: PayloadTypeParams[PayloadType.SERVER_MESSAGE]) => {
  const [userId, message, timestamp] = payload;
  let userData = localStorageManager.getUserData(userId);

  if (!userData || (Date.now() - Number(userData[2])) > USER_DATA_REFRESH) {
    try {
      userData = await requestUserData(userId);
    } catch (err) {
      console.error(err);
      return;
    }
  }

  const [displayname, color, _] = userData;

  createChatMessage(displayname, color, message, timestamp);
}

const formatTimestamp = (timestamp: ExecuteResult) => {
  const date = new Date(Number(timestamp));
  const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 6000));
  
  const now = new Date();
  const localNow = new Date(now.getTime() - (now.getTimezoneOffset() * 6000));

  const isToday = localDate.toDateString() === localNow.toDateString();
  const isYesterday = localDate.toDateString() === new Date(localNow.setDate(localNow.getDate() - 1)).toDateString();

  const hours = localDate.getHours().toString().padStart(2, "0");
  const minutes = localDate.getMinutes().toString().padStart(2, "0");
  const formattedTime = `${hours}:${minutes}`;

  if (isToday) {
    return `Today at ${formattedTime}`;
  } else if (isYesterday) {
    return `Yesterday at ${formattedTime}`;
  } else {
    const day = (localDate.getMonth() + 1).toString().padStart(2, "0");
    const month = localDate.getDate().toString().padStart(2, "0");
    const year = localDate.getFullYear();
    return `${day}/${month}/${year} ${formattedTime}`;
  }
}

const createChatMessage = (displayname: string, color: string, message: string, timestamp: string) => {
  const messageElement = document.createElement("li");
  const displaynameElement = document.createElement("span");
  const timestampElement = document.createElement("span");

  displaynameElement.classList.add("message__displayname");
  timestampElement.classList.add("message__timestamp");
  messageElement.classList.add("message");
  
  displaynameElement.textContent = displayname;
  timestampElement.textContent = formatTimestamp(timestampToDate(timestamp)[0]);

  displaynameElement.style.background = color;
  displaynameElement.style.color = "transparent";
  displaynameElement.style.backgroundClip = "text";

  messageElement.appendChild(timestampElement);
  messageElement.appendChild(displaynameElement);
  messageElement.appendChild(document.createTextNode(": " + message));

  messageElement.dataset.timestamp = timestamp;

  const chatElement = document.getElementById("chat");
  if (!chatElement) {
    console.error("Chat element not found");
    return;
  }
  chatElement.appendChild(messageElement);
}

const localStorageManager = {
  setUserData: (payload: PayloadTypeParams[PayloadType.SERVER_USER_DATA]) => {
    const [userId, ...userData] = payload;
    const stringUserId = userId.toString();

    if (pendingUserDataRequests[stringUserId]) {
      pendingUserDataRequests[stringUserId].resolve(userData);
      delete pendingUserDataRequests[stringUserId];
    }

    userData[2] = timestampToDate(userData[2])[0].toString();
    localStorage.setItem(stringUserId, JSON.stringify(userData));
  },
  setWelcomeData: (payload: PayloadTypeParams[PayloadType.WELCOME]) => {
    const [userId, ...userData] = payload;
    const stringUserId = userId.toString();

    if (pendingUserDataRequests[stringUserId]) {
      pendingUserDataRequests[stringUserId].resolve(userData);
      delete pendingUserDataRequests[stringUserId];
    }

    localStorage.setItem(stringUserId, JSON.stringify([...userData, Date.now().toString()]));
  },
  getUserData: (userId: ExecuteResult) => {
    const userData = localStorage.getItem(userId.toString());
    return userData ? JSON.parse(userData) : null;
  },
};

connectWebSocket();