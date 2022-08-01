import express from "express";
import bodyParser from "body-parser";
import logger from "./logs/logger.js";
import dotenv from "dotenv";
dotenv.config();

import apiHandler from "./apiHandler.js";

const app = express();

app.use(bodyParser.json());
app.listen(80, () => {
  console.log("Api is running on port 80.");
});

apiHandler(app);

if (!process.env.APIAUTHKEY) {
  logger("[error] APIAUTHKEY is not defined in .env file.", "error");
  process.exit(0);
}

import readCookies from "./utils/readCookies.js";
