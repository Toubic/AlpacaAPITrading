import Express from "express";
import Alpaca from "@alpacahq/alpaca-trade-api";
import WebSocket, { WebSocketServer } from "ws";

const app = Express();
app.use(Express.static("public"));
const alpaca = new Alpaca(); // Looks at the .env file for the API keys automatically

const wsa: WebSocket = new WebSocket("wss://stream.data.alpaca.markets/v1beta1/news");
const wss = new WebSocketServer({ port: Number(process.env.PORT) || 3001 });

type News = {
    headline: string,
    summary: string,
    url: string,
    stockTickers: string
}

const news: News = {
    headline: "",
    summary: "",
    url: "",
    stockTickers: "",
}

wsa.on("open", () => {
    console.log("Connected to the Alpaca API");

    const authMessage = {
        action: "auth",
        key: process.env.APCA_API_KEY_ID,
        secret: process.env.APCA_API_SECRET_KEY,
    };

    wsa.send(JSON.stringify(authMessage)); 

    // Subscribe to all news feeds
    const subscribeMessage = {
        action: "subscribe",
        news: ["*"],
    };
    wsa.send(JSON.stringify(subscribeMessage));
});

wsa.on("message", async (message: string) => {
    
    const currentEvent = JSON.parse(message)[0];
    let stockTickers: string = "";

    console.log(currentEvent);

    if(currentEvent.T === "n") {
        news.headline = currentEvent.headline;
        news.summary = currentEvent.summary;
        news.url = currentEvent.url;
        currentEvent.symbols.forEach((symbol: string) => {
            if(symbol.includes("USD")) // Handle cryptocurrency symbols for correct hyperlinks
                symbol = symbol.replace("USD", "-USD");
            stockTickers += `<a href="https://finance.yahoo.com/quote/${symbol}/" target="_blank">${symbol}</a>,`;
        });

        stockTickers = stockTickers.slice(0, -1);
        news.stockTickers = stockTickers;

        wss.clients.forEach(client => {
            if (client.readyState === 1) { // Check if connection to client is open
                client.send(JSON.stringify(news));
            }
        });
    }
});

app.get("/", function (req, res) {
    res.sendFile("index.html");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("App listening on port 3000");
});