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
        default:
            console.log(data);
            break;
    }
};
var pendingUserDataRequests = {};
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
var createChatMessage = function (displayname, color, message, timestamp) {
    var messageElement = document.createElement("li");
    var displaynameElement = document.createElement("span");
    var timestampElement = document.createElement("span");
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
    var chatElement = document.getElementById("chat");
    if (!chatElement) {
        console.error("Chat element not found");
        return;
    }
    chatElement.appendChild(messageElement);
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
        var stringUserId = userId.toString();
        if (pendingUserDataRequests[stringUserId]) {
            pendingUserDataRequests[stringUserId].resolve(userData);
            delete pendingUserDataRequests[stringUserId];
        }
        localStorage.setItem(stringUserId, JSON.stringify(__spreadArray(__spreadArray([], userData, true), [Date.now().toString()], false)));
    },
    getUserData: function (userId) {
        var userData = localStorage.getItem(userId.toString());
        return userData ? JSON.parse(userData) : null;
    },
};
connectWebSocket();
