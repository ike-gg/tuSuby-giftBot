import logger, { logLevels } from "../logs/logger.js";
import { sendGift } from "../middleware/subManager.js";
import dotenv from "dotenv";
dotenv.config();

export default (req, res) => {
  if (
    req.headers.auth === process.env.APIAUTHKEY &&
    "channel" in req.body &&
    "user" in req.body &&
    "product" in req.body
  ) {
    const channel = req.body.channel;
    const user = req.body.user;
    const product = req.body.product;
    logger(
      `[auth passed] got request with payload: ${channel}, ${user}, ${product}`,
      logLevels.success
    );
    sendGift(channel, user, product);
    // let intervalId = setInterval(() => {
    //   if (!isDuringGifting) {
    //     isDuringGifting = true;
    //     clearInterval(intervalId);
    //     const giftProcess = fork("./src/subgift.js");
    //     giftProcess.on("close", (code) => {
    //       isDuringGifting = false;
    //       console.log(`Gift process closed with code: ${code}`);
    //       if (code == 0) {
    //         res.status(200).json({
    //           code: code,
    //           giftSent: true,
    //           message: "Gift sent.",
    //         });
    //         console.log("Gift sent.");
    //       } else if (code == 1) {
    //         res.status(200).json({
    //           code: code,
    //           giftSent: false,
    //           message: "Something went wrong.",
    //         });
    //         console.log("Something went wrong.");
    //       } else if (code == 2) {
    //         res.status(200).json({
    //           code: code,
    //           giftSent: false,
    //           message: "There is no any gifts in gifts.json. WEIRD.",
    //         });
    //         console.log("There is no any gifts in gifts.json. WEIRD.");
    //       } else if (code == 3) {
    //         res.status(200).json({
    //           code: code,
    //           giftSent: false,
    //           message: "Channel does not exist.",
    //         });
    //         console.log("Channel does not exist.");
    //       } else if (code == 4) {
    //         res.status(200).json({
    //           code: code,
    //           giftSent: false,
    //           message: "Cant send gift user on this channel.",
    //         });
    //         console.log("Cant send gift user on this channel.");
    //       } else if (code == 5) {
    //         res.status(200).json({
    //           code: code,
    //           giftSent: false,
    //           message: "Cant find user.",
    //         });
    //         console.log("Cant find user.");
    //       } else {
    //         res.status(200).json({
    //           code: "not indentified",
    //           giftSent: false,
    //           message: "Something went wrong. Very weird.",
    //         });
    //         console.log("Something went wrong. Very weird.");
    //       }
    //     });
    //   }
    // }, 2000);
  } else {
    logger(
      `[auth failed] got request with '${req.headers.auth}' auth key.`,
      logLevels.warning
    );
    res.status(401).send({ error: "Unauthorized" });
  }
};
