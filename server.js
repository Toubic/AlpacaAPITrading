const Alpaca = require("@alpacahq/alpaca-trade-api");
const alpaca = new Alpaca(); // Looks at the .env file for the API keys automatically

const WebSocket = require("ws");

const wss = new WebSocket("wss://stream.data.alpaca.markets/v1beta1/news");

wss.on("open", () => {
    console.log("Connected to the Alpaca API");

    const authMessage = {
        action: "auth",
        key: process.env.APCA_API_KEY_ID,
        secret: process.env.APCA_API_SECRET_KEY,
    };

    wss.send(JSON.stringify(authMessage)); 

    // Subscribe to all news feeds
    const subscribeMessage = {
        action: "subscribe",
        news: ["*"] ,
    };
    wss.send(JSON.stringify(subscribeMessage));
});

wss.on("message", async (message) => {
    
    const currentEvent = JSON.parse(message)[0];

    console.log(currentEvent);

    if(currentEvent.T === "n") {
        console.log(currentEvent.headline);
    }
});

