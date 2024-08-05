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
}

const connectWebSocket = () => {
  const host = window.location.host;

  ws = new WebSocket(`wss://${host}`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    switch (data[0]) {
      case PayloadType.SERVER_CLOSE:
        exit = true;
        break;
      default:
        console.log(data);
        break;
    }
  };

  ws.onclose = () => {
    if (exit) {
      return;
    }
    setTimeout(connectWebSocket, 3000);
  };
};

connectWebSocket();