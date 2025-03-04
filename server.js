const Alpaca = require("@alpacahq/alpaca-trade-api");
const alpaca = new Alpaca(); // Looks at the .env file for the API keys automatically

const WebSocket = require("ws");

const wss = new WebSocket("wss://paper-api.alpaca.markets/stream");
wss.on("open", () => {
    console.log("Connected to Alpaca API");

    const authMessage = {
        action: "auth",
        key: process.env.APCA_API_KEY_ID,
        secret: process.env.APCA_API_SECRET,
    };
    wss.send(JSON.stringify(authMessage));

    // Subscribe to all news feeds
    const subscribeMessage = {
        action: "subscribe",
        news: ["*"],
    };
    wss.send(JSON.stringify(subscribeMessage));
});

wss.on("message", async (message) => {
    console.log(message);
});

