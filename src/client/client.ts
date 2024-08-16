let ws: WebSocket;
let observer: IntersectionObserver;
let exit = false;
let autoScroll = true;
let firstWSOpen = true;

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
  CLIENT_HISTORY = 11,
  SERVER_HISTORY = 12,
  CLIENT_PRIVATE_HISTORY = 13,
  SERVER_PRIVATE_HISTORY = 14,
  CLIENT_BATCH_USER_DATA = 15,
  SERVER_BATCH_USER_DATA = 16,
}

type ExecuteResult = bigint;

type PayloadTypeParams = {
  [PayloadType.SERVER_CLOSE]: [];
  [PayloadType.CLIENT_MESSAGE]: [string, string];
  [PayloadType.SERVER_MESSAGE]: [string, string, string];
  [PayloadType.CLIENT_PRIVATE_MESSAGE]: [string, string, string];
  [PayloadType.SERVER_PRIVATE_MESSAGE]: [string, string, string];
  [PayloadType.CLIENT_USER_DATA]: [string];
  [PayloadType.SERVER_USER_DATA]: [string, string, string, string];
  [PayloadType.WELCOME]: [string, string, string];
  [PayloadType.SERVER_SUCCESSFUL_MESSAGE]: [string, string];
  [PayloadType.SERVER_ERROR_CLOSE]: [string];
  [PayloadType.SERVER_ERROR]: [string];
  [PayloadType.CLIENT_HISTORY]: [string];
  [PayloadType.SERVER_HISTORY]: [string, string, string][];
  [PayloadType.CLIENT_PRIVATE_HISTORY]: [string, string];
  [PayloadType.SERVER_PRIVATE_HISTORY]: [string, string, string][];
  [PayloadType.CLIENT_BATCH_USER_DATA]: [string, string[]];
  [PayloadType.SERVER_BATCH_USER_DATA]: [string, [string, string, string, string][]];
};

const emotes = new Map([
  ["1984", "/emotes/1984"],
  ["adhd", "/emotes/adhd"],
  ["alert", "/emotes/alert"],
  ["america", "/emotes/america"],
  ["annoyed", "/emotes/annoyed"],
  ["ant", "/emotes/ant"],
  ["aware", "/emotes/aware"],
  ["awoken", "/emotes/awoken"],
  ["baited", "/emotes/baited"],
  ["banger", "/emotes/banger"],
  ["bedge", "/emotes/bedge"],
  ["beercat", "/emotes/beercat"],
  ["bla", "/emotes/bla"],
  ["blehhhh", "/emotes/blehhhh"],
  ["blunder", "/emotes/blunder"],
  ["boo", "/emotes/boo"],
  ["booba", "/emotes/booba"],
  ["buh", "/emotes/buh"],
  ["bussin", "/emotes/bussin"],
  ["catsittingverycomfortable", "/emotes/catsittingverycomfortable"],
  ["catsittingverycomfortablearoundacampfirewithitsfriends", "/emotes/catsittingverycomfortablearoundacampfirewithitsfriends"],
  ["catsleep", "/emotes/catsleep"],
  ["cinkacka", "/emotes/cinkacka"],
  ["classic", "/emotes/classic"],
  ["clueless", "/emotes/clueless"],
  ["cooking", "/emotes/cooking"],
  ["copium", "/emotes/copium"],
  ["crunch", "/emotes/crunch"],
  ["doyoufeeltheweightofyoursinsdoesithurtdoesgodsjudgementfillyouwithguilttormenttheyrecomingtheyrecomi", "/emotes/doyoufeeltheweightofyoursinsdoesithurtdoesgodsjudgementfillyouwithguilttormenttheyrecomingtheyrecomi"],
  ["drak", "/emotes/drak"],
  ["dvojtecka3", "/emotes/dvojtecka3"],
  ["emo", "/emotes/emo"],
  ["erm", "/emotes/erm"],
  ["flashbacks", "/emotes/flashbacks"],
  ["flushed", "/emotes/flushed"],
  ["flushge", "/emotes/flushge"],
  ["gagaga", "/emotes/gagaga"],
  ["gamba", "/emotes/gamba"],
  ["gayge", "/emotes/gayge"],
  ["gg", "/emotes/gg"],
  ["goodbye", "/emotes/goodbye"],
  ["happie", "/emotes/happie"],
  ["huh", "/emotes/huh"],
  ["hutaothighs", "/emotes/hutaothighs"],
  ["chillin", "/emotes/chillin"],
  ["iq", "/emotes/iq"],
  ["jducurat", "/emotes/jducurat"],
  ["joever", "/emotes/joever"],
  ["jojo", "/emotes/jojo"],
  ["kekw", "/emotes/kekw"],
  ["kelimek", "/emotes/kelimek"],
  ["kissahomie", "/emotes/kissahomie"],
  ["kok", "/emotes/kok"],
  ["lava", "/emotes/lava"],
  ["lethimcook", "/emotes/lethimcook"],
  ["letsgooo", "/emotes/letsgooo"],
  ["liberec", "/emotes/liberec"],
  ["liemeter", "/emotes/liemeter"],
  ["linux", "/emotes/linux"],
  ["ll", "/emotes/ll"],
  ["lol", "/emotes/lol"],
  ["majklpiska", "/emotes/majklpiska"],
  ["meowdy", "/emotes/meowdy"],
  ["mhm", "/emotes/mhm"],
  ["mooah", "/emotes/mooah"],
  ["naaaah", "/emotes/naaaah"],
  ["negr", "/emotes/negr"],
  ["nerding", "/emotes/nerding"],
  ["neuronactivation", "/emotes/neuronactivation"],
  ["noooo", "/emotes/noooo"],
  ["noshot", "/emotes/noshot"],
  ["noted", "/emotes/noted"],
  ["nuhuh", "/emotes/nuhuh"],
  ["o7", "/emotes/o7"],
  ["oh", "/emotes/oh"],
  ["ohcry", "/emotes/ohcry"],
  ["ok", "/emotes/ok"],
  ["okayge", "/emotes/okayge"],
  ["??", "/emotes/otaznik"],
  ["papa", "/emotes/papa"],
  ["pedro", "/emotes/pedro"],
  ["peepoczech", "/emotes/peepoczech"],
  ["peeposhy", "/emotes/peeposhy"],
  ["peped", "/emotes/peped"],
  ["pepega", "/emotes/pepega"],
  ["pepege", "/emotes/pepege"],
  ["pepepains", "/emotes/pepepains"],
  ["pepes", "/emotes/pepes"],
  ["phonge", "/emotes/phonge"],
  ["plead", "/emotes/plead"],
  ["pog", "/emotes/pog"],
  ["popipopipipopipo", "/emotes/popipopipipopipo"],
  ["probuzen", "/emotes/probuzen"],
  ["punch", "/emotes/punch"],
  ["ragey", "/emotes/ragey"],
  ["rar", "/emotes/rar"],
  ["ratio", "/emotes/ratio"],
  ["sadcat", "/emotes/sadcat"],
  ["sadge", "/emotes/sadge"],
  ["shywokege", "/emotes/shywokege"],
  ["schizo", "/emotes/schizo"],
  ["sigma", "/emotes/sigma"],
  ["sisyphus", "/emotes/sisyphus"],
  ["skibidi", "/emotes/skibidi"],
  ["skip", "/emotes/skip"],
  ["slovak", "/emotes/slovak"],
  ["sniffa", "/emotes/sniffa"],
  ["sob", "/emotes/sob"],
  ["suffering", "/emotes/suffering"],
  ["sus", "/emotes/sus"],
  ["susdog", "/emotes/susdog"],
  ["suske", "/emotes/suske"],
  ["taktojeval", "/emotes/taktojeval"],
  ["test", "/emotes/test"],
  ["tf", "/emotes/tf"],
  ["theindustrialrevolutionanditsconsequenceshavebeenadisasterforthehumanrace", "/emotes/theindustrialrevolutionanditsconsequenceshavebeenadisasterforthehumanrace"],
  ["thischat", "/emotes/thischat"],
  ["titanholo", "/emotes/titanholo"],
  ["transge", "/emotes/transge"],
  ["trolley", "/emotes/trolley"],
  ["uuh", "/emotes/uuh"],
  ["uwu", "/emotes/uwu"],
  ["vibe", "/emotes/vibe"],
  ["wankge", "/emotes/wankge"],
  ["wholethimcook", "/emotes/wholethimcook"],
  ["wokeg", "/emotes/wokeg"],
  ["wokege", "/emotes/wokege"],
  ["ww", "/emotes/ww"],
  ["xdd", "/emotes/xdd"],
  ["xddge", "/emotes/xddge"],
  ["xddwokege", "/emotes/xddwokege"],
  ["zivot", "/emotes/zivot"],
]);

const EPOCH = 1722893503219n;
const TIMESTAMP_BITS = 46;
const SEQUENCE_BITS = 12;
const ID_BITS = 26;

const USER_DATA_REFRESH = 1000 * 60;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 69;

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
};

const connectWebSocket = () => {
  const host = window.location.host;

  ws = new WebSocket(`wss://${host}`);

  ws.onmessage = (event) => {
    messageHandler(event.data);
  };

  ws.onopen = () => {
    if (firstWSOpen) {
      firstWSOpen = false;
      setupChat();
    }
  }

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
    case PayloadType.SERVER_CLOSE: {
      exit = true;
      break;
    }
    case PayloadType.SERVER_ERROR_CLOSE: {
      console.error(payload[0]);
      exit = true;
      break;
    }
    case PayloadType.SERVER_ERROR: {
      console.error(payload[0]);
      break;
    }
    case PayloadType.SERVER_USER_DATA: {
      localStorageManager.setUserData(payload as PayloadTypeParams[PayloadType.SERVER_USER_DATA]);
      break;
    }
    case PayloadType.WELCOME: {
      localStorageManager.setWelcomeData(payload as PayloadTypeParams[PayloadType.WELCOME]);
      break;
    }
    case PayloadType.SERVER_MESSAGE: {
      handleServerMessage(payload as PayloadTypeParams[PayloadType.SERVER_MESSAGE]);
      break;
    }
    case PayloadType.SERVER_HISTORY: {
      handleServerHistory(payload as PayloadTypeParams[PayloadType.SERVER_HISTORY]);
      break;
    }
    case PayloadType.SERVER_SUCCESSFUL_MESSAGE: {
      const tempId = payload[0];
      if (pendingSentMessages[tempId]) {
        pendingSentMessages[tempId].resolve(payload[1]);
        delete pendingSentMessages[tempId];
      }
      break;
    }
    case PayloadType.SERVER_BATCH_USER_DATA: {
      const [requestId, userData] = payload as PayloadTypeParams[PayloadType.SERVER_BATCH_USER_DATA];
      userData.forEach((userData) => localStorageManager.setUserData(userData));
      if (pendingBatchUserDataRequests[requestId]) {
        pendingBatchUserDataRequests[requestId].resolve(userData);
        delete pendingBatchUserDataRequests[requestId];
      }
      break;
    }
    default: {
      console.log(data);
      break;
    }
  }
};

const pendingUserDataRequests: { [userId: string]: { resolve: (data: any) => void, reject: (reason?: any) => void } } = {};
const pendingBatchUserDataRequests: { [requestId: string]: { resolve: (data: any) => void, reject: (reason?: any) => void } } = {};
const pendingSentMessages: { [tempId: string]: { resolve: (data: any) => void, reject: (reason?: any) => void } } = {};

const requestSentMessage = (tempId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    pendingSentMessages[tempId] = { resolve, reject };
  });
};

const requestUserData = (userId: string) => {
  return new Promise((resolve, reject) => {
    pendingUserDataRequests[userId] = { resolve, reject };
    ws.send(JSON.stringify([PayloadType.CLIENT_USER_DATA, userId]));
  });
};

const requestBatchUserData = (userIds: string[], requestId: string): Promise<[string, string, string, string][]> => {
  return new Promise((resolve, reject) => {
    pendingBatchUserDataRequests[requestId] = { resolve, reject };
    ws.send(JSON.stringify([PayloadType.CLIENT_BATCH_USER_DATA, requestId, userIds]));
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

  createChatMessage(true, userId, displayname, color, message, timestamp);
};

const handleServerHistory = async (payload: PayloadTypeParams[PayloadType.SERVER_HISTORY]) => {
  const userDatas = new Map<string, [string, string, string]>();
  const missingUserIds = new Set<string>();

  if (payload.length === 0) {
    observer.disconnect();
    return;
  }

  payload.forEach(([userId]) => {
    if (!localStorageManager.getUserData(userId)) {
      missingUserIds.add(userId);
    }
  });

  if (missingUserIds.size > 0) {
    const requestId = generateRandomTempId();
    const fetchedUserData = await requestBatchUserData(Array.from(missingUserIds), requestId);
    fetchedUserData.forEach(([userId, ...userData]) => userDatas.set(userId, userData));
  }

  payload.forEach(([userId, message, timestamp]) => {
    let userData = userDatas.get(userId) || localStorageManager.getUserData(userId);

    if (!userData) {
      createChatMessage(false, userId, `User ${userId}`, "gray", message, timestamp);
      return;
    }

    createChatMessage(false, userId, userData[0], userData[1], message, timestamp);
  });

  window.scrollTo(0, window.scrollY + 1);
  if (document.querySelectorAll(".message").length <= MAX_HISTORY_MESSAGES) {
    window.scrollTo(0, document.body.scrollHeight);
  }
};

const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const formatOutgoingMessage = (message: string): string => {
  emotes.forEach((_, key, __) => {
    const escapedKey = escapeRegExp(key);
    const regex = new RegExp(`(?<!\\S)${escapedKey}(?!\\S)`, "gi");
    message = message.replaceAll(regex, `:${key}:`);
  });
  return message.trim();
};

const handleClientMessage = async (message: string, tempId: string) => {
  let userData = localStorageManager.getMyData();

  const [displayname, color, _] = userData;

  const formattedMessage = formatOutgoingMessage(message);

  createChatMessage(true, "0", displayname, color, formattedMessage, "", tempId);
  ws.send(JSON.stringify([PayloadType.CLIENT_MESSAGE, formattedMessage, tempId]));

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
};

const formatTimestamp = (timestamp: ExecuteResult) => {
  const date = new Date(Number(timestamp));
  const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 1000));

  const now = new Date();
  const localNow = new Date(now.getTime() - (now.getTimezoneOffset() * 1000));

  const isToday = localDate.toDateString() === localNow.toDateString();
  const isYesterday = localDate.toDateString() === new Date(localNow.setDate(localNow.getDate() - 1)).toDateString();

  const options: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", hourCycle: "h23" };

  if (isToday) {
    return `Today at ${date.toLocaleTimeString([], options)}`;
  } else if (isYesterday) {
    return `Yesterday at ${date.toLocaleTimeString([], options)}`;
  } else {
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], options)}`;
  }
};

const splitStringByRegex = (inputString: string, regexPattern: RegExp): string[] => {
  const result = [];
  let lastIndex = 0;
  let match;

  while ((match = regexPattern.exec(inputString)) !== null) {
    result.push(inputString.slice(lastIndex, match.index));
    result.push(match[0]);
    lastIndex = regexPattern.lastIndex;
  }

  result.push(inputString.slice(lastIndex));
  return result.filter(n => n !== "");
};

const render = (message: string, textElement: HTMLDivElement) => {
  const httpRegex = /https?:\/\/(www\.)?[-a-zA-Z-1-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(:\d{1,5})?([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
  const regex = new RegExp(`${httpRegex.source}|:[a-zA-Z0-9]{1,9}:`, "gi")
  const divided = splitStringByRegex(message, regex);

  const videoRegex = /\.mp4|\.webm|\.mov$/;
  let videoLink = "";
  const imageRegex = /\.png|\.jpg|\.jpeg|\.webp|\.avif|\.gif$/;
  let imageLink = "";

  divided.forEach((text) => {
    if (httpRegex.test(text)) {
      if (videoLink === "" && videoRegex.test(text)) {
        videoLink = text;
        if (divided.length === 1) return;
      } else if (imageLink === "" && imageRegex.test(text)) {
        imageLink = text;
        if (divided.length === 1) return;
      }
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
        picture.classList.add("message__emote");
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

    if (text === "") return;

    const span = document.createElement("span");
    span.textContent = text;
    textElement.insertAdjacentElement("beforeend", span);
  });

  if (videoLink !== "") {
    const video = document.createElement("video");
    video.classList.add("message__media");
    video.controls = true;
    video.src = videoLink;
    textElement.insertAdjacentElement("beforeend", video);
  } else if (imageLink !== "") {
    const img = document.createElement("img");
    img.classList.add("message__media");
    img.src = imageLink;
    textElement.insertAdjacentElement("beforeend", img);
  }
};

const createChatMessage = (isNew: boolean, userId: string, displayname: string, color: string, message: string, timestamp: string, tempId?: string) => {
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

  if (messageText.children.length <= 3 && Array.from(messageText.children).every((child) => child.tagName === "PICTURE")) {
    messageText.classList.add("message--large");
  }

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
  messageElement.dataset.userId = userId;

  const chatElement = document.getElementById("chat");
  const chatWarning = document.getElementById("chat-warning");
  if (!chatElement || !chatWarning) {
    console.error("Chat elements not found");
    return;
  }

  if (isNew) {
    const lastMessage = chatElement.lastElementChild as HTMLElement;

    if (lastMessage && lastMessage.dataset.userId !== userId) {
      messageElement.classList.add("message--spacing");
    }

    chatElement.appendChild(messageElement);
  } else {
    const lastMessage = chatElement.firstElementChild as HTMLElement;

    if (lastMessage && lastMessage.dataset.userId !== userId) {
      messageElement.classList.add("message--spacing2");
    }

    chatElement.prepend(messageElement);
  }

  if (!isNew) return;
  if (autoScroll) {
    window.scrollTo(0, document.body.scrollHeight);
  } else {
    chatWarning.classList.add("visible");
  }
};

const localStorageManager = {
  setUserData: (payload: PayloadTypeParams[PayloadType.SERVER_USER_DATA]) => {
    const [userId, ...userData] = payload;

    if (pendingUserDataRequests[userId]) {
      pendingUserDataRequests[userId].resolve(userData);
      delete pendingUserDataRequests[userId];
    }

    userData[2] = timestampToDate(userData[2])[0].toString();
    localStorage.setItem(userId, JSON.stringify(userData));
  },
  setWelcomeData: (payload: PayloadTypeParams[PayloadType.WELCOME]) => {
    const [userId, ...userData] = payload;

    localStorage.setItem("me", JSON.stringify([...userData, Date.now().toString()]));
    localStorage.setItem("meId", JSON.stringify([userId]));
  },
  getUserData: (userId: string) => {
    const userData = localStorage.getItem(userId);
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
  const chat = document.getElementById("chat");
  const observerElement = document.getElementById("observer");
  const chatTextArea = document.getElementById("chat-textarea") as HTMLTextAreaElement;
  const chatButton = document.getElementById("chat-button");
  const chatWarning = document.getElementById("chat-warning");
  const body = document.getElementsByTagName("body")[0];
  const lineHeight = parseFloat(getComputedStyle(body).getPropertyValue("--chat-line-height"));

  if (!chatTextArea || !chatButton || !chatWarning || !chat || !observerElement) {
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

  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      const firstMessage = chat.querySelector(".message") as HTMLElement;
      if (!firstMessage) {
        ws.send(JSON.stringify([PayloadType.CLIENT_HISTORY, "0"]));
        return;
      }

      const firstMessageTimestamp = firstMessage.dataset.timestamp;
      ws.send(JSON.stringify([PayloadType.CLIENT_HISTORY, firstMessageTimestamp]));
    }
  }, { threshold: 0 });

  observer.observe(observerElement);
};

connectWebSocket();
