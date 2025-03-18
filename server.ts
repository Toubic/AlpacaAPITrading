import Express from "express";
import Alpaca from "@alpacahq/alpaca-trade-api";
import WebSocket from "ws";

const app = Express();
const alpaca = new Alpaca(); // Looks at the .env file for the API keys automatically

const wss: WebSocket = new WebSocket("wss://stream.data.alpaca.markets/v1beta1/news");

type News = {
    headline: string,
    summary: string,
    stockTickers: string
}

const news: News = {
    headline: "",
    summary: "",
    stockTickers: "",
}

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
        news: ["*"],
    };
    wss.send(JSON.stringify(subscribeMessage));
});

wss.on("message", async (message: string) => {
    
    const currentEvent = JSON.parse(message)[0];
    let stockTickers: string = "";

    console.log(currentEvent);

    if(currentEvent.T === "n") {
        news.headline = currentEvent.headline;
        news.summary = currentEvent.summary;
        currentEvent.symbols.forEach((symbol: string) => {
            stockTickers += `${symbol},`;
        });

        stockTickers = stockTickers.slice(0, -1);
        news.stockTickers = stockTickers;
    }
});

app.get("/", function (req, res) {
    news.headline !== "" ? res.send(`<div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; background-color: aliceblue;"><h1>${news.headline} [${news.stockTickers}]</h1></br><p>${news.summary}</p></div>`) : res.send(`<div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; background-color: aliceblue;"><h1>No news</h1></div>`);
  });

app.listen(3000, () => {
    console.log("App listening on port 3000");
});