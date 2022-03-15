const express = require("express");
const serverless = require("serverless-http");
const compression = require("compression");
const helmet = require("helmet");
const cors = require("cors");
const history = require("connect-history-api-fallback");
const fetch = require("node-fetch");

require("dotenv").config();

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

if (app.get("env") === "production") {
  app.set("trust proxy", 1);
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(compression());
app.use(cors({ origin: true }));
app.use(history());

app.use(
  express.static("dist/web", {
    maxAge: process.env.CACHE_MAX_AGE || "1d"
  })
);

app.post(
  process.env.AWS_EXECUTION_ENV ? "/.netlify/functions/server/authenticate" : "/authenticate",
  async (req, res) => {
    try {
      const data = await fetch("https://api.formula1.com/v2/account/subscriber/authenticate/by-password", {
        method: "POST",
        body: JSON.stringify({
         // Login: req.body.Login,
          //Password: req.body.Password
          Login: "david.garza.m@hotmail.com",
          Password: "Schumi#1"
        }),
        headers: {
          "User-Agent": "RaceControl f1viewer",
          apiKey: "fCUCjWrKPu9ylJwRAv8BpGLEgiAuThx7",
          "Content-Type": "application/json"
        }
      });

      const json = await data.json();

      res.status(json.Status || 200).json(json);
    } catch (err) {
      console.error(err);

      res.status(500).json(err);
    }
  }
);

if (!process.env.AWS_EXECUTION_ENV) {
  const cors_proxy = require("cors-anywhere").createServer({
    originWhitelist: [],
    requireHeaders: [],
    removeHeaders: []
  });

  app.all("/proxy/:url*", (req, res) => {
    req.url = req.url.replace("/proxy/", "/");

    if (req.headers.playtoken) {
      req.headers.cookie = `playToken=${req.headers.playtoken}`;
    }

    cors_proxy.emit("request", req, res);
  });

  app.get("/playToken", async (req, res) => {
    const url = req.query.url;

    if (!url) {
      res.status(400).send("Unable to get playToken without a URL");
    }

    try {
      const data = await fetch(url, {
        method: "HEAD"
      });

      const playToken = data.headers.get("set-cookie").split(";")[0].split("=")[1];

      res.status(data.status).json({
        playToken
      });
    } catch (err) {
      console.error(err);

      res.status(500).json(err);
    }
  });

  app.listen(PORT, () => console.info(`Server running on port ${PORT}`));
}

process.on("unhandledReject", console.warn);
process.on("uncaughtException", console.error);

module.exports.handler = serverless(app);
