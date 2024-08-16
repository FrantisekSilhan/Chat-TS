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
var observer;
var exit = false;
var autoScroll = true;
var firstWSOpen = true;
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
    PayloadType[PayloadType["CLIENT_HISTORY"] = 11] = "CLIENT_HISTORY";
    PayloadType[PayloadType["SERVER_HISTORY"] = 12] = "SERVER_HISTORY";
    PayloadType[PayloadType["CLIENT_PRIVATE_HISTORY"] = 13] = "CLIENT_PRIVATE_HISTORY";
    PayloadType[PayloadType["SERVER_PRIVATE_HISTORY"] = 14] = "SERVER_PRIVATE_HISTORY";
    PayloadType[PayloadType["CLIENT_BATCH_USER_DATA"] = 15] = "CLIENT_BATCH_USER_DATA";
    PayloadType[PayloadType["SERVER_BATCH_USER_DATA"] = 16] = "SERVER_BATCH_USER_DATA";
})(PayloadType || (PayloadType = {}));
var emotes = new Map([
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
var EPOCH = 1722893503219n;
var TIMESTAMP_BITS = 46;
var SEQUENCE_BITS = 12;
var ID_BITS = 26;
var USER_DATA_REFRESH = 1000 * 60;
var MAX_MESSAGE_LENGTH = 2000;
var MAX_HISTORY_MESSAGES = 69;
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
    ws.onopen = function () {
        if (firstWSOpen) {
            firstWSOpen = false;
            setupChat();
        }
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
            localStorageManager.setUserData(payload);
            break;
        }
        case PayloadType.WELCOME: {
            localStorageManager.setWelcomeData(payload);
            break;
        }
        case PayloadType.SERVER_MESSAGE: {
            handleServerMessage(payload);
            break;
        }
        case PayloadType.SERVER_HISTORY: {
            handleServerHistory(payload);
            break;
        }
        case PayloadType.SERVER_SUCCESSFUL_MESSAGE: {
            var tempId = payload[0];
            if (pendingSentMessages[tempId]) {
                pendingSentMessages[tempId].resolve(payload[1]);
                delete pendingSentMessages[tempId];
            }
            break;
        }
        case PayloadType.SERVER_BATCH_USER_DATA: {
            var _a = payload, requestId = _a[0], userData = _a[1];
            userData.forEach(function (userData) { return localStorageManager.setUserData(userData); });
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
var pendingUserDataRequests = {};
var pendingBatchUserDataRequests = {};
var pendingSentMessages = {};
var requestSentMessage = function (tempId) {
    return new Promise(function (resolve, reject) {
        pendingSentMessages[tempId] = { resolve: resolve, reject: reject };
    });
};
var requestUserData = function (userId) {
    return new Promise(function (resolve, reject) {
        pendingUserDataRequests[userId] = { resolve: resolve, reject: reject };
        ws.send(JSON.stringify([PayloadType.CLIENT_USER_DATA, userId]));
    });
};
var requestBatchUserData = function (userIds, requestId) {
    return new Promise(function (resolve, reject) {
        pendingBatchUserDataRequests[requestId] = { resolve: resolve, reject: reject };
        ws.send(JSON.stringify([PayloadType.CLIENT_BATCH_USER_DATA, requestId, userIds]));
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
                createChatMessage(true, userId, displayname, color, message, timestamp);
                return [2 /*return*/];
        }
    });
}); };
var handleServerHistory = function (payload) { return __awaiter(_this, void 0, void 0, function () {
    var userDatas, missingUserIds, requestId, fetchedUserData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userDatas = new Map();
                missingUserIds = new Set();
                if (payload.length === 0) {
                    observer.disconnect();
                    return [2 /*return*/];
                }
                payload.forEach(function (_a) {
                    var userId = _a[0];
                    if (!localStorageManager.getUserData(userId)) {
                        missingUserIds.add(userId);
                    }
                });
                if (!(missingUserIds.size > 0)) return [3 /*break*/, 2];
                requestId = generateRandomTempId();
                return [4 /*yield*/, requestBatchUserData(Array.from(missingUserIds), requestId)];
            case 1:
                fetchedUserData = _a.sent();
                fetchedUserData.forEach(function (_a) {
                    var userId = _a[0], userData = _a.slice(1);
                    return userDatas.set(userId, userData);
                });
                _a.label = 2;
            case 2:
                payload.forEach(function (_a) {
                    var userId = _a[0], message = _a[1], timestamp = _a[2];
                    var userData = userDatas.get(userId) || localStorageManager.getUserData(userId);
                    if (!userData) {
                        createChatMessage(false, userId, "User ".concat(userId), "gray", message, timestamp);
                        return;
                    }
                    createChatMessage(false, userId, userData[0], userData[1], message, timestamp);
                });
                window.scrollTo(0, window.scrollY + 1);
                if (document.querySelectorAll(".message").length <= MAX_HISTORY_MESSAGES) {
                    window.scrollTo(0, document.body.scrollHeight);
                }
                return [2 /*return*/];
        }
    });
}); };
var escapeRegExp = function (string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
var formatOutgoingMessage = function (message) {
    emotes.forEach(function (_, key, __) {
        var escapedKey = escapeRegExp(key);
        var regex = new RegExp("(?<!\\S)".concat(escapedKey, "(?!\\S)"), "gi");
        message = message.replaceAll(regex, ":".concat(key, ":"));
    });
    return message.trim();
};
var handleClientMessage = function (message, tempId) { return __awaiter(_this, void 0, void 0, function () {
    var userData, displayname, color, _, formattedMessage, messageId, messageElement, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userData = localStorageManager.getMyData();
                displayname = userData[0], color = userData[1], _ = userData[2];
                formattedMessage = formatOutgoingMessage(message);
                createChatMessage(true, "0", displayname, color, formattedMessage, "", tempId);
                ws.send(JSON.stringify([PayloadType.CLIENT_MESSAGE, formattedMessage, tempId]));
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
    var localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 1000));
    var now = new Date();
    var localNow = new Date(now.getTime() - (now.getTimezoneOffset() * 1000));
    var isToday = localDate.toDateString() === localNow.toDateString();
    var isYesterday = localDate.toDateString() === new Date(localNow.setDate(localNow.getDate() - 1)).toDateString();
    var options = { hour: "2-digit", minute: "2-digit", hourCycle: "h23" };
    if (isToday) {
        return "Today at ".concat(date.toLocaleTimeString([], options));
    }
    else if (isYesterday) {
        return "Yesterday at ".concat(date.toLocaleTimeString([], options));
    }
    else {
        return "".concat(date.toLocaleDateString(), " ").concat(date.toLocaleTimeString([], options));
    }
};
var splitStringByRegex = function (inputString, regexPattern) {
    var result = [];
    var lastIndex = 0;
    var match;
    while ((match = regexPattern.exec(inputString)) !== null) {
        result.push(inputString.slice(lastIndex, match.index));
        result.push(match[0]);
        lastIndex = regexPattern.lastIndex;
    }
    result.push(inputString.slice(lastIndex));
    return result.filter(function (n) { return n !== ""; });
};
var render = function (message, textElement) {
    var httpRegex = /https?:\/\/(www\.)?[-a-zA-Z-1-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(:\d{1,5})?([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
    var regex = new RegExp("".concat(httpRegex.source, "|:[a-zA-Z0-9]{1,9}:"), "gi");
    var divided = splitStringByRegex(message, regex);
    var videoRegex = /\.mp4|\.webm|\.mov$/;
    var videoLink = "";
    var imageRegex = /\.png|\.jpg|\.jpeg|\.webp|\.avif|\.gif$/;
    var imageLink = "";
    divided.forEach(function (text) {
        if (httpRegex.test(text)) {
            if (videoLink === "" && videoRegex.test(text)) {
                videoLink = text;
                if (divided.length === 1)
                    return;
            }
            else if (imageLink === "" && imageRegex.test(text)) {
                imageLink = text;
                if (divided.length === 1)
                    return;
            }
            var link = document.createElement("a");
            link.href = text;
            link.target = "_blank";
            link.textContent = text;
            link.classList.add("message__link");
            textElement.insertAdjacentElement("beforeend", link);
            return;
        }
        else if (text.startsWith(":") && text.endsWith(":")) {
            var link = emotes.get(text.slice(1, -1));
            if (link) {
                var picture = document.createElement("picture");
                picture.classList.add("message__emote");
                var src = document.createElement("source");
                src.srcset = "".concat(link, ".avif");
                src.type = "image/avif";
                var img = document.createElement("img");
                img.src = "".concat(link, ".webp");
                img.alt = text;
                picture.appendChild(src);
                picture.appendChild(img);
                textElement.insertAdjacentElement("beforeend", picture);
                return;
            }
        }
        if (text === "")
            return;
        var span = document.createElement("span");
        span.textContent = text;
        textElement.insertAdjacentElement("beforeend", span);
    });
    if (videoLink !== "") {
        var video = document.createElement("video");
        video.classList.add("message__media");
        video.controls = true;
        video.src = videoLink;
        textElement.insertAdjacentElement("beforeend", video);
    }
    else if (imageLink !== "") {
        var img = document.createElement("img");
        img.classList.add("message__media");
        img.src = imageLink;
        textElement.insertAdjacentElement("beforeend", img);
    }
};
var createChatMessage = function (isNew, userId, displayname, color, message, timestamp, tempId) {
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
    if (messageText.children.length <= 3 && Array.from(messageText.children).every(function (child) { return child.tagName === "PICTURE"; })) {
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
    var chatElement = document.getElementById("chat");
    var chatWarning = document.getElementById("chat-warning");
    if (!chatElement || !chatWarning) {
        console.error("Chat elements not found");
        return;
    }
    if (isNew) {
        var lastMessage = chatElement.lastElementChild;
        if (lastMessage && lastMessage.dataset.userId !== userId) {
            messageElement.classList.add("message--spacing");
        }
        chatElement.appendChild(messageElement);
    }
    else {
        var lastMessage = chatElement.firstElementChild;
        if (lastMessage && lastMessage.dataset.userId !== userId) {
            messageElement.classList.add("message--spacing2");
        }
        chatElement.prepend(messageElement);
    }
    if (!isNew)
        return;
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
        if (pendingUserDataRequests[userId]) {
            pendingUserDataRequests[userId].resolve(userData);
            delete pendingUserDataRequests[userId];
        }
        userData[2] = timestampToDate(userData[2])[0].toString();
        localStorage.setItem(userId, JSON.stringify(userData));
    },
    setWelcomeData: function (payload) {
        var userId = payload[0], userData = payload.slice(1);
        localStorage.setItem("me", JSON.stringify(__spreadArray(__spreadArray([], userData, true), [Date.now().toString()], false)));
        localStorage.setItem("meId", JSON.stringify([userId]));
    },
    getUserData: function (userId) {
        var userData = localStorage.getItem(userId);
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
    var chat = document.getElementById("chat");
    var observerElement = document.getElementById("observer");
    var chatTextArea = document.getElementById("chat-textarea");
    var chatButton = document.getElementById("chat-button");
    var chatWarning = document.getElementById("chat-warning");
    var body = document.getElementsByTagName("body")[0];
    var lineHeight = parseFloat(getComputedStyle(body).getPropertyValue("--chat-line-height"));
    if (!chatTextArea || !chatButton || !chatWarning || !chat || !observerElement) {
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
    observer = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
            var firstMessage = chat.querySelector(".message");
            if (!firstMessage) {
                ws.send(JSON.stringify([PayloadType.CLIENT_HISTORY, "0"]));
                return;
            }
            var firstMessageTimestamp = firstMessage.dataset.timestamp;
            ws.send(JSON.stringify([PayloadType.CLIENT_HISTORY, firstMessageTimestamp]));
        }
    }, { threshold: 0 });
    observer.observe(observerElement);
};
connectWebSocket();
