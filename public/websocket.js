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
})(PayloadType || (PayloadType = {}));
var connectWebSocket = function () {
    var host = window.location.host;
    ws = new WebSocket("wss://".concat(host));
    ws.onmessage = function (event) {
        var data = JSON.parse(event.data);
        switch (data[0]) {
            case PayloadType.SERVER_CLOSE:
                exit = true;
                break;
            default:
                console.log(data);
                break;
        }
    };
    ws.onclose = function () {
        if (exit) {
            return;
        }
        setTimeout(connectWebSocket, 3000);
    };
};
connectWebSocket();
