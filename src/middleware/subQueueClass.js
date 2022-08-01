import readCookies from "../utils/readCookies.js";
import logger, { logLevels } from "../logs/logger.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { fork } = require("child_process");
// import Fork from "child_process";
// const fork = Fork.fork;

class SubQueue {
  constructor(pathToScriptProcess) {
    this.scriptProcess = pathToScriptProcess;
    this.isBusy = false;
    this.queue = [];
    this.cookies;
    this.processPrefix = "";

    this.setCookies();
  }

  addSubToQueue(channel, user, product) {
    this.queue.push({ channel, user, product });
    logger(
      `${this.processPrefix} added sub to queue (${channel}, ${user}, ${product})`
    );
    if (this.isBusy) return;
    this.controller();
  }

  controller() {
    if (this.queue.length) {
      this.isBusy = true;
      const sub = this.queue.shift();
      const { channel, user, product } = sub;
      logger(
        `${this.processPrefix} running gift process (${channel}, ${user}, ${product})`,
        logLevels.info
      );
      const subProcess = fork(this.scriptProcess, [
        channel,
        user,
        product,
        JSON.stringify(this.cookies.cookies),
      ]);

      subProcess.send;
      subProcess.on("close", (code) => {
        if (code == 0) {
          console.log("Gift sent.");
        } else if (code == 1) {
          console.log("Something went wrong.");
        } else if (code == 2) {
          console.log("There is no any gifts in gifts.json. WEIRD.");
        } else if (code == 3) {
          console.log("Channel does not exist.");
        } else if (code == 4) {
          console.log("Cant send gift user on this channel.");
        } else if (code == 5) {
          console.log("Cant find user.");
        }
      });
      this.controller();
    } else {
      this.isBusy = false;
    }
  }

  setCookies(nickname) {
    const cookies = readCookies();
    this.cookies = cookies[0];
    this.processPrefix = `[${this.cookies.name} ACC]`;
    // this.cookies = cookies[0];
  }
}

export default SubQueue;
