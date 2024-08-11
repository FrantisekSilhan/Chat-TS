var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _this = this;
var ws;
var exit = false;
var autoScroll = true;
var PayloadType;
(function (PayloadType) {
    PayloadType[PayloadType["SERVER_CLOSE"] = 0] = "SERVER_CLOSE";
    PayloadType[PayloadType["CLIENT_MESSAGE"] = 1] = "CLIENT_MESSAGE";
    PayloadType[PayloadType["SERVER_MESSAGE"] = 2] = "SERVER_MESSAGE";
    PayloadType[PayloadType["CLIENT_PRIVATE_MESSAGE"] = 3] = "CLIENT_PRIVATE_MESSAGE";
    PayloadType[PayloadType["SERVER_PRIVATE_MESSAGE"] = 4] = "SERVER_PRIVATE_MESSAGE";
    PayloadType[PayloadType["CLIENT_USER_DATA"] = 5] = "CLIENT_USER_DATA";
    PayloadType[PayloadType["SERVER_USER_DATA"] = 6] = "SERVER_USER_DATA";
    PayloadType[PayloadType["WELCOME"] = 7] = "WELCOME";
    PayloadType[PayloadType["SERVER_SUCCESSFUL_MESSAGE"] = 8] = "SERVER_SUCCESSFUL_MESSAGE";
    PayloadType[PayloadType["SERVER_ERROR_CLOSE"] = 9] = "SERVER_ERROR_CLOSE";
    PayloadType[PayloadType["SERVER_ERROR"] = 10] = "SERVER_ERROR";
})(PayloadType || (PayloadType = {}));
var EPOCH = 1722893503219n;
var TIMESTAMP_BITS = 46;
var SEQUENCE_BITS = 12;
var ID_BITS = 26;
var USER_DATA_REFRESH = 1000 * 60;
var MAX_MESSAGE_LENGTH = 2000;
var timestampToDate = function (snowflakeString) {
    var snowflake = BigInt(snowflakeString);
    var timestampMask = (BigInt(1) << BigInt(TIMESTAMP_BITS)) - BigInt(1);
    var idMask = (BigInt(1) << BigInt(ID_BITS)) - BigInt(1);
    var sequenceMask = (BigInt(1) << BigInt(SEQUENCE_BITS)) - BigInt(1);
    var sequence = Number((snowflake >> BigInt(ID_BITS)) & sequenceMask);
    var timestamp = (snowflake >> BigInt(ID_BITS + SEQUENCE_BITS)) & timestampMask;
    var id = snowflake & idMask;
    var actualTimestamp = BigInt(timestamp) + EPOCH;
    return [actualTimestamp, id, sequence];
};
var generateRandomTempId = function (length) {
    if (length === void 0) { length = 21; }
    var randomString = function () { return Math.random().toString(36).substring(2); };
    var tempId = "";
    while (tempId.length < length) {
        tempId += randomString();
    }
    return tempId.substring(0, length);
};
var connectWebSocket = function () {
    var host = window.location.host;
    ws = new WebSocket("wss://".concat(host));
    ws.onmessage = function (event) {
        messageHandler(event.data);
    };
    ws.onerror = function (err) {
        console.error(err);
    };
    ws.onclose = function () {
        if (exit)
            return;
        setTimeout(connectWebSocket, 3000);
    };
};
var messageHandler = function (message) {
    var data = JSON.parse(message);
    var type = data[0], payload = data.slice(1);
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
            localStorageManager.setUserData(payload);
            break;
        case PayloadType.WELCOME:
            localStorageManager.setWelcomeData(payload);
            break;
        case PayloadType.SERVER_MESSAGE:
            handleServerMessage(payload);
            break;
        case PayloadType.SERVER_SUCCESSFUL_MESSAGE:
            var tempId = payload[0];
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
var pendingUserDataRequests = {};
var pendingSentMessages = {};
var requestSentMessage = function (tempId) {
    return new Promise(function (resolve, reject) {
        pendingSentMessages[tempId] = { resolve: resolve, reject: reject };
    });
};
var requestUserData = function (userId) {
    return new Promise(function (resolve, reject) {
        pendingUserDataRequests[userId.toString()] = { resolve: resolve, reject: reject };
        ws.send(JSON.stringify([PayloadType.CLIENT_USER_DATA, userId]));
    });
};
var handleServerMessage = function (payload) { return __awaiter(_this, void 0, void 0, function () {
    var userId, message, timestamp, userData, err_1, displayname, color, _;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = payload[0], message = payload[1], timestamp = payload[2];
                userData = localStorageManager.getUserData(userId);
                if (!(!userData || (Date.now() - Number(userData[2])) > USER_DATA_REFRESH)) return [3 /*break*/, 4];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, requestUserData(userId)];
            case 2:
                userData = _a.sent();
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                console.error(err_1);
                return [2 /*return*/];
            case 4:
                displayname = userData[0], color = userData[1], _ = userData[2];
                createChatMessage(displayname, color, message, timestamp);
                return [2 /*return*/];
        }
    });
}); };
var handleClientMessage = function (message, tempId) { return __awaiter(_this, void 0, void 0, function () {
    var userData, displayname, color, _, messageId, messageElement, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userData = localStorageManager.getMyData();
                displayname = userData[0], color = userData[1], _ = userData[2];
                createChatMessage(displayname, color, message, "", tempId);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, requestSentMessage(tempId)];
            case 2:
                messageId = _a.sent();
                messageElement = document.querySelector("[data-timestamp=\"".concat(tempId, "\"]"));
                if (!messageElement) {
                    console.error("Message element not found");
                    return [2 /*return*/];
                }
                messageElement.dataset.timestamp = messageId;
                messageElement.classList.remove("message--pending");
                messageElement.querySelector(".message__timestamp").textContent = formatTimestamp(timestampToDate(messageId)[0]);
                return [3 /*break*/, 4];
            case 3:
                err_2 = _a.sent();
                console.error(err_2);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
var formatTimestamp = function (timestamp) {
    var date = new Date(Number(timestamp));
    var localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 6000));
    var now = new Date();
    var localNow = new Date(now.getTime() - (now.getTimezoneOffset() * 6000));
    var isToday = localDate.toDateString() === localNow.toDateString();
    var isYesterday = localDate.toDateString() === new Date(localNow.setDate(localNow.getDate() - 1)).toDateString();
    var hours = localDate.getHours().toString().padStart(2, "0");
    var minutes = localDate.getMinutes().toString().padStart(2, "0");
    var formattedTime = "".concat(hours, ":").concat(minutes);
    if (isToday) {
        return "Today at ".concat(formattedTime);
    }
    else if (isYesterday) {
        return "Yesterday at ".concat(formattedTime);
    }
    else {
        var day = (localDate.getMonth() + 1).toString().padStart(2, "0");
        var month = localDate.getDate().toString().padStart(2, "0");
        var year = localDate.getFullYear();
        return "".concat(day, "/").concat(month, "/").concat(year, " ").concat(formattedTime);
    }
};
function splitStringByRegex(inputString, regexPattern) {
    var result = [];
    var lastIndex = 0;
    var match;
    while ((match = regexPattern.exec(inputString)) !== null) {
        result.push(inputString.slice(lastIndex, match.index));
        result.push(match[0]);
        lastIndex = regexPattern.lastIndex;
    }
    result.push(inputString.slice(lastIndex));
    return result;
}
function render(message, textElement) {
    var regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(:\d{1,5})?([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
    var divided = splitStringByRegex(message, regex);
    divided.forEach(function (text) {
        if (text.startsWith("http")) {
            var link = document.createElement("a");
            link.href = text;
            link.target = "_blank";
            link.textContent = text;
            link.classList.add("message__link");
            textElement.insertAdjacentElement("beforeend", link);
        }
        else {
            textElement.insertAdjacentText("beforeend", text);
        }
    });
}
var createChatMessage = function (displayname, color, message, timestamp, tempId) {
    var messageElement = document.createElement("li");
    var displaynameElement = document.createElement("span");
    var timestampElement = document.createElement("span");
    var messageSeparator = document.createElement("span");
    var messageText = document.createElement("div");
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
    var chatElement = document.getElementById("chat");
    var chatWarning = document.getElementById("chat-warning");
    if (!chatElement || !chatWarning) {
        console.error("Chat elements not found");
        return;
    }
    chatElement.appendChild(messageElement);
    if (autoScroll) {
        window.scrollTo(0, document.body.scrollHeight);
    }
    else {
        chatWarning.classList.add("visible");
    }
};
var localStorageManager = {
    setUserData: function (payload) {
        var userId = payload[0], userData = payload.slice(1);
        var stringUserId = userId.toString();
        if (pendingUserDataRequests[stringUserId]) {
            pendingUserDataRequests[stringUserId].resolve(userData);
            delete pendingUserDataRequests[stringUserId];
        }
        userData[2] = timestampToDate(userData[2])[0].toString();
        localStorage.setItem(stringUserId, JSON.stringify(userData));
    },
    setWelcomeData: function (payload) {
        var userId = payload[0], userData = payload.slice(1);
        localStorage.setItem("me", JSON.stringify(__spreadArray(__spreadArray([], userData, true), [Date.now().toString()], false)));
        localStorage.setItem("meId", JSON.stringify([userId]));
    },
    getUserData: function (userId) {
        var userData = localStorage.getItem(userId.toString());
        return userData ? JSON.parse(userData) : null;
    },
    getMyData: function () {
        var userData = localStorage.getItem("me");
        return userData ? JSON.parse(userData) : null;
    },
    getMyId: function () {
        var userId = localStorage.getItem("me");
        return userId ? JSON.parse(userId)[0] : null;
    }
};
var setupChat = function () {
    var chatTextArea = document.getElementById("chat-textarea");
    var chatButton = document.getElementById("chat-button");
    var chatWarning = document.getElementById("chat-warning");
    var body = document.getElementsByTagName("body")[0];
    var lineHeight = parseFloat(getComputedStyle(body).getPropertyValue("--chat-line-height"));
    if (!chatTextArea || !chatButton || !chatWarning) {
        console.error("Chat elements not found");
        return;
    }
    chatTextArea.addEventListener("input", function (e) {
        var inputText = e.target.value;
        if (inputText.length > MAX_MESSAGE_LENGTH) {
            chatButton.classList.add("btn--disabled");
        }
        if (inputText.length <= MAX_MESSAGE_LENGTH && chatButton.classList.contains("btn--disabled")) {
            chatButton.classList.remove("btn--disabled");
        }
        if (inputText.length >= (MAX_MESSAGE_LENGTH - 100)) {
            var lengthWarning = document.getElementById("length-warning");
            if (lengthWarning) {
                lengthWarning.textContent = "(".concat(MAX_MESSAGE_LENGTH - inputText.length, ")");
                lengthWarning.classList.add("visible");
            }
        }
        if (inputText.length < (MAX_MESSAGE_LENGTH - 100)) {
            var lengthWarning = document.getElementById("length-warning");
            if (lengthWarning) {
                lengthWarning.classList.remove("visible");
            }
        }
        var chatTextAreaWidth = (chatTextArea.clientWidth - (2 * parseFloat(getComputedStyle(chatTextArea).paddingInline)));
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        context.font = window.getComputedStyle(chatTextArea).font;
        var lines = inputText.split("\n");
        var formattedText = "";
        lines.forEach(function (lineText, lineIndex) {
            var words = lineText.split(" ");
            var line = "";
            words.forEach(function (word, _) {
                var testLine = line + word + " ";
                var testLineWidth = context.measureText(testLine).width;
                if (testLineWidth > chatTextAreaWidth && line !== "") {
                    formattedText += line.trim() + "\n";
                    line = word + " ";
                }
                else {
                    line = testLine;
                }
            });
            formattedText += line.trim() + (lineIndex < lines.length - 1 ? "\n" : "");
        });
        var numLines = formattedText.split("\n").length;
        body.style.setProperty("--chat-height-input", Math.min((Math.ceil((numLines * lineHeight) * 10) / 10), 8) + "em");
    });
    chatTextArea.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            chatButton.dispatchEvent(new Event("click", {}));
        }
        if (e.key === "Enter" && e.shiftKey) {
            setTimeout(function () {
                window.scrollTo(0, document.body.scrollHeight);
            }, 10);
        }
    });
    window.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            e.preventDefault();
            window.scrollTo(0, document.body.scrollHeight);
        }
    });
    chatButton.addEventListener("click", function (e) {
        e.preventDefault();
        if (chatTextArea.value && chatTextArea.value.length <= MAX_MESSAGE_LENGTH) {
            var tempId = generateRandomTempId();
            handleClientMessage(chatTextArea.value, tempId);
            ws.send(JSON.stringify([PayloadType.CLIENT_MESSAGE, chatTextArea.value, tempId]));
            chatTextArea.value = "";
            chatTextArea.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
    document.addEventListener("scroll", function () {
        autoScroll = (window.scrollY + lineHeight * 16 * 5) >= document.body.scrollHeight - window.innerHeight;
        if (autoScroll) {
            chatWarning.classList.remove("visible");
        }
    });
    chatWarning.addEventListener("click", function () {
        window.scrollTo(0, document.body.scrollHeight);
    });
};
connectWebSocket();
setupChat();
