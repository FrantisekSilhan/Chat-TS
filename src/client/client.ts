let ws: WebSocket;
let exit = false;
let autoScroll = true;

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
  [PayloadType.CLIENT_MESSAGE]: [string, string];
  [PayloadType.SERVER_MESSAGE]: [ExecuteResult, string, string];
  [PayloadType.CLIENT_PRIVATE_MESSAGE]: [ExecuteResult, string, string];
  [PayloadType.SERVER_PRIVATE_MESSAGE]: [ExecuteResult, string, string];
  [PayloadType.CLIENT_USER_DATA]: [ExecuteResult];
  [PayloadType.SERVER_USER_DATA]: [ExecuteResult, string, string, string];
  [PayloadType.WELCOME]: [ExecuteResult, string, string];
  [PayloadType.SERVER_SUCCESSFUL_MESSAGE]: [string, string];
  [PayloadType.SERVER_ERROR_CLOSE]: [string];
  [PayloadType.SERVER_ERROR]: [string];
}

const emotes = new Map([
  ["buh", "/emotes/buh"],
  ["GAGAGA", "/emotes/gagaga"],
  ["NOOOO", "/emotes/noooo"],
  ["HUH", "/emotes/huh"],
  ["xdd", "/emotes/xdd"]
]);

const EPOCH = 1722893503219n;
const TIMESTAMP_BITS = 46;
const SEQUENCE_BITS = 12;
const ID_BITS = 26;

const USER_DATA_REFRESH = 1000 * 60;
const MAX_MESSAGE_LENGTH = 2000;

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

const generateRandomTempId = (length = 21) => {
  const randomString = () => Math.random().toString(36).substring(2);
  let tempId = "";
  while (tempId.length < length) {
    tempId += randomString();
  }
  return tempId.substring(0, length);
}

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
    case PayloadType.SERVER_SUCCESSFUL_MESSAGE:
      const tempId = payload[0];
      if (pendingSentMessages[tempId]) {
        pendingSentMessages[tempId].resolve(payload[1]);
        delete pendingSentMessages[tempId];
      }
      break;
    default:
      console.log(data);
      break;
  }
};

const pendingUserDataRequests: { [userId: string]: { resolve: (data: any) => void, reject: (reason?: any) => void } } = {};
const pendingSentMessages: { [tempId: string]: { resolve: (data: any) => void, reject: (reason?: any) => void } } = {};

const requestSentMessage = (tempId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    pendingSentMessages[tempId] = { resolve, reject };
  });
}

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

const handleClientMessage = async (message: string, tempId: string) => {
  let userData = localStorageManager.getMyData();

  const [displayname, color, _] = userData;

  createChatMessage(displayname, color, message, "", tempId);

  try {
    const messageId = await requestSentMessage(tempId);

    const messageElement = document.querySelector(`[data-timestamp="${tempId}"]`) as HTMLElement;
    if (!messageElement) {
      console.error("Message element not found");
      return;
    }

    messageElement.dataset.timestamp = messageId;
    messageElement.classList.remove("message--pending");
    messageElement.querySelector(".message__timestamp")!.textContent = formatTimestamp(timestampToDate(messageId)[0]);
  } catch (err) {
    console.error(err);
  }
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

function splitStringByRegex(inputString: string, regexPattern: RegExp): string[] {
  const result = [];
  let lastIndex = 0;
  let match;

  while ((match = regexPattern.exec(inputString)) !== null) {
    result.push(inputString.slice(lastIndex, match.index));
    result.push(match[0]);
    lastIndex = regexPattern.lastIndex;
  }

  result.push(inputString.slice(lastIndex));
  return result;
}

function render(message: string, textElement: HTMLDivElement) {
  const httpRegex = /https?:\/\/(www\.)?[-a-zA-Z-1-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(:\d{1,5})?([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
  const regex = new RegExp(`${httpRegex.source}|:.{1,9}:`, "gi")
  const divided = splitStringByRegex(message, regex);
  divided.forEach((text) => {
    if (httpRegex.test(text)) {
      const link = document.createElement("a");
      link.href = text;
      link.target = "_blank";
      link.textContent = text;
      link.classList.add("message__link");
      textElement.insertAdjacentElement("beforeend", link);
      return;
    } else if (text.startsWith(":") && text.endsWith(":")) {
      const link = emotes.get(text.slice(1, -1));
      if (link) {
        const picture = document.createElement("picture");
        picture.classList.add("message_emote");
        const src = document.createElement("source");
        src.srcset = `${link}.avif`
        src.type = "image/avif";
        const img = document.createElement("img");
        img.src = `${link}.webp`;
        img.alt = text;
        picture.appendChild(src);
        picture.appendChild(img);
        textElement.insertAdjacentElement("beforeend", picture);
        return;
      }
    }
    textElement.insertAdjacentText("beforeend", text);
  });
}

const createChatMessage = (displayname: string, color: string, message: string, timestamp: string, tempId?: string) => {
  const messageElement = document.createElement("li");
  const displaynameElement = document.createElement("span");
  const timestampElement = document.createElement("span");
  const messageSeparator = document.createElement("span");
  const messageText = document.createElement("div");

  displaynameElement.classList.add("message__displayname");
  timestampElement.classList.add("message__timestamp");
  messageElement.classList.add("message");

  displaynameElement.textContent = displayname;
  timestampElement.textContent = tempId ? formatTimestamp(BigInt(Date.now())) : formatTimestamp(timestampToDate(timestamp)[0]);
  messageSeparator.textContent = ": ";

  render(message, messageText);

  displaynameElement.style.background = color;
  displaynameElement.style.color = "transparent";
  displaynameElement.style.backgroundClip = "text";
  if (tempId) {
    messageElement.classList.add("message--pending");
  }

  messageElement.appendChild(timestampElement);
  messageElement.appendChild(displaynameElement);
  messageElement.appendChild(messageSeparator);
  messageElement.appendChild(messageText);


  messageElement.dataset.timestamp = tempId || timestamp;

  const chatElement = document.getElementById("chat");
  const chatWarning = document.getElementById("chat-warning");
  if (!chatElement || !chatWarning) {
    console.error("Chat elements not found");
    return;
  }
  chatElement.appendChild(messageElement);

  if (autoScroll) {
    window.scrollTo(0, document.body.scrollHeight);
  } else {
    chatWarning.classList.add("visible");
  }
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

    localStorage.setItem("me", JSON.stringify([...userData, Date.now().toString()]));
    localStorage.setItem("meId", JSON.stringify([userId]));
  },
  getUserData: (userId: ExecuteResult) => {
    const userData = localStorage.getItem(userId.toString());
    return userData ? JSON.parse(userData) : null;
  },
  getMyData: () => {
    const userData = localStorage.getItem("me");
    return userData ? JSON.parse(userData) : null;
  },
  getMyId: () => {
    const userId = localStorage.getItem("me");
    return userId ? JSON.parse(userId)[0] : null;
  }
};

const setupChat = () => {
  const chatTextArea = document.getElementById("chat-textarea") as HTMLTextAreaElement;
  const chatButton = document.getElementById("chat-button");
  const chatWarning = document.getElementById("chat-warning");
  const body = document.getElementsByTagName("body")[0];
  const lineHeight = parseFloat(getComputedStyle(body).getPropertyValue("--chat-line-height"));

  if (!chatTextArea || !chatButton || !chatWarning) {
    console.error("Chat elements not found");
    return;
  }

  chatTextArea.addEventListener("input", (e) => {
    const inputText = (e.target as HTMLTextAreaElement).value;

    if (inputText.length > MAX_MESSAGE_LENGTH) {
      chatButton.classList.add("btn--disabled");
    }

    if (inputText.length <= MAX_MESSAGE_LENGTH && chatButton.classList.contains("btn--disabled")) {
      chatButton.classList.remove("btn--disabled");
    }

    if (inputText.length >= (MAX_MESSAGE_LENGTH - 100)) {
      const lengthWarning = document.getElementById("length-warning");

      if (lengthWarning) {
        lengthWarning.textContent = `(${MAX_MESSAGE_LENGTH - inputText.length})`;
        lengthWarning.classList.add("visible");
      }
    }

    if (inputText.length < (MAX_MESSAGE_LENGTH - 100)) {
      const lengthWarning = document.getElementById("length-warning");

      if (lengthWarning) {
        lengthWarning.classList.remove("visible");
      }
    }

    const chatTextAreaWidth = (chatTextArea.clientWidth - (2 * parseFloat(getComputedStyle(chatTextArea).paddingInline)));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context!.font = window.getComputedStyle(chatTextArea).font;

    const lines = inputText.split("\n");
    let formattedText = "";

    lines.forEach((lineText, lineIndex) => {
      const words = lineText.split(" ");
      let line = "";

      words.forEach((word, _) => {
        const testLine = line + word + " ";
        const testLineWidth = context!.measureText(testLine).width;

        if (testLineWidth > chatTextAreaWidth && line !== "") {
          formattedText += line.trim() + "\n";
          line = word + " ";
        } else {
          line = testLine;
        }
      });

      formattedText += line.trim() + (lineIndex < lines.length - 1 ? "\n" : "");
    });

    const numLines = formattedText.split("\n").length;
    body.style.setProperty("--chat-height-input", Math.min((Math.ceil((numLines * lineHeight) * 10) / 10), 8) + "em");
  });

  chatTextArea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatButton.dispatchEvent(new Event("click", {}));
    }

    if (e.key === "Enter" && e.shiftKey) {
      setTimeout(() => {
        window.scrollTo(0, document.body.scrollHeight);
      }, 10);
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      window.scrollTo(0, document.body.scrollHeight);
    }
  });

  chatButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (chatTextArea.value && chatTextArea.value.length <= MAX_MESSAGE_LENGTH) {
      const tempId = generateRandomTempId();
      handleClientMessage(chatTextArea.value, tempId);
      ws.send(JSON.stringify([PayloadType.CLIENT_MESSAGE, chatTextArea.value, tempId]));
      chatTextArea.value = "";
      chatTextArea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  document.addEventListener("scroll", () => {
    autoScroll = (window.scrollY + lineHeight*16*5) >= document.body.scrollHeight - window.innerHeight;
    if (autoScroll) {
      chatWarning.classList.remove("visible");
    }
  });

  chatWarning.addEventListener("click", () => {
    window.scrollTo(0, document.body.scrollHeight);
  });
}

connectWebSocket();
setupChat();
